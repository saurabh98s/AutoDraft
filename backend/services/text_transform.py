from __future__ import annotations
"""LLM-powered text transformation service.

Exports an async function for transforming text according to various instructions.
"""

import os, asyncio
from typing import Dict, Any
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

load_dotenv()

# -------------------- Pydantic schemas --------------------
class TextTransformRequest(BaseModel):
    text: str = Field(..., description="The text to transform")
    transformation_type: str = Field(..., description="Type of transformation to apply")
    custom_instruction: str = Field("", description="Custom instructions if provided")

class TextTransformResult(BaseModel):
    transformed_text: str = Field(..., description="The transformed text")
    original_text: str = Field(..., description="The original text")

# -------------------- Core service ------------------------
class _TextTransformService:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(
            temperature=0.2,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model_name="gpt-3.5-turbo",
        )
        
        # Create prompts for different transformation types
        self.transform_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert text editor. Transform the provided text according to the specified instructions.
            
            Be faithful to the original meaning unless explicitly instructed otherwise.
            Focus on improving the text while preserving the author's voice.
            Return ONLY the transformed text, with no additional commentary.
            """),
            ("human", "Original text: {text}"),
            ("human", "Transformation: {transformation}"),
            ("human", "Instructions: {custom_instruction}")
        ])
    
    async def transform_text(self, text: str, transformation_type: str, custom_instruction: str = "") -> str:
        """Transform text according to the specified transformation type and custom instructions."""
        try:
            # Determine transformation instruction based on type
            transformation = self._get_transformation_instruction(transformation_type)
            
            # Format the prompt
            messages = self.transform_prompt.format_messages(
                text=text,
                transformation=transformation,
                custom_instruction=custom_instruction
            )
            
            # Generate the transformed text
            response = await asyncio.to_thread(self.llm, messages)
            
            return response.content.strip()
        except Exception as e:
            print(f"Error transforming text: {str(e)}")
            return f"Error transforming text: {str(e)}"
    
    def _get_transformation_instruction(self, transformation_type: str) -> str:
        """Get the appropriate instruction for the transformation type."""
        transformations = {
            "rewrite": "Rewrite this text to convey the same meaning but with different wording.",
            "improve": "Improve this text by enhancing clarity, grammar, and style.",
            "shorten": "Make this text more concise while preserving the key information.",
            "expand": "Expand this text with more details and supporting information.",
            "formalize": "Make this text more formal and professional.",
            "simplify": "Simplify this text to make it easier to understand."
        }
        
        return transformations.get(
            transformation_type.lower(), 
            "Transform this text according to the custom instructions."
        )

# Singleton instance
_service = _TextTransformService()

# -------------------- Exported async function -----------------
async def transform_text(text: str, transformation_type: str, custom_instruction: str = "") -> Dict[str, Any]:
    """Transform text according to the specified transformation and instructions."""
    transformed_text = await _service.transform_text(text, transformation_type, custom_instruction)
    
    return {
        "transformed_text": transformed_text,
        "original_text": text
    } 