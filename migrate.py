import os, re
dir_path = r'd:\Infosys_Milestone_2\banking-frontend\banking-frontend\src\pages'
for f in os.listdir(dir_path):
    if f.endswith('.jsx'):
        p = os.path.join(dir_path, f)
        with open(p, 'r', encoding='utf-8') as file:
            c = file.read()
        if 'http://127.0.0.1:8000' in c:
            if 'fetchWithAuth' in c and 'API_BASE_URL' not in c:
                # Replace the import from ../services/api to include API_BASE_URL
                c = re.sub(
                    r'import\s+\{\s*([^}]*fetchWithAuth[^}]*)\s*\}\s*from\s+[\'\"]\.\./services/api[\'\"];?', 
                    r'import {\1, API_BASE_URL} from "../services/api";', 
                    c
                )
            elif 'API_BASE_URL' not in c:
                c = f'import {{ API_BASE_URL }} from "../services/api";\n' + c
            
            # Now safely replace
            c = c.replace('"http://127.0.0.1:8000', '`${API_BASE_URL}')
            c = c.replace('http://127.0.0.1:8000', '${API_BASE_URL}')
            
            with open(p, 'w', encoding='utf-8') as file:
                file.write(c)
            print(f'Done {f}')
