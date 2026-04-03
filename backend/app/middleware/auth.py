import asyncio
import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, Depends
from typing import List, Optional, Dict
from functools import wraps
from app.utils.exceptions import UnauthorizedException
import os

# JWT config
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


class UserContext:
    """User context extracted from request"""
    def __init__(self, user_id: str, role: str):
        self.user_id = user_id
        self.role = role

    def has_role(self, required_roles: List[str]) -> bool:
        """Check user roles"""
        return self.role in required_roles


async def get_user_context(request: Request) -> UserContext:
    """
    Extract user context from JWT token in Authorization header.
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user_role = payload.get("role")
        
        if not user_id or not user_role:
            raise HTTPException(status_code=401, detail="Invalid token claims")
        
        return UserContext(user_id=user_id, role=user_role)
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(allowed_roles: List[str]):
    """
    Decorator to protect endpoints based on user role.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, user: UserContext = None, **kwargs):
            if user is None:
                raise HTTPException(status_code=401, detail="User context not found")
            
            if not user.has_role(allowed_roles):
                raise UnauthorizedException(
                    f"This action requires one of these roles: {', '.join(allowed_roles)}"
                )
            
            if asyncio.iscoroutinefunction(func):
                return await func(*args, user=user, **kwargs)
            else:
                return func(*args, user=user, **kwargs)
        
        return wrapper
    return decorator


# role check function
def check_role(user: UserContext, required_roles: List[str]) -> None:
    """
    Check if user has required role.
    Raises UnauthorizedException if not.
    """
    if not user.has_role(required_roles):
        raise UnauthorizedException(
            f"This action requires one of these roles: {', '.join(required_roles)}"
        )


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(user_id: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Returns:
        JWT token string
    """
    if expires_delta is None:
        expires_delta = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    expire = datetime.utcnow() + expires_delta
    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(payload, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Dict:
    """
    Decode and validate a JWT token.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
