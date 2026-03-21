import requests
from fastapi import HTTPException
from typing import Optional
import time
from threading import Lock
import logging

logger = logging.getLogger(__name__)

class CurrencyService:
    def __init__(self):
        self.usd_to_inr_rate: Optional[float] = None
        self.last_updated: Optional[float] = None
        self.lock = Lock()
        self.cache_ttl = 300  # 5 minutes

    def _fetch_rate(self) -> float:
        """Fetch live USD to INR rate"""
        try:
            url = "https://api.exchangerate-api.com/v4/latest/USD"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            rate = data['rates']['INR']
            logger.info(f"Fetched USD->INR rate: {rate}")
            return rate
        except Exception as e:
            logger.error(f"Currency API error: {str(e)}")
            # Fallback rate
            return 83.5

    def get_usd_to_inr_rate(self) -> float:
        """Get rate with caching"""
        with self.lock:
            now = time.time()
            if (self.usd_to_inr_rate is not None and 
                self.last_updated is not None and
                now - self.last_updated < self.cache_ttl):
                return self.usd_to_inr_rate
            
            rate = self._fetch_rate()
            self.usd_to_inr_rate = rate
            self.last_updated = now
            return rate

    def convert_usd_to_inr(self, usd: float) -> float:
        """Convert USD to INR"""
        if usd < 0:
            return -self.convert_usd_to_inr(abs(usd))
        rate = self.get_usd_to_inr_rate()
        return usd * rate


# Singleton instance
currency_service = CurrencyService()

