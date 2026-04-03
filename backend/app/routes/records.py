"""Records Routes - API endpoints for financial records"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List
from datetime import datetime

from app.models.financial_record import (
    FinancialRecordCreate,
    FinancialRecordUpdate,
    FinancialRecord,
    FinancialRecordResponse,
)
from app.services.record_service import RecordService
from app.middleware.auth import UserContext, get_user_context, check_role
from app.utils.exceptions import ValidationException, NotFoundException, InsufficientFundsException
from app.utils.validators import validate_pagination

router = APIRouter(tags=["Records"])


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new financial record",
)
async def create_record(
    record: FinancialRecordCreate,
    current_user: UserContext = Depends(get_user_context),
):
    """
    Create a new financial record.
    """
    check_role(current_user, ["admin"])
    
    try:
        record_data = record.model_dump()
        
        if record_data.get("type") == "expense":
            RecordService.validate_expense_against_income(
                current_user.user_id,
                record_data.get("amount")
            )
        
        created_record = RecordService.create_record(current_user.user_id, record_data)
        return {"success": True, "data": created_record}
    
    except InsufficientFundsException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=422, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create record")


@router.get(
    "",
    response_model=dict,
    summary="List financial records with pagination",
)
async def list_records(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    current_user: UserContext = Depends(get_user_context),
):
    """
    List financial records based on user role.
    
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Max number of records to return (default: 100, max: 1000)
    
    Returns paginated list with total count.
    """
    check_role(current_user, ["viewer", "analyst", "admin"])
    
    try:
        if current_user.role in ["admin", "analyst"]:
            records, total = RecordService.get_all_records(skip=skip, limit=limit)
        else:
            records, total = RecordService.get_user_records(
                current_user.user_id, skip=skip, limit=limit
            )
        
        return {
            "success": True,
            "data": records,
            "total": total,
            "skip": skip,
            "limit": limit,
            "count": len(records),
        }
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve records")


@router.get(
    "/stats",
    response_model=dict,
    summary="Get financial summary statistics",
)
async def get_stats(
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get summary statistics for financial records 
    """
    check_role(current_user, ["analyst", "admin"])
    
    try:
        stats = RecordService.get_summary_stats(current_user.user_id)
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")


@router.get(
    "/{record_id}",
    response_model=dict,
    summary="Get a specific financial record",
)
async def get_record(
    record_id: str,
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get a specific financial record by ID.
    """
    check_role(current_user, ["viewer", "analyst", "admin"])
    
    try:
        record = RecordService.get_record_by_id(
            record_id, current_user.user_id, role=current_user.role
        )
        return {"success": True, "data": record}
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=422, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve record")


@router.put(
    "/{record_id}",
    response_model=dict,
    summary="Update a financial record",
)
async def update_record(
    record_id: str,
    record_update: FinancialRecordUpdate,
    current_user: UserContext = Depends(get_user_context),
):
    """
    Update a financial record.
    """
    check_role(current_user, ["admin", "analyst"])
    
    try:
        update_data = record_update.model_dump(exclude_unset=True)
        
        if "amount" in update_data and update_data.get("amount"):
            current_record = RecordService.get_record_by_id(
                record_id, current_user.user_id, role=current_user.role
            )
            is_expense = update_data.get("type", current_record.get("type")) == "expense"
            
            if is_expense:
                current_amount = current_record.get("amount", 0)
                new_amount = update_data.get("amount")
                amount_increase = new_amount - current_amount
                
                if amount_increase > 0:
                    RecordService.validate_expense_against_income(
                        current_user.user_id,
                        amount_increase
                    )
        
        updated_record = RecordService.update_record(
            record_id, current_user.user_id, update_data, role=current_user.role
        )
        return {"success": True, "data": updated_record}
    except InsufficientFundsException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=422, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update record")


@router.delete(
    "/{record_id}",
    response_model=dict,
    summary="Delete a financial record",
)
async def delete_record(
    record_id: str,
    current_user: UserContext = Depends(get_user_context),
):
    """
    Delete a financial record.
    Only admin users can delete records
    """
    check_role(current_user, ["admin"])
    
    try:
        RecordService.delete_record(record_id, current_user.user_id)
        return {"success": True, "message": "Record deleted successfully"}
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=422, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete record")


@router.get(
    "/category/{category}",
    response_model=dict,
    summary="Get records filtered by category",
)
async def get_records_by_category(
    category: str,
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get financial records filtered by category.
    
    Valid categories: food, transportation, entertainment, utilities, salary, other
    """
    check_role(current_user, ["viewer", "analyst", "admin"])
    try:
        records = RecordService.get_records_by_category(current_user.user_id, category)
        return {
            "success": True,
            "data": records,
            "category": category,
            "count": len(records),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
