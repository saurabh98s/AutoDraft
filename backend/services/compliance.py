from __future__ import annotations
"""LLM‑powered compliance & gap‑analysis service.

Exports **two coroutine helpers** (`check_compliance`, `perform_gap_analysis`) so
existing FastAPI code can import them directly:

```python
from services.compliance import check_compliance, perform_gap_analysis
```

Compatible with both legacy `langchain==0.0.267` and the split
`langchain‑core/community` packages.
"""

import os, json, asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser

load_dotenv()

# -------------------- Pydantic schemas --------------------
class ComplianceIssue(BaseModel):
    severity: str = Field(..., description="high | medium | low")
    category: str = Field(..., description="mission_alignment | regulatory | format | other")
    description: str
    suggestion: str

class ComplianceCheckResult(BaseModel):
    compliant: bool
    issues: List[ComplianceIssue]
    score: float

class GapAnalysisItem(BaseModel):
    section: str
    gap_description: str
    importance: str  # critical | high | medium | low
    recommendation: str

class GapAnalysisResult(BaseModel):
    complete: bool
    gaps: List[GapAnalysisItem]
    completeness_score: float
    overall_assessment: str

# -------------------- Core service ------------------------
class _ComplianceService:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(
            temperature=0.0,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model_name="gpt-3.5-turbo",
        )
        self.compliance_parser = PydanticOutputParser(pydantic_object=ComplianceCheckResult)
        self.gap_parser = PydanticOutputParser(pydantic_object=GapAnalysisResult)

        # ---------- Prompt templates (use {format_instructions}) ----------
        self.compliance_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a grant compliance checker. Analyse the proposal for mission alignment, regulatory issues, formatting problems, and grant‑writing best practices.\n\n{format_instructions}""",
                ),
                ("human", "{content}"),
                ("human", "Organisation mission:\n{mission}"),
                ("human", "Grant requirements:\n{requirements}"),
            ]
        )
        self.gap_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a grant proposal evaluator. Identify gaps or weaknesses in the sections below.\n\n{format_instructions}""",
                ),
                ("human", "{content}"),
                ("human", "Grant requirements:\n{requirements}"),
            ]
        )

    # ---------------- internal helper ---------------------
    def _run(self, prompt: ChatPromptTemplate, parser, **kwargs):
        messages = prompt.format_messages(
            format_instructions=parser.get_format_instructions(), **kwargs
        )
        raw = self.llm(messages)
        try:
            return parser.parse(raw)
        except Exception:
            txt = raw
            if "```json" in txt:
                txt = txt.split("```json")[1].split("```")[0]
            return parser.parse(json.loads(txt))

    # ---------------- public sync API ---------------------
    def compliance(self, content: str, mission: str = "", requirements: str = "") -> ComplianceCheckResult:
        return self._run(self.compliance_prompt, self.compliance_parser, content=content, mission=mission, requirements=requirements)

    def gap_analysis(self, content: str, requirements: str = "") -> GapAnalysisResult:
        return self._run(self.gap_prompt, self.gap_parser, content=content, requirements=requirements)

# singleton instance
_service = _ComplianceService()

# ---------------- exported async helpers -----------------
async def check_compliance(content: str, project_id: str | None = None) -> Dict[str, Any]:
    """Async helper retained for backward compatibility with FastAPI routes."""
    # TODO: fetch mission and requirements from DB via project_id if needed
    mission = "Improving education and environmental sustainability in underserved communities"
    requirements = "Projects must focus on sustainability, include clear metrics, and have community involvement"
    result: ComplianceCheckResult = await asyncio.to_thread(
        _service.compliance, content, mission, requirements
    )
    return result.dict()

async def perform_gap_analysis(content: str, project_id: str | None = None) -> Dict[str, Any]:
    """Async helper retained for backward compatibility."""
    requirements = "Projects must focus on sustainability, include clear metrics, and have community involvement"
    result: GapAnalysisResult = await asyncio.to_thread(
        _service.gap_analysis, content, requirements
    )
    return result.dict()