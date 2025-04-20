from __future__ import annotations
"""LLM-powered research agent for grant proposal development.

Exports **async functions** for researching topics and generating content for various
grant proposal sections.

Compatible with both legacy `langchain==0.0.267` and the split
`langchain-core/community` packages.
"""

import os, json, asyncio
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.tools import Tool
from langchain.agents import initialize_agent, AgentExecutor, ZeroShotAgent, AgentType
from langchain.output_parsers import PydanticOutputParser
from langchain.utilities import GoogleSearchAPIWrapper

load_dotenv()

# -------------------- Pydantic schemas --------------------
class ResearchFinding(BaseModel):
    source: str = Field(..., description="Source of the information (URL, publication, etc.)")
    relevance: str = Field(..., description="high | medium | low")
    key_points: List[str] = Field(..., description="Key points from this source relevant to the topic")
    date: Optional[str] = Field(None, description="Date of publication if available")

class ResearchResults(BaseModel):
    topic: str
    summary: str
    findings: List[ResearchFinding]
    recommendations: List[str]

class SectionContent(BaseModel):
    content: str = Field(..., description="Generated content for the section")
    sources: List[str] = Field(..., description="Sources used for generating this content")
    suggestions: List[str] = Field(..., description="Suggestions for improving this section")

# -------------------- Core services ------------------------
class _ResearchAgent:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(
            temperature=0.2,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model_name="gpt-3.5-turbo-16k",
        )
        
        # Initialize Google Search API if credentials are available
        try:
            self.search = GoogleSearchAPIWrapper(
                google_api_key=os.getenv("GOOGLE_API_KEY"),
                google_cse_id=os.getenv("GOOGLE_CSE_ID")
            )
            
            # Create tools for the agent
            self.tools = [
                Tool(
                    name="Google Search",
                    description="Search Google for recent information about a topic",
                    func=self.search.run
                ),
            ]
        except Exception as e:
            print(f"Warning: Google Search API not configured: {str(e)}")
            # Create a dummy search tool that returns a message about missing API keys
            self.tools = [
                Tool(
                    name="Google Search",
                    description="Search Google for recent information about a topic",
                    func=lambda query: f"Could not perform search for '{query}'. API keys not configured."
                ),
            ]
        
        # Output parsers
        self.research_parser = PydanticOutputParser(pydantic_object=ResearchResults)
        self.section_parser = PydanticOutputParser(pydantic_object=SectionContent)
        
        # Setup agents and prompts
        self.research_prompt_prefix = """You are a grant proposal research agent. Research the given topic thoroughly and provide relevant information.
            
Focus on finding accurate, recent, and relevant information about the topic, especially as it relates to grant proposals.

Your final answer should follow this format:
```json
{
  "topic": "The researched topic",
  "summary": "A concise summary of findings",
  "findings": [
    {
      "source": "Source name or URL",
      "relevance": "high/medium/low",
      "key_points": ["Point 1", "Point 2"]
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
```
"""
        
        self.section_generation_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a grant proposal writing assistant. Generate content for the {section_type} section of a grant proposal.
            
            Use the research information provided and follow best practices for grant writing.
            
            {format_instructions}"""),
            ("human", "Project title: {title}"),
            ("human", "Project description: {description}"),
            ("human", "Research findings: {research}"),
            ("human", "Section requirements: {requirements}"),
        ])

        # Create the agent using ZeroShotAgent
        self.agent = initialize_agent(
            self.tools,
            self.llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True
        )
    
    async def research_topic(self, topic: str, context: str = "") -> ResearchResults:
        """Research a topic and return structured findings."""
        try:
            # Add context to the agent's query
            query = f"Topic: {topic}\nContext: {context}\n\nResearch this topic and provide a structured response."
            
            # Run the agent to collect research
            agent_response = await asyncio.to_thread(self.agent.run, query)
            
            # Parse the agent's response into structured data
            try:
                # Try to extract JSON if present
                if "```json" in agent_response:
                    json_str = agent_response.split("```json")[1].split("```")[0].strip()
                    result_dict = json.loads(json_str)
                    return ResearchResults(**result_dict)
                elif "{" in agent_response and "}" in agent_response:
                    # Try to extract JSON if it's not properly formatted with code blocks
                    json_text = agent_response[agent_response.find("{"):agent_response.rfind("}")+1]
                    try:
                        result_dict = json.loads(json_text)
                        return ResearchResults(**result_dict)
                    except:
                        pass
                
                # Fallback to manually creating a structured response
                findings = []
                
                # Simple parsing based on potential patterns in the response
                paragraphs = agent_response.split("\n\n")
                sources = []
                
                for paragraph in paragraphs:
                    if "source:" in paragraph.lower() or "http" in paragraph.lower():
                        source = paragraph.split("source:", 1)[1].strip() if "source:" in paragraph.lower() else paragraph
                        sources.append(source)
                
                if sources:
                    findings.append(ResearchFinding(
                        source="Agent research compilation",
                        relevance="medium",
                        key_points=[p for p in paragraphs if len(p) > 50 and p not in sources][:3],
                        date=None
                    ))
                
                return ResearchResults(
                    topic=topic,
                    summary=agent_response[:300],  # Use first 300 chars as summary
                    findings=findings if findings else [
                        ResearchFinding(
                            source="Agent research",
                            relevance="medium",
                            key_points=[agent_response[:500]]
                        )
                    ],
                    recommendations=["Review and expand upon these research findings.", "Consider conducting more specific research."]
                )
            except Exception as e:
                print(f"Error parsing research response: {str(e)}")
                # Create a basic result if parsing fails
                return ResearchResults(
                    topic=topic,
                    summary=agent_response[:500],  # Use first 500 chars as summary
                    findings=[
                        ResearchFinding(
                            source="Agent research",
                            relevance="medium",
                            key_points=[agent_response[:1000]]
                        )
                    ],
                    recommendations=["Please review the research findings manually."]
                )
        except Exception as e:
            print(f"Error running research agent: {str(e)}")
            # Fallback for any agent execution errors
            return ResearchResults(
                topic=topic,
                summary=f"Research encountered an error: {str(e)}",
                findings=[
                    ResearchFinding(
                        source="Error report",
                        relevance="low",
                        key_points=[f"The research agent encountered an error: {str(e)}"]
                    )
                ],
                recommendations=["Try more specific search terms.", "Try again later."]
            )
    
    async def generate_section(self, section_type: str, title: str, description: str, 
                              research: str, requirements: str = "") -> SectionContent:
        """Generate content for a specific section of the grant proposal."""
        try:
            # Format the prompt
            messages = self.section_generation_prompt.format_messages(
                section_type=section_type,
                title=title,
                description=description,
                research=research,
                requirements=requirements,
                format_instructions=self.section_parser.get_format_instructions()
            )
            
            # Generate content
            response = await asyncio.to_thread(self.llm, messages)
            
            try:
                # Parse the response
                return self.section_parser.parse(response.content)
            except Exception as e:
                print(f"Error parsing section content: {str(e)}")
                # Create a basic response if parsing fails
                return SectionContent(
                    content=response.content,
                    sources=["Generated content based on provided information"],
                    suggestions=["Review for accuracy", "Add specific details relevant to your project"]
                )
        except Exception as e:
            print(f"Error generating section: {str(e)}")
            # Fallback for errors
            return SectionContent(
                content=f"Failed to generate {section_type} section: {str(e)}",
                sources=[],
                suggestions=["Try providing more specific information about your project"]
            )

# Singleton instance
_agent = _ResearchAgent()

# -------------------- Exported async functions -----------------
async def research_topic(topic: str, context: str = "") -> Dict[str, Any]:
    """Research a topic and return structured findings."""
    result = await _agent.research_topic(topic, context)
    return result.dict()

async def generate_section(section_type: str, project_id: str, 
                          title: str, description: str, 
                          research_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Generate content for a specific section of the grant proposal."""
    # If no research data is provided, do a quick research first
    if not research_data:
        research_context = f"Grant proposal for {title}: {description}"
        research_topic = f"{section_type} for {title}"
        research_data = await research_topic(research_topic, research_context)
    
    # Convert research data to string format
    research_str = json.dumps(research_data)
    
    # Generate the section content
    requirements = f"This is the {section_type} section of a grant proposal."
    result = await _agent.generate_section(section_type, title, description, research_str, requirements)
    return result.dict()

async def generate_all_sections(project_id: str, title: str, description: str) -> Dict[str, Dict[str, Any]]:
    """Generate content for all standard sections of the grant proposal."""
    # Define the sections we want to generate
    sections = ["Abstract", "Introduction", "Methodology", "Budget", "Timeline"]
    
    # Do a single comprehensive research for the whole proposal
    research_data = await research_topic(
        topic=f"Grant proposal for {title}",
        context=description
    )
    
    # Generate each section using the same research data
    results = {}
    for section in sections:
        section_content = await generate_section(
            section_type=section,
            project_id=project_id,
            title=title,
            description=description,
            research_data=research_data
        )
        results[section.lower()] = section_content
    
    return results 