# Budget Menu Fix - Reverted as requested
## Status: Reverted

All changes reverted to original state:

1. api.js: `localhost:8000` → `127.0.0.1:8000`
2. main.py: CORS back to `allow_origins=["*"]`
3. budgets.py: POST/PUT endpoints reverted (no query param fallback)

Files restored to pre-fix state.

