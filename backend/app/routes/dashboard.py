"""Dashboard Routes - API endpoints for dashboard data"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models.dashboard import DashboardSummary, CategoryBreakdown, MonthlyTrend, RecentActivity
from app.services.dashboard_service import DashboardService
from app.middleware.auth import UserContext, get_user_context, require_role

router = APIRouter(tags=["Dashboard"])


@router.get(
    "/summary",
    response_model=dict,
    summary="Get dashboard summary with aggregated data",
)
async def get_dashboard_summary(
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get aggregated dashboard summary data
    """
    try:
        if current_user.role not in ["viewer", "analyst", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Shared dashboard - all users see the same data (organization-wide)
        summary = DashboardService.get_summary_stats(user_id=None)
        return {"success": True, "data": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/categories",
    response_model=dict,
    summary="Get category-wise totals",
)
async def get_category_breakdown(
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get category-wise breakdown of expenses/income
    """
    try:
        if current_user.role not in ["viewer", "analyst", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        categories = DashboardService.get_category_wise_totals(user_id=None)
        return {"success": True, "data": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/trends",
    response_model=dict,
    summary="Get monthly trends",
)
async def get_monthly_trends(
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get monthly trends
    """
    try:
        if current_user.role not in ["viewer", "analyst", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Shared dashboard 
        trends = DashboardService.get_monthly_trends(user_id=None)
        return {"success": True, "data": trends}
    except Exception as e:
        print(f"DEBUG: Error in get_monthly_trends: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/weekly",
    response_model=dict,
    summary="Get weekly trends",
)
async def get_weekly_trends(
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get weekly trends (shared for all users - organization-wide data).
    
    Accessible by: **Viewer**, **Analyst**, **Admin**
    """
    try:
        if current_user.role not in ["viewer", "analyst", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Shared dashboard
        trends = DashboardService.get_weekly_trends(user_id=None)
        return {"success": True, "data": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/recent",
    response_model=dict,
    summary="Get recent activity",
)
async def get_recent_activity(
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get recent financial activity (shared for all users - organization-wide data).
    
    Accessible by: **Viewer**, **Analyst**, **Admin**
    """
    try:
        if current_user.role not in ["viewer", "analyst", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Shared dashboard - all users see the same data (organization-wide)
        activity = DashboardService.get_recent_activity(user_id=None)
        return {"success": True, "data": activity}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/insights",
    response_model=dict,
    summary="Get AI-generated financial insights",
)
async def get_ai_insights(
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get AI-generated insights based on current month expenses and projections for next month.
    """
    try:
        if current_user.role not in ["viewer", "analyst", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        insights = DashboardService.get_ai_insights(user_id=None)
        return {"success": True, "data": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
