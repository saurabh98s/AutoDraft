"""
GrantBot AI Agent service.

Provides a streaming AI agent that can analyze and improve grant proposal content.
"""

import os
import json
import asyncio
from typing import Dict, Any, Generator, List, Optional, AsyncGenerator
from dotenv import load_dotenv
import openai
from pydantic import BaseModel, Field

load_dotenv()

# Set up OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

class StreamingResponse(BaseModel):
    content: str = ""
    role: str = "assistant"
    tool_call: Optional[Dict[str, Any]] = None

class AgentService:
    """Agent service that handles GrantBot interactions."""
    
    async def run_agent(self, 
                         message: str, 
                         section_id: Optional[str] = None, 
                         section_text: Optional[str] = None
                        ) -> AsyncGenerator[StreamingResponse, None]:
        """
        Run the agent with streaming response capability.
        
        Args:
            message: The user query
            section_id: Optional ID of the section being edited
            section_text: Optional text of the section being edited
            
        Yields:
            StreamingResponse objects with agent responses or tool calls
        """
        # Prepare system prompt based on context
        system_prompt = """You are GrantBot, an AI assistant specialized in helping users write effective grant proposals.
You provide clear, constructive advice to improve grant writing, focusing on clarity, persuasiveness, and alignment with funder priorities.

When analyzing or improving text:
1. Focus on clarity and conciseness
2. Ensure claims are supported with evidence
3. Align language with what funders are looking for
4. Emphasize impact and measurable outcomes
5. Use professional, confident language

Be direct and specific in your advice. When suggesting improvements, explain the rationale briefly.
"""
        
        # If we have section context, add it to the system prompt
        if section_id and section_text:
            system_prompt += f"\n\nYou are currently helping with the '{section_id}' section of a grant proposal. Here is the current text:\n\n{section_text}\n\n"
            system_prompt += "Analyze this text when responding to the user's request."
        
        # Add user's history if needed later
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]
        
        # Simulate a tool call first for better UX
        yield StreamingResponse(
            content="",
            tool_call={
                "name": "analyze_grant_text",
                "arguments": {"text": section_text[:100] + "..." if section_text and len(section_text) > 100 else ""}
            }
        )
        
        await asyncio.sleep(0.5)  # Small delay for UX
        
        try:
            # Stream response from OpenAI
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",  # Use appropriate model
                messages=messages,
                stream=True,
                temperature=0.7,
                max_tokens=1000
            )
            
            collected_content = ""
            
            # Process streaming chunks
            async for chunk in response:
                if "choices" in chunk and len(chunk["choices"]) > 0:
                    choice = chunk["choices"][0]
                    if "delta" in choice and "content" in choice["delta"]:
                        content_delta = choice["delta"]["content"]
                        collected_content += content_delta
                        yield StreamingResponse(content=content_delta)
                        
                        # Add small delay to simulate thinking (can remove in production)
                        await asyncio.sleep(0.01)
                        
            return
            
        except Exception as e:
            # Handle errors gracefully
            error_message = f"I encountered an error while processing your request: {str(e)}"
            yield StreamingResponse(content=error_message)
            return

# Create singleton instance
agent_service = AgentService()

# Exported async function
async def run_agent(message: str, section_id: Optional[str] = None, section_text: Optional[str] = None) -> AsyncGenerator[Dict[str, Any], None]:
    """Run the agent with the given message and context, returning a streaming response."""
    async for response in agent_service.run_agent(message, section_id, section_text):
        yield response.dict(exclude_none=True) 