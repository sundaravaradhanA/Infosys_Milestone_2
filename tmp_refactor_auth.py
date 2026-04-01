import os
import re

def refactor_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import at the top after other imports
    if "get_current_user_id" not in content:
        content = re.sub(
            r'(from fastapi import.*)', 
            r'\1\nfrom app.dependencies import get_current_user_id', 
            content, 
            count=1
        )
    
    # Replace user_id query parameters
    content = re.sub(
        r'user_id:\s*int\s*=\s*Query\([^)]*\)',
        r'user_id: int = Depends(get_current_user_id)',
        content
    )
    # also handle user_id: int = 1 in categories
    content = re.sub(
        r'user_id:\s*int\s*=\s*1',
        r'user_id: int = Depends(get_current_user_id)',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Refactored {filepath}")

routes_dir = r"d:\Infosys_Milestone_2\backend\app\routes"
for fname in os.listdir(routes_dir):
    if fname.endswith(".py") and fname != "auth.py" and fname != "__init__.py":
        refactor_file(os.path.join(routes_dir, fname))

print("Done refactoring routes for Auth Dependency.")
