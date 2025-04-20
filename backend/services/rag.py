from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import TextLoader
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
import os
from dotenv import load_dotenv
from typing import List, Dict, Any

load_dotenv()

class RAGService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        self.vector_store = None
        self.qa_chain = None
        self.initialize()

    def initialize(self):
        # Initialize vector store with sample data
        # In production, this would load from your document database
        sample_texts = [
            "Grant proposal requirements for environmental projects",
            "Budget guidelines for non-profit organizations",
            "Best practices for grant writing",
            "Common compliance requirements for federal grants"
        ]
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        documents = text_splitter.create_documents(sample_texts)
        self.vector_store = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings
        )
        
        # Initialize QA chain
        llm = ChatOpenAI(
            temperature=0,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model_name="gpt-4"
        )
        
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever()
        )

    def add_documents(self, texts: List[str]):
        """Add new documents to the vector store"""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        documents = text_splitter.create_documents(texts)
        self.vector_store.add_documents(documents)

    def query(self, question: str) -> Dict[str, Any]:
        """Query the RAG system"""
        try:
            result = self.qa_chain({"query": question})
            return {
                "answer": result["result"],
                "sources": result.get("source_documents", [])
            }
        except Exception as e:
            return {
                "error": str(e),
                "answer": None,
                "sources": []
            }

    def get_similar_documents(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        """Get similar documents for a query"""
        try:
            docs = self.vector_store.similarity_search(query, k=k)
            return [
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata
                }
                for doc in docs
            ]
        except Exception as e:
            return []

# Initialize global RAG service
rag_service = RAGService() 