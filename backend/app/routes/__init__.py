"""Routes module"""
from .users import router as users_router
from .auth import router as auth_router
from .records import router as records_router
from .dashboard import router as dashboard_router

__all__ = ["users_router", "auth_router", "records_router", "dashboard_router"]
