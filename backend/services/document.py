from __future__ import annotations
"""DocumentService — outline, section drafting, draft improvement, and
basic document assembly helpers.

Adds **format_document** and **assemble_final_document** so that
`main.py` can import them without errors.  The new assembly helper writes
a Markdown file to `generated/<project_id>/...` and returns its path.
Functionality is intentionally minimal; you can extend it later to
DOCX/PDF if needed.
"""

import os, json, asyncio, logging, uuid
from typing import List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser

load_dotenv()
logger = logging.getLogger(__name__)

# --------------------------- Pydantic ---------------------------
class Section(BaseModel):
    title: str = Field(description="Title of the section")
    content: str = Field(description="Content of the section")

class OutlineResult(BaseModel):
    sections: List[Section]
    feedback: str

# ------------------------- Core Service ------------------------
class _DocumentService:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(
            temperature=0.2,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model_name="gpt-3.5-turbo",
        )
        self.outline_parser = PydanticOutputParser(pydantic_object=OutlineResult)

        # -------- Outline prompt (safe insertion) -------------
        self.outline_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a grant writing assistant. Create an outline for a grant proposal based on the provided information and requirements. The outline should include appropriate sections for a complete grant proposal.\n\nFollow these guidelines:\n1. Include standard sections like Introduction, Project Description, Goals/Objectives, Methodology, Budget, etc.\n2. Tailor the outline to the specific grant requirements if provided\n3. Each section should have a brief description of what content would go there\n4. Provide feedback on the overall structure\n\n{format_instructions}""",
                ),
                ("human", "Grant Type: {grant_type}"),
                ("human", "Project Idea: {project_idea}"),
                ("human", "Grant Requirements: {requirements}"),
            ]
        )

        self.draft_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a grant writing assistant. Write a complete draft for the specified section of a grant proposal.\n\nFollow these guidelines:\n1. Use a professional, clear, and persuasive tone appropriate for grant applications\n2. Include specific details from the project idea and requirements\n3. Focus on addressing the funder's priorities\n4. Use data and evidence where appropriate\n5. Be concise but comprehensive",
                ),
                ("human", "Section to draft: {section_title}"),
                ("human", "Project Idea: {project_idea}"),
                ("human", "Grant Requirements: {requirements}"),
                ("human", "Outline of the section: {section_outline}"),
            ]
        )

        self.improvement_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a grant writing expert. Improve the provided draft based on best practices for grant writing.\n\nFocus on:\n1. Clear and concise language\n2. Specificity and data-driven statements\n3. Addressing funder priorities\n4. Using active voice and persuasive language\n5. Logical flow and structural coherence",
                ),
                ("human", "Draft to improve: {draft}"),
                ("human", "Grant Requirements: {requirements}"),
                ("human", "Improvement focus: {focus}"),
            ]
        )

    # ---------------- internal helper ----------------------
    def _run(self, prompt: ChatPromptTemplate, parser=None, **kwargs):
        msgs = prompt.format_messages(
            format_instructions=(parser.get_format_instructions() if parser else ""),
            **kwargs,
        )
        raw = self.llm(msgs)
        if parser is None:
            return raw
        try:
            return parser.parse(raw)
        except Exception:
            txt = raw
            if "```json" in txt:
                txt = txt.split("```json")[1].split("```")[0]
            return parser.parse(json.loads(txt))

    # ---------------- public sync API ----------------------
    def generate_outline(self, grant_type: str, project_idea: str, requirements: str = "") -> OutlineResult:
        return self._run(
            self.outline_prompt,
            parser=self.outline_parser,
            grant_type=grant_type,
            project_idea=project_idea,
            requirements=requirements,
        )

    def draft_section(self, section_title: str, section_outline: str, project_idea: str, requirements: str = "") -> str:
        return self._run(
            self.draft_prompt,
            parser=None,
            section_title=section_title,
            section_outline=section_outline,
            project_idea=project_idea,
            requirements=requirements,
        )

    def improve_draft(self, draft: str, requirements: str = "", focus: str = "general") -> str:
        return self._run(
            self.improvement_prompt,
            parser=None,
            draft=draft,
            requirements=requirements,
            focus=focus,
        )

_service = _DocumentService()

# ---------------- exported async wrappers -----------------
async def generate_outline(grant_type: str, project_idea: str, requirements: str = "") -> Dict[str, Any]:
    res: OutlineResult = await asyncio.to_thread(_service.generate_outline, grant_type, project_idea, requirements)
    return {"sections": [s.dict() for s in res.sections], "feedback": res.feedback}

async def draft_section(section_title: str, section_outline: str, project_idea: str, requirements: str = "") -> Dict[str, Any]:
    txt = await asyncio.to_thread(_service.draft_section, section_title, section_outline, project_idea, requirements)
    return {"content": txt}

async def improve_draft(draft: str, requirements: str = "", focus: str = "general") -> Dict[str, Any]:
    txt = await asyncio.to_thread(_service.improve_draft, draft, requirements, focus)
    return {"improved_content": txt}

# ------------------------------------------------------------------
# New helpers required by main.py
# ------------------------------------------------------------------

def format_document(document_content: List[Dict[str, str]]) -> str:
    """Return a single Markdown string combining all sections."""
    parts = [f"# {sec['title']}\n\n{sec['content']}" for sec in document_content]
    return "\n\n".join(parts)

async def assemble_final_document(document_content: List[Dict[str, str]], project_id: str, document_type: str = "proposal") -> str:
    """Write the combined Markdown to disk and return the path.

    The file is saved under `generated/<project_id>/<document_type>_<uuid>.md`.
    """
    md_text = format_document(document_content)
    base_dir = Path("generated") / project_id
    base_dir.mkdir(parents=True, exist_ok=True)
    file_name = f"{document_type}_{uuid.uuid4().hex}.md"
    file_path = base_dir / file_name
    await asyncio.to_thread(file_path.write_text, md_text, encoding="utf-8")
    return str(file_path)
