import os, re
dir_path = r'd:\Infosys_Milestone_2\banking-frontend\banking-frontend\src\pages'
for f in os.listdir(dir_path):
    if f.endswith('.jsx'):
        p = os.path.join(dir_path, f)
        with open(p, 'r', encoding='utf-8') as file:
            c = file.read()
        
        # We need to find `\${API_BASE_URL}(.*?)" 
        # and replace the ending " with `
        
        c = re.sub(r'(`\$\{API_BASE_URL\}[^"]*?)\"([,\])} \n])', r'\1`\2', c)
        
        with open(p, 'w', encoding='utf-8') as file:
            file.write(c)
        print(f'Fixed {f}')
