"""
Grant research services for AutoDraft
This module provides functions to search and retrieve grant opportunities
"""

import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any

# Sample data for development purposes
# In a production environment, this would connect to actual grant databases or APIs
SAMPLE_GRANTS = [
    {
        "id": "grant-001",
        "title": "Community Development Block Grant",
        "organization": "Department of Housing and Urban Development",
        "amount": 500000,
        "deadline": (datetime.now() + timedelta(days=45)).isoformat(),
        "category": "community_development",
        "description": "Provides communities with resources to address a wide range of unique community development needs.",
        "eligibility": "Local governments, states, and non-profit organizations",
        "application_process": "Two-stage application process with initial proposal and full application upon invitation.",
        "requirements": [
            "Community needs assessment",
            "Detailed project plan",
            "Budget with matching funds",
            "Timeline for implementation",
            "Impact measurement plan"
        ]
    },
    {
        "id": "grant-002",
        "title": "Research and Innovation Grant",
        "organization": "National Science Foundation",
        "amount": 250000,
        "deadline": (datetime.now() + timedelta(days=60)).isoformat(),
        "category": "research",
        "description": "Supports research projects that advance knowledge in science, technology, engineering, and mathematics.",
        "eligibility": "Universities, research institutions, and qualified researchers",
        "application_process": "Online application with peer review process.",
        "requirements": [
            "Research proposal",
            "Preliminary results",
            "Budget justification",
            "Research team qualifications",
            "Institutional support letter"
        ]
    },
    {
        "id": "grant-003",
        "title": "Arts and Culture Project Grant",
        "organization": "National Endowment for the Arts",
        "amount": 100000,
        "deadline": (datetime.now() + timedelta(days=30)).isoformat(),
        "category": "arts",
        "description": "Supports projects that celebrate and preserve artistic and cultural heritage.",
        "eligibility": "Non-profit arts organizations, museums, and community groups",
        "application_process": "Application with work samples and project narrative.",
        "requirements": [
            "Project description",
            "Artist biography",
            "Work samples",
            "Budget",
            "Community impact statement"
        ]
    },
    {
        "id": "grant-004",
        "title": "Small Business Innovation Grant",
        "organization": "Small Business Administration",
        "amount": 150000,
        "deadline": (datetime.now() + timedelta(days=90)).isoformat(),
        "category": "business",
        "description": "Funds innovative research and development projects by small businesses.",
        "eligibility": "Small businesses with fewer than 500 employees",
        "application_process": "Multi-phase application with initial concept and full proposal.",
        "requirements": [
            "Business plan",
            "Innovation description",
            "Market analysis",
            "Commercialization strategy",
            "Team qualifications"
        ]
    },
    {
        "id": "grant-005",
        "title": "Environmental Conservation Grant",
        "organization": "Environmental Protection Agency",
        "amount": 300000,
        "deadline": (datetime.now() + timedelta(days=75)).isoformat(),
        "category": "environment",
        "description": "Supports projects that protect and conserve natural resources and ecosystems.",
        "eligibility": "Environmental organizations, research institutions, and local governments",
        "application_process": "Online application with environmental impact assessment.",
        "requirements": [
            "Environmental impact statement",
            "Project plan",
            "Budget",
            "Sustainability plan",
            "Partnership details"
        ]
    }
]

async def research_grant_opportunities(
    keywords: Optional[str] = None,
    category: Optional[str] = None,
    max_amount: Optional[int] = None,
    deadline_after: Optional[str] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Search for grant opportunities based on criteria
    
    Args:
        keywords: Optional search terms
        category: Optional grant category
        max_amount: Optional maximum grant amount
        deadline_after: Optional deadline date (ISO format)
        limit: Maximum number of results to return
        
    Returns:
        List of matching grant opportunities
    """
    # In a real implementation, this would query external APIs or databases
    # For now, we filter our sample data
    
    filtered_grants = SAMPLE_GRANTS.copy()
    
    # Apply filters if provided
    if keywords:
        keywords_lower = keywords.lower()
        filtered_grants = [
            grant for grant in filtered_grants 
            if keywords_lower in grant["title"].lower() or 
               keywords_lower in grant["description"].lower()
        ]
    
    if category:
        filtered_grants = [
            grant for grant in filtered_grants 
            if grant["category"] == category
        ]
    
    if max_amount:
        filtered_grants = [
            grant for grant in filtered_grants 
            if grant["amount"] <= max_amount
        ]
    
    if deadline_after:
        try:
            deadline_date = datetime.fromisoformat(deadline_after)
            filtered_grants = [
                grant for grant in filtered_grants 
                if datetime.fromisoformat(grant["deadline"]) >= deadline_date
            ]
        except ValueError:
            # Invalid date format, ignore this filter
            pass
    
    # Sort by deadline (closest first)
    filtered_grants.sort(key=lambda g: g["deadline"])
    
    # Limit results
    return filtered_grants[:limit]

async def get_grant_details(grant_id: str) -> Optional[Dict[str, Any]]:
    """
    Get detailed information about a specific grant opportunity
    
    Args:
        grant_id: ID of the grant to retrieve
        
    Returns:
        Grant details or None if not found
    """
    # In a real implementation, this would query an API or database
    # For now, we search our sample data
    
    for grant in SAMPLE_GRANTS:
        if grant["id"] == grant_id:
            # Add additional details specific to this endpoint
            details = grant.copy()
            details["success_factors"] = [
                "Clear alignment with grant objectives",
                "Demonstrated community need or research significance",
                "Realistic budget and timeline",
                "Strong evaluation or measurement plan",
                "Qualified team or organization"
            ]
            details["similar_grants"] = [
                g for g in SAMPLE_GRANTS if g["category"] == grant["category"] and g["id"] != grant_id
            ][:3]
            return details
    
    return None

async def analyze_requirements(grant_id: str, project_text: str) -> Dict[str, Any]:
    """
    Analyze a project against grant requirements to identify gaps
    
    Args:
        grant_id: ID of the grant to analyze against
        project_text: The text of the project to analyze
        
    Returns:
        Analysis results with recommendations
    """
    # This would use advanced NLP in a production system
    # For now, we return sample analysis
    
    grant = None
    for g in SAMPLE_GRANTS:
        if g["id"] == grant_id:
            grant = g
            break
    
    if not grant:
        return {
            "error": "Grant not found",
            "recommendations": []
        }
    
    # Sample analysis results
    return {
        "grant_title": grant["title"],
        "alignment_score": 85,
        "strengths": [
            "Clear project objectives",
            "Detailed implementation plan",
            "Strong team qualifications"
        ],
        "gaps": [
            "Insufficient budget justification",
            "Weak evaluation methodology",
            "Limited sustainability plan"
        ],
        "recommendations": [
            "Enhance budget section with more detailed cost breakdown",
            "Develop more comprehensive evaluation metrics",
            "Expand on long-term sustainability after grant period"
        ]
    } 