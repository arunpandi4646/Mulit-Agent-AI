"""
Code Generator Agent
Generates production-ready code based on architecture and plan
"""

from typing import Dict
from .llm_client import LLMClient
import re

class CodeGeneratorAgent:
    def __init__(self):
        self.name = "Code Generator Agent"
        self.llm = LLMClient()
    
    def generate(self, prompt: str, plan: str, architecture: str) -> Dict[str, str]:
        """
        Generate code files based on the architecture using LLM
        Returns a dictionary of filename -> code content
        """
        
        system_prompt = """You are an expert Full Stack Developer.
        Your task is to write complete, production-ready code for the application.
        
        CRITICAL OUTPUT RULES:
        1. Output multiple complete files with full implementation
        2. Use this exact delimiter: ### FILE: [filepath]
        3. After delimiter, write the complete code immediately
        4. NO markdown code blocks (no ``` markers)
        5. Write raw, executable code only
        6. Include all imports, functions, and logic
        7. Ensure all files work together as a complete system
        
        Example Output Format:
        ### FILE: src/index.html
        <!DOCTYPE html>
        <html>
        <head><title>App</title></head>
        <body><h1>Hello World</h1></body>
        </html>
        ### FILE: src/styles.css
        body {
            margin: 0;
            font-family: Arial, sans-serif;
        }
        ### FILE: src/app.js
        console.log('App loaded');
        
        DO NOT use code fences. Write direct code after each FILE marker.
        """
        
        user_prompt = f"""
User Request: {prompt}

Plan:
{plan}

Architecture:
{architecture}

Generate ALL necessary code files now. Include:
- HTML files (complete structure)
- CSS files (full styling)
- JavaScript files (complete logic)
- Configuration files (package.json, etc.)
- Any other required files

Make the code production-ready and fully functional.
"""
        
        # Lower temperature for more consistent code generation
        raw_response = self.llm.query(system_prompt, user_prompt, temperature=0.15, max_tokens=4096)
        
        files = self._parse_files(raw_response)
        
        # Validate we got files
        if not files:
            print(f"   WARNING: No files were parsed from LLM response")
            print(f"   Raw response preview: {raw_response[:500]}")
            # Fallback: try to extract any code blocks as a single file
            files = self._fallback_parse(raw_response, prompt)
        
        return files
    
    def _parse_files(self, response: str) -> Dict[str, str]:
        """
        Parse the LLM response to extract files using ### FILE: delimiter
        """
        files = {}
        current_file = None
        current_content = []
        
        lines = response.split('\n')
        
        for line in lines:
            # Check for file delimiter
            if line.strip().startswith('### FILE:'):
                # Save previous file
                if current_file and current_content:
                    content = '\n'.join(current_content).strip()
                    # Clean any remaining markdown artifacts
                    content = self._clean_code(content)
                    files[current_file] = content
                
                # Start new file
                current_file = line.strip().replace('### FILE:', '').strip()
                current_file = current_file.replace('`', '').strip()
                current_content = []
                
            elif current_file is not None:
                # Skip markdown code block markers
                if line.strip() in ['```', '```html', '```css', '```javascript', '```js', '```json', '```python']:
                    continue
                current_content.append(line)
        
        # Save last file
        if current_file and current_content:
            content = '\n'.join(current_content).strip()
            content = self._clean_code(content)
            files[current_file] = content
        
        return files
    
    def _clean_code(self, content: str) -> str:
        """
        Remove any markdown artifacts from code content
        """
        # Remove leading/trailing code fences
        content = re.sub(r'^```[\w]*\n', '', content)
        content = re.sub(r'\n```$', '', content)
        return content.strip()
    
    def _fallback_parse(self, response: str, prompt: str) -> Dict[str, str]:
        """
        Fallback parser if standard delimiter parsing fails
        Attempts to extract code from markdown blocks
        """
        files = {}
        
        # Try to find markdown code blocks
        code_blocks = re.findall(r'```[\w]*\n(.*?)```', response, re.DOTALL)
        
        if code_blocks:
            # Create default file based on content type
            for i, block in enumerate(code_blocks):
                # Guess file type from content
                if '<html' in block.lower() or '<!doctype' in block.lower():
                    filename = f'index.html'
                elif 'function' in block or 'const' in block or 'let' in block:
                    filename = f'app.js'
                elif '{' in block and (':' in block or 'margin' in block or 'color' in block):
                    filename = f'styles.css'
                else:
                    filename = f'file_{i+1}.txt'
                
                files[filename] = block.strip()
        
        # If still no files, create a single output file with the response
        if not files:
            files['output.txt'] = response
        
        return files