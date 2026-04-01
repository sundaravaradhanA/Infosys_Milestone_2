from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

def get_current_user_id(
    token: Optional[str] = Depends(oauth2_scheme),
    query_token: Optional[str] = Query(None, alias="token")
) -> int:
    """Extract user_id from the simplified token setup token_{user_id}"""
    effective_token = token or query_token
    
    if not effective_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if effective_token.startswith('token_'):
        try:
            return int(effective_token.split('_')[1])
        except ValueError:
            pass
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Invalid token format",
        headers={"WWW-Authenticate": "Bearer"},
    )
