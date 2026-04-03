from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CategoryBreakdown(BaseModel):
    """Category-wise breakdown of expenses/income"""
    category: str
    amount: float
    record_count: int


class MonthlyTrend(BaseModel):
    """Monthly trend data"""
    month: str 
    income: float = 0.0
    expense: float = 0.0
    net: float = 0.0


class DashboardSummary(BaseModel):                      
    """Dashboard summary with aggregated data"""
    total_income: float = 0.0
    total_expense: float = 0.0
    net_balance: float = 0.0
    total_records: int = 0
    last_7_days_expense: float = 0.0
    last_30_days_expense: float = 0.0


class RecentActivity(BaseModel):
    """Recent transaction activity"""
    id: str = Field(alias="_id")
    amount: float
    type: str  # income or expense
    category: str
    date: datetime
    description: str
    user_id: str

    class Config:
        populate_by_name = True
