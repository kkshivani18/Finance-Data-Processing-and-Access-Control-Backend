from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Literal

RoleType = Literal["viewer", "analyst", "admin"]
StatusType = Literal["active", "inactive"]


class UserBase(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=2, max_length=100, description="User full name (2-100 chars)")
    role: RoleType = Field(..., description="User role: viewer, analyst or admin")
    status: StatusType = Field(default="active", description="User status: active or inactive")


class UserCreate(BaseModel):
    """
    Schema for creating a new user during registration.
    SECURITY: Role is NOT accepted from user input. All new users default to "viewer".
    Only admins can upgrade user roles through the admin panel.
    """
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=2, max_length=100, description="User full name (2-100 chars)")
    password: str = Field(..., min_length=8, max_length=128, description="User password (8-128 chars, must contain uppercase, lowercase, number, and special character)")

    class Config:
        extra = "forbid"
    
    @field_validator('name')
    @classmethod
    def validate_name_format(cls, v):
        """Validate that name doesn't have leading/trailing whitespace"""
        if v != v.strip():
            raise ValueError("Name cannot have leading or trailing whitespace")
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        """Validate password strength"""
        import re
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'[0-9]', v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character (!@#$%^&*)")
        return v


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="User password")
    
    class Config:
        extra = "forbid"


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    role: RoleType | None = None
    status: StatusType | None = None
    name: str | None = Field(default=None, min_length=2, max_length=100)


class User(UserBase):
    """Database model for User"""
    id: str = Field(default=None, alias="_id")
    password_hash: str = Field(..., description="Hashed password")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True  


class UserResponse(UserBase):
    """Schema for user response"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True  

class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
