"""
Planner Agent
Analyzes user intent and creates a step-by-step execution plan
"""

from .llm_client import LLMClient

class PlannerAgent:
    def __init__(self):
        self.name = "Planner Agent"
        self.llm = LLMClient()
    
    def analyze(self, prompt: str) -> str:
        """
        Analyze the user's prompt and create a detailed plan using LLM
        """
        system_prompt = """You are an expert Senior Technical Project Manager. 
        Your goal is to break down a coding request into a clear, numbered step-by-step implementation plan.
        Do not write code. Focus on logic, requirements, and steps.
        
        Output format:
        PLAN FOR: [Project Name]
        
        EXECUTION STEPS:
        1. [Step 1]
        2. [Step 2]
        ...
        
        APPROACH:
        - [Key principle]
        """
        
        return self.llm.query(system_prompt, f"Create a plan for: {prompt}", temperature=0.3)
