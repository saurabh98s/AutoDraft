from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from jinja2 import Environment, FileSystemLoader
import os
from typing import Dict, Any, List
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class DocumentService:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model_name="gpt-4"
        )
        
        # Initialize Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader('templates'),
            autoescape=True
        )
        
        # Load templates
        self.templates = {
            'proposal': self.env.get_template('proposal_template.docx'),
            'budget': self.env.get_template('budget_template.docx'),
            'executive_summary': self.env.get_template('executive_summary_template.docx')
        }

    def generate_content(
        self,
        section_type: str,
        context: Dict[str, Any]
    ) -> str:
        """Generate content for a specific section using LLM"""
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"""You are a grant writing expert. Generate content for the {section_type} section.
                Follow these guidelines:
                1. Be clear and concise
                2. Use active voice
                3. Include specific examples and data
                4. Align with the organization's mission
                5. Follow grant requirements"""),
                ("human", f"Context: {json.dumps(context, indent=2)}")
            ])
            
            response = self.llm.invoke(prompt)
            return response.content
            
        except Exception as e:
            return f"Error generating content: {str(e)}"

    def assemble_document(
        self,
        template_type: str,
        data: Dict[str, Any]
    ) -> str:
        """Assemble a document using the specified template and data"""
        try:
            if template_type not in self.templates:
                raise ValueError(f"Unknown template type: {template_type}")
            
            template = self.templates[template_type]
            
            # Add metadata
            data['generated_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Render the template
            output = template.render(**data)
            
            # Save the document
            output_dir = "generated_documents"
            os.makedirs(output_dir, exist_ok=True)
            
            filename = f"{template_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(output)
            
            return filepath
            
        except Exception as e:
            raise Exception(f"Error assembling document: {str(e)}")

    def format_document(
        self,
        content: str,
        format_type: str = 'docx'
    ) -> str:
        """Format the document content according to specified format"""
        try:
            if format_type == 'docx':
                # Add Word-specific formatting
                formatted_content = self._format_for_word(content)
            elif format_type == 'pdf':
                # Add PDF-specific formatting
                formatted_content = self._format_for_pdf(content)
            else:
                raise ValueError(f"Unsupported format type: {format_type}")
            
            return formatted_content
            
        except Exception as e:
            raise Exception(f"Error formatting document: {str(e)}")

    def _format_for_word(self, content: str) -> str:
        """Add Word-specific formatting"""
        # Add Word-specific formatting logic here
        return content

    def _format_for_pdf(self, content: str) -> str:
        """Add PDF-specific formatting"""
        # Add PDF-specific formatting logic here
        return content

# Initialize global document service
document_service = DocumentService() 