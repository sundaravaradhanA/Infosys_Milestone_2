from fastapi import APIRouter, HTTPException
import requests

router = APIRouter(tags=["Currency"])

# Simple cache for demonstration purposes
currency_cache = {}

@router.get("/currency-rates")
def get_currency_rates():
    if "rates" in currency_cache:
        return currency_cache["rates"]

    try:
        url = "https://api.exchangerate-api.com/v4/latest/USD"
        response = requests.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch currency rates")

        data = response.json()
        rates = data["rates"]
        
        # the required format is like {"USD": 83.12, "EUR": 90.50, "GBP": 105.20} -> what 1 foreign currency is worth in INR
        # if USD base translates to 83.12 INR, then 1 USD = 83.12 INR
        # 1 EUR = EUR_to_USD * USD_to_INR => (1/rates['EUR']) * rates['INR']

        usd_to_inr = rates.get("INR", 83.0)
        
        eur_to_usd = 1.0 / rates.get("EUR", 0.92) if rates.get("EUR") else 1.08
        gbp_to_usd = 1.0 / rates.get("GBP", 0.79) if rates.get("GBP") else 1.25

        formatted_rates = {
            "USD": round(usd_to_inr, 2),
            "EUR": round(eur_to_usd * usd_to_inr, 2),
            "GBP": round(gbp_to_usd * usd_to_inr, 2)
        }
        
        currency_cache["rates"] = formatted_rates

        return formatted_rates

    except Exception as e:
        # Fallback rates in case of failure
        return {
            "USD": 83.12,
            "EUR": 90.50,
            "GBP": 105.20
        }
