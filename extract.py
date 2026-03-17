import zipfile
with zipfile.ZipFile('banking-frontend.zip', 'r') as z:
    for f in z.namelist():
        if 'Dashboard.jsx' in f and 'src/pages' in f:
            with open('dashboard_original.jsx', 'w') as out:
                out.write(z.read(f).decode('utf-8'))
            print('done')
            break
