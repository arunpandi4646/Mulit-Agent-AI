"""
Orchestrator Agent
Coordinates the execution flow between all agents
"""

from .planner_agent import PlannerAgent
from .architect_agent import ArchitectAgent
from .code_agent import CodeGeneratorAgent
from .debug_agent import DebugAgent
from typing import Dict
import requests

class OrchestratorAgent:
    def __init__(self):
        self.name = "Orchestrator Agent"
        self.planner = PlannerAgent()
        self.architect = ArchitectAgent()
        self.code_generator = CodeGeneratorAgent()
        self.debugger = DebugAgent()
    
    def execute(self, prompt: str) -> Dict:
        """
        Execute the full agentic pipeline
        
        Flow:
        1. Planner analyzes intent and creates plan
        2. Architect designs system architecture
        3. Code Generator produces code files
        4. Debug Agent reviews and validates
        
        Returns:
            Dict with plan, architecture, files, and debug report
        """
        
        print(f"[{self.name}] Starting agentic pipeline...")
        
        # Step 1: Planning
        print(f"[{self.planner.name}] Analyzing prompt...")
        plan = self.planner.analyze(prompt)
        
        # Step 2: Architecture
        print(f"[{self.architect.name}] Designing architecture...")
        architecture = self.architect.design(prompt, plan)
        
        # Step 3: Code Generation
        print(f"[{self.code_generator.name}] Generating code...")
        files = self.code_generator.generate(prompt, plan, architecture)
        
        # Step 4: Debug & Review
        print(f"[{self.debugger.name}] Reviewing code...")
        debug_report = self.debugger.review(files)
        
        print(f"[{self.name}] Pipeline complete!")
        
        return {
            "plan": plan,
            "architecture": architecture,
            "files": files,
            "debug": debug_report
        }

    def generate_code(self, prompt: str) -> Dict:
        """
        Generate code files for a given prompt
        
        Returns:
            Dict with code files and debug report
        """
        print(f"[{self.name}] Generating code...")
        files = self.code_generator.generate(prompt)
        debug_report = self.debugger.review(files)
        return {
            "code": files,
            "debug": debug_report
        }

    def fetch_code(self, prompt: str) -> Dict:
        """
        Fetch code files from the server
        
        Returns:
            Dict with code files and debug report
        """
        print(f"[{self.name}] Fetching code...")
        response = requests.post('http://localhost:8000/generate', {
            'method': 'POST',
            'headers': { 'Content-Type': 'application/json' },
            'body': JSON.stringify({ prompt: prompt })
        })
        return response.json()
