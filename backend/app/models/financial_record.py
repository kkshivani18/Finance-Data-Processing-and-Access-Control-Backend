from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Literal
from decimal import Decimal

# financial record types
RecordType = Literal["income", "expense"]
CategoryType = Literal["food", "transportation", "entertainment", "utilities", "salary", "other"]


class FinancialRecordBase(BaseModel):
    amount: float = Field(..., gt=0, le=999999999, description="Amount must be between 0 and 999,999,999")
    type: RecordType = Field(..., description="Transaction type: income or expense")
    category: CategoryType = Field(..., description="Category of transaction")
    date: datetime = Field(..., description="Date of transaction")
    description: str = Field(default="", max_length=500, description="Transaction description (max 500 chars)")
    
    @field_validator('amount')
    @classmethod
    def validate_amount_precision(cls, v):
        """Validate that amount has valid decimal places"""

        amount_str = str(v)
        if '.' in amount_str:
            decimal_places = len(amount_str.split('.')[1])
            if decimal_places > 2:
                raise ValueError("Amount cannot have more than 2 decimal places")
        return v
    
    @field_validator('description')
    @classmethod
    def validate_description_content(cls, v):
        """Validate description doesn't contain malicious content"""
        if v and ("<script>" in v.lower() or "javascript:" in v.lower()):
            raise ValueError("Description contains invalid content")
        return v
    
    @field_validator('date')
    @classmethod
    def validate_date_not_future(cls, v):
        """Validate that date is not in the future"""
        if v > datetime.utcnow():
            raise ValueError("Date cannot be in the future")
        return v


class FinancialRecordCreate(FinancialRecordBase):
    """Schema for creating a new financial record"""
    pass


class FinancialRecordUpdate(BaseModel):
    """Schema for updating a financial record"""
    amount: float | None = Field(default=None, gt=0, le=999999999)
    type: RecordType | None = None
    category: CategoryType | None = None
    date: datetime | None = None
    description: str | None = Field(default=None, max_length=500)
    
    @field_validator('amount')
    @classmethod
    def validate_amount_precision(cls, v):
        """Validate that amount has valid decimal places"""
        if v is None:
            return v
        amount_str = str(v)
        if '.' in amount_str:
            decimal_places = len(amount_str.split('.')[1])
            if decimal_places > 2:
                raise ValueError("Amount cannot have more than 2 decimal places")
        return v


class FinancialRecord(FinancialRecordBase):
    """Database model for FinancialRecord"""
    id: str = Field(default=None, alias="_id")
    user_id: str = Field(..., description="ID of the user who created this record")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class FinancialRecordResponse(FinancialRecordBase):
    """Schema for financial record response"""
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
