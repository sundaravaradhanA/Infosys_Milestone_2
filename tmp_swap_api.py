import os
import re

def swap_api_calls():
    pages_dir = r"d:\Infosys_Milestone_2\banking-frontend\banking-frontend\src\pages"
    
    for filename in os.listdir(pages_dir):
        if not filename.endswith(".jsx"): continue
        if filename in ["Login.jsx", "Signup.jsx", "Landing.jsx"]: continue
        
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        changed = False

        if "import " in content and "fetchWithAuth" not in content:
            # inject import
            content = content.replace(
                'import React',
                'import { fetchWithAuth } from "../services/api";\nimport React'
            )
            changed = True
        
        # safely replace isolated `fetch(` calls
        if "fetch(" in content:
            # Replace exactly the word fetch when it's called
            content = re.sub(r'\bfetch\(', 'fetchWithAuth(', content)
            changed = True

        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

swap_api_calls()
print("All authenticated pages now use fetchWithAuth.")
