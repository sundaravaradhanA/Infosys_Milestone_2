import zipfile
import os

# Extract Dashboard.jsx from zip
with zipfile.ZipFile('d:/Infosys_Milestone_2/banking-frontend.zip', 'r') as z:
    for f in z.namelist():
        if 'Dashboard.jsx' in f and 'banking-frontend/src/pages' in f:
            content = z.read(f).decode('utf-8')
            # Save to temp location
            with open('d:/Infosys_Milestone_2/temp_dashboard.jsx', 'w') as out:
                out.write(content)
            print(f"Extracted: {f}")
            print("First 500 chars:", content[:500])
            break
