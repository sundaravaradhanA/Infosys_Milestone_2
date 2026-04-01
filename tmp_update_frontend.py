import os
import re

def update_frontend_components():
    pages_dir = r"d:\Infosys_Milestone_2\banking-frontend\banking-frontend\src\pages"
    
    for filename in os.listdir(pages_dir):
        if not filename.endswith(".jsx"): continue
        
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip login and signup pages if they exist because they don't have auth yet
        if filename in ["Login.jsx", "Signup.jsx", "Landing.jsx"]:
            continue
            
        # Add import for fetchWithAuth
        if "from '../services/api'" not in content and "fetchWithAuth" not in content:
            # simple import injection
            content = re.sub(
                r'(import React,.*?from "react";)',
                r'\1\nimport { fetchWithAuth } from "../services/api";',
                content,
                count=1
            )
        
        # Replace normal fetch with fetchWithAuth for internal API calls
        # Replace headers: { Authorization: `Bearer ${token}` } since api does it
        # Actually doing regex replacement for fetch is risky inside JSX.
        # Let's just replace `fetch(` with `fetchWithAuth(` and let api.js merge headers
        
        # Only replace fetch logic that calls our backend
        if "http://127.0.0.1:8000" in content:
            content = content.replace("await fetch(", "await fetchWithAuth(")
            # also replace promise-based fetch
            content = content.replace(" fetch(", " fetchWithAuth(")
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

update_frontend_components()
print("Updated frontend components with fetchWithAuth")
