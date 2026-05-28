"""
Debug Agent
Reviews generated code and provides quality feedback
"""

from typing import Dict
from .llm_client import LLMClient

class DebugAgent:
    def __init__(self):
        self.name = "Debug Agent"
        self.llm = LLMClient()
    
    def review(self, files: Dict[str, str]) -> str:
        """
        Review generated code and provide feedback using LLM
        """
        
        system_prompt = """You are an expert Senior Code Reviewer.
        Review the provided code files for syntax errors, bugs, and best practices.
        
        Output format:
        
        CODE REVIEW REPORT
        ==================
        [Summary of code quality]
        
        ISSUES:
        - [File Name]: [Issue description]
        
        SUGGESTIONS:
        - [Suggestion 1]
        
        VERDICT: [PASS/FAIL]
        """
        
        # Combine all files into one prompt (truncating if too large)
        code_context = ""
        for name, content in files.items():
            code_context += f"\n\n--- FILE: {name} ---\n{content[:1000]}" # Truncate large files to save tokens
        
        return self.llm.query(system_prompt, f"Review this code:\n{code_context}", temperature=0.1)
