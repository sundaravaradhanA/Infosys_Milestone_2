import requests

base_url = "http://localhost:8000"
user_params = {"user_id": 1, "month": "2026-03"}

endpoints = [
    ("/insights/monthly-summary", user_params),
    ("/insights/top-merchants", user_params),
    ("/insights/spending-by-category", user_params),
    ("/insights/burn-rate", user_params),
    ("/alerts/", {"user_id": 1}),
    ("/export/transactions", {"user_id": 1, "format": "csv"}),
    ("/export/insights", {"user_id": 1, "format": "pdf"})
]

print("Starting checks...\n" + "="*50)

for ep, params in endpoints:
    url = f"{base_url}{ep}"
    try:
        response = requests.get(url, params=params, timeout=5)
        print(f"Testing {ep}...")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                data = response.json()
                if isinstance(data, list):
                    print(f"Data: List with {len(data)} items. First item: {data[0] if data else 'Empty'}")
                else:
                    print(f"Data: {data}")
            elif "csv" in content_type:
                content = response.text
                print(f"Data: CSV with {len(content.splitlines())} lines.")
            elif "pdf" in content_type:
                print(f"Data: PDF file with {len(response.content)} bytes.")
            else:
                print(f"Data: Unknown content type '{content_type}'")
        else:
            print(f"ERROR: {response.text}")
            
    except Exception as e:
        print(f"FAILED to reach {ep}: {e}")
        
    print("-" * 50)

print("Check finished.")
