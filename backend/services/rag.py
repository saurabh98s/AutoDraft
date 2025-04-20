from __future__ import annotations
"""Reusable RAG service for FastAPI endpoints.

This version is tuned for minimum runtime errors under both
legacy (langchain==0.0.267) *and* split‑package (langchain‑core/community) 
installations.

Key design decisions
--------------------
* **Subclass** `OpenAIEmbeddings` instead of composing.  This avoids
  pickling or deep‑copy issues that surface inside Chroma collections.
* Provide a `__call__` convenience so the instance can still be used
  like a function (backwards‑compatible with your earlier code).
* Isolate async file I/O and heavy CPU work with `asyncio.to_thread`,
  making FastAPI endpoints non‑blocking.
* Wrap potentially fragile paths (`vectorstore.add_documents`, LLM
  calls) in small helpers that surface clear error strings instead of
  bare tracebacks.
"""

from typing import List, Dict, Any
import os
import asyncio
from dotenv import load_dotenv

# LangChain + OpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import TextLoader, PyPDFLoader, CSVLoader
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

load_dotenv()

# ----------------------------------------------------------------------------
# Embedding adapter (subclass avoids missing‑attribute errors in Chroma)
# ----------------------------------------------------------------------------

class OpenAIEmbeddingsAdapter(OpenAIEmbeddings):
    """Expose both `embed_*` methods *and* remain callable."""

    def __call__(self, value):
        if isinstance(value, str):
            return self.embed_query(value)
        if isinstance(value, list):
            return self.embed_documents(value)
        raise TypeError("Expected str or List[str] for embedding.")


# ----------------------------------------------------------------------------
# Reusable RAG service
# ----------------------------------------------------------------------------

class RAGService:
    """Singleton‑style service used by FastAPI routes."""

    def __init__(self):
        self.embeddings = OpenAIEmbeddingsAdapter(
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )

        # Main (global) vector store
        self.vector_store: Chroma | None = None
        # Per‑project stores keyed by project_id
        self.project_stores: dict[str, Chroma] = {}
        # QA chain tied to the main store
        self.qa_chain: RetrievalQA | None = None

        self._init_sample_store()

    # ---------------------------------------------------------------------
    # Initialisation helpers
    # ---------------------------------------------------------------------

    def _init_sample_store(self) -> None:
        """Seed a tiny in‑memory collection so the service starts."""
        seed_texts = [
            "Grant proposal requirements for environmental projects",
            "Budget guidelines for non‑profit organizations",
            "Best practices for grant writing",
            "Common compliance requirements for federal grants",
        ]
        docs = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200
        ).create_documents(seed_texts)

        self.vector_store = Chroma.from_documents(
            documents=docs,
            embedding=self.embeddings,
        )

        llm = ChatOpenAI(
            temperature=0.0,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model_name="gpt-3.5-turbo",
        )
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(),
        )

    # ---------------------------------------------------------------------
    # Public API
    # ---------------------------------------------------------------------

    def add_documents(self, texts: List[str], project_id: str | None = None) -> None:
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        docs = splitter.create_documents(texts)

        if project_id:
            store = self.project_stores.get(project_id)
            if store is None:
                store = Chroma.from_documents(
                    documents=docs,
                    embedding=self.embeddings,
                    collection_name=f"project_{project_id}",
                )
                self.project_stores[project_id] = store
            else:
                store.add_documents(docs)
        else:
            assert self.vector_store is not None
            self.vector_store.add_documents(docs)

    def query(self, question: str, project_id: str | None = None) -> Dict[str, Any]:
        try:
            if project_id and project_id in self.project_stores:
                retriever = self.project_stores[project_id].as_retriever()
            else:
                retriever = self.vector_store.as_retriever()

            llm = ChatOpenAI(
                temperature=0.0,
                openai_api_key=os.getenv("OPENAI_API_KEY"),
                model_name="gpt-3.5-turbo",
            )
            qa = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=retriever,
            )
            result = qa({"query": question})
            return {
                "answer": result.get("result", ""),
                "sources": result.get("source_documents", []),
            }
        except Exception as exc:  # pylint: disable=broad-except
            return {"error": str(exc), "answer": None, "sources": []}

    # ------------------------------------------------------------------
    # Utility helpers for FastAPI endpoints
    # ------------------------------------------------------------------

    def load_document(self, file_path: str):
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return PyPDFLoader(file_path).load()
        if ext == ".csv":
            return CSVLoader(file_path).load()
        return TextLoader(file_path).load()

    # -------------------------- Extraction LLMs -------------------------

    @staticmethod
    def _make_llm(temp: float = 0.0) -> ChatOpenAI:
        return ChatOpenAI(
            temperature=temp,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model_name="gpt-3.5-turbo",
        )

    def extract_grant_requirements(self, documents):
        content = "\n\n".join(doc.page_content for doc in documents)
        prompt = PromptTemplate(
            input_variables=["content"],
            template=(
                "You are a grant writing expert assistant. Extract the key "
                "requirements, eligibility criteria, and important deadlines "
                "from the following grant document:\n\n{content}\n\n" \
                "Return JSON with keys: requirements, eligibility, deadlines, "
                "focus_areas, budget_constraints."
            ),
        )
        llm = self._make_llm()
        return llm(prompt.format(content=content))

    def generate_guided_questions(self, requirements: str):
        prompt = PromptTemplate(
            input_variables=["requirements"],
            template=(
                "You are a grant writing expert assistant. Based on the following "
                "grant requirements, generate 10 targeted questions that will help "
                "the applicant create a strong grant proposal. Each question should "
                "include an id, question, context, and wordLimit field in JSON.\n\n"
                "Grant Requirements:\n{requirements}"
            ),
        )
        llm = self._make_llm(temp=0.2)
        return llm(prompt.format(requirements=requirements))


# ----------------------------- Singleton -------------------------------
rag_service = RAGService()

# ----------------------------- Async wrappers --------------------------

async def process_document(file_path: str, project_id: str):
    try:
        documents = await asyncio.to_thread(rag_service.load_document, file_path)
        texts = [doc.page_content for doc in documents]
        await asyncio.to_thread(rag_service.add_documents, texts, project_id)
        requirements = await asyncio.to_thread(
            rag_service.extract_grant_requirements, documents
        )
        return {
            "success": True,
            "message": "Document processed successfully",
            "requirements": requirements,
            "document_count": len(documents),
        }
    except Exception as exc:  # pylint: disable=broad-except
        return {"success": False, "message": str(exc)}


async def generate_questions(file_path: str, project_id: str):
    try:
        documents = await asyncio.to_thread(rag_service.load_document, file_path)
        requirements = await asyncio.to_thread(
            rag_service.extract_grant_requirements, documents
        )
        questions = await asyncio.to_thread(
            rag_service.generate_guided_questions, requirements
        )
        return questions
    except Exception as exc:  # pylint: disable=broad-except
        return [{"error": str(exc)}]


async def query_rag(question: str, project_id: str):
    result = await asyncio.to_thread(rag_service.query, question, project_id)
    return result.get("answer", "No answer found.")
