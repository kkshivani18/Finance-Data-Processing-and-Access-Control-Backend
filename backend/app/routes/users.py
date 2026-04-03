from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List

from app.models.user import UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService
from app.middleware.auth import UserContext, get_user_context, check_role
from app.utils.exceptions import (
    NotFoundException,
    UnauthorizedException,
    ConflictException,
    ValidationException,
)

router = APIRouter(tags=["Users"])


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
)
async def create_user(
    user_create: UserCreate,
    current_user: UserContext = Depends(get_user_context),
):
    """
    Create a new user.
    """
    # check authorization
    check_role(current_user, ["admin"])

    try:
        user = UserService.create_user(user_create)
        return user
    except ConflictException as e:
        raise HTTPException(status_code=409, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "",
    response_model=dict,
    summary="List all users with pagination",
)
async def list_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max users to return"),
    current_user: UserContext = Depends(get_user_context),
):
    """
    List all users with pagination.
    """
    # Check authorization
    check_role(current_user, ["admin"])

    try:
        users, total = UserService.get_all_users(skip=skip, limit=limit)
        return {
            "users": users,
            "total": total,
            "skip": skip,
            "limit": limit,
            "count": len(users),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID",
)
async def get_user(
    user_id: str,
    current_user: UserContext = Depends(get_user_context),
):
    """
    Get a specific user by ID.
    Users can view their own profile. Admins can view any user.
    """
    if current_user.user_id != user_id and not current_user.has_role(["admin"]):
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your own profile")

    try:
        user = UserService.get_user_by_id(user_id)
        return user
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update user information",
)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: UserContext = Depends(get_user_context),
):
    """
    Update a user's information.
    **Admin only**
    """
    # Check authorization
    check_role(current_user, ["admin"])

    try:
        user = UserService.update_user(user_id, user_update)
        return user
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user",
)
async def delete_user(
    user_id: str,
    current_user: UserContext = Depends(get_user_context),
):
    """
    Delete a user by ID.
    Returns 204 No Content on success.
    """
    # Check authorization
    check_role(current_user, ["admin"])

    try:
        UserService.delete_user(user_id)
        return None
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
    summary="Change user status",
)
async def change_user_status(
    user_id: str,
    status: str = Query(..., description="New status: active or inactive"),
    current_user: UserContext = Depends(get_user_context),
):
    """
    Change a user's status (active/inactive).
    """
    # Check authorization
    check_role(current_user, ["admin"])

    try:
        user = UserService.change_user_status(user_id, status)
        return user
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse,
    summary="Change user role",
)
async def change_user_role(
    user_id: str,
    role: str = Query(..., description="New role: viewer, analyst, or admin"),
    current_user: UserContext = Depends(get_user_context),
):
    """
    Change a user's role (viewer/analyst/admin)
    """
    # Check authorization
    check_role(current_user, ["admin"])

    try:
        user = UserService.change_user_role(user_id, role)
        return user
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
