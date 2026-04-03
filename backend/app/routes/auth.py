from fastapi import APIRouter, HTTPException, status
from app.models.user import UserLogin, TokenResponse, UserResponse, UserCreate
from app.middleware.auth import hash_password, verify_password, create_access_token
from app.services.user_service import UserService
from app.utils.exceptions import NotFoundException, ValidationException, ConflictException
from app.utils.validators import validate_email, validate_password as validate_pwd

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login with email and password",
)
async def login(credentials: UserLogin):
    """
    Authenticate user with email and password.
    Returns: JWT token to use in Authorization header
    """
    try:
        # Validate inputs
        if not credentials.email or not credentials.email.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Email cannot be empty",
            )
        
        if not credentials.password or not credentials.password.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password cannot be empty",
            )
        
        email_normalized = credentials.email.lower().strip()
        
        user = UserService.get_user_by_email(email_normalized)
        
        if not user.get("password_hash"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",  
            )
        
        # Verify password
        if not verify_password(credentials.password, user.get("password_hash")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",  
            )
        
        if user.get("status") != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive. Please contact administrator",
            )
        
        access_token = create_access_token(
            user_id=str(user.get("_id")),
            role=user.get("role"),
        )
        
        user_response = UserResponse(
            email=user["email"],
            name=user["name"],
            role=user["role"],
            status=user["status"],
            id=str(user["_id"]),
            created_at=user["created_at"],
            updated_at=user["updated_at"],
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response,
        )
    
    except HTTPException:
        raise
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials", 
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.message,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login. Please try again later.",
        )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(user_create: UserCreate):
    """
    Register a new user.
    """
    try:
        if not user_create.name or not user_create.name.strip():
            raise ValidationException("Name cannot be empty")
        
        user = UserService.create_user(user_create)
        
        access_token = create_access_token(
            user_id=str(user.id),
            role=user.role,
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user,
        )
    
    except ConflictException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message,
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.message,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration. Please try again later.",
        )
