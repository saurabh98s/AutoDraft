from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class ComplianceIssue(BaseModel):
    severity: str = Field(description="Severity level: high, medium, or low")
    category: str = Field(description="Category of the issue: mission_alignment, regulatory, format, or other")
    description: str = Field(description="Description of the compliance issue")
    suggestion: str = Field(description="Suggestion for fixing the issue")

class ComplianceCheckResult(BaseModel):
    compliant: bool = Field(description="Whether the content is compliant")
    issues: List[ComplianceIssue] = Field(description="List of compliance issues found")
    score: float = Field(description="Compliance score from 0 to 100")

class ComplianceService:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model_name="gpt-4"
        )
        self.parser = PydanticOutputParser(pydantic_object=ComplianceCheckResult)
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a grant compliance checker. Analyze the provided content for:
            1. Mission alignment with the organization
            2. Regulatory compliance
            3. Format and structure requirements
            4. Best practices for grant writing
            
            Return a detailed compliance report."""),
            ("human", "{content}"),
            ("human", "Organization mission: {mission}"),
            ("human", "Grant requirements: {requirements}")
        ])

    def check_compliance(
        self,
        content: str,
        mission: str,
        requirements: str
    ) -> ComplianceCheckResult:
        """Check content for compliance issues"""
        try:
            # Format the prompt
            formatted_prompt = self.prompt.format_messages(
                content=content,
                mission=mission,
                requirements=requirements
            )
            
            # Get response from LLM
            response = self.llm.invoke(formatted_prompt)
            
            # Parse the response
            result = self.parser.parse(response.content)
            return result
            
        except Exception as e:
            # Return a default result in case of error
            return ComplianceCheckResult(
                compliant=False,
                issues=[
                    ComplianceIssue(
                        severity="high",
                        category="other",
                        description=f"Error during compliance check: {str(e)}",
                        suggestion="Please try again or contact support"
                    )
                ],
                score=0.0
            )

    def check_mission_alignment(
        self,
        content: str,
        mission: str
    ) -> Dict[str, Any]:
        """Specifically check mission alignment"""
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "Analyze how well the content aligns with the organization's mission."),
                ("human", f"Organization mission: {mission}"),
                ("human", f"Content to analyze: {content}")
            ])
            
            response = self.llm.invoke(prompt)
            
            # Parse the response into a structured format
            return {
                "alignment_score": float(response.content.split("Score:")[1].split()[0]),
                "analysis": response.content,
                "suggestions": response.content.split("Suggestions:")[1].strip()
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "alignment_score": 0.0,
                "analysis": "Error during mission alignment check",
                "suggestions": "Please try again or contact support"
            }

# Initialize global compliance service
compliance_service = ComplianceService() 