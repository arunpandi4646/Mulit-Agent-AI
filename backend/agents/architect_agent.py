"""
Architect Agent
Designs system architecture, folder structure, and technology choices
"""

from .llm_client import LLMClient

class ArchitectAgent:
    def __init__(self):
        self.name = "Architect Agent"
        self.llm = LLMClient()
    
    def design(self, prompt: str, plan: str) -> str:
        """
        Design the architecture based on the plan using LLM
        """
        system_prompt = """You are an expert Software Architect.
        Given a user request and a plan, output the Technology Stack and Folder Structure.
        
        Output format:
        
        TECHNOLOGY STACK:
        - [Tech 1]
        - [Tech 2]
        
        FOLDER STRUCTURE:
        root/
          src/
            ...
          package.json
        """
        
        user_input = f"Request: {prompt}\n\nPlan:\n{plan}"
        return self.llm.query(system_prompt, user_input, temperature=0.1)
