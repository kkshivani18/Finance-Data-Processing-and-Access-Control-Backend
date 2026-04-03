"""User Service - Business logic for user management"""
from typing import List, Optional
from bson.objectid import ObjectId
from pymongo.errors import DuplicateKeyError
from pymongo.collection import Collection
from datetime import datetime

from app.models.user import User, UserCreate, UserUpdate, UserResponse
from app.database.db import get_users_collection
from app.utils.exceptions import (
    NotFoundException,
    ConflictException,
    ValidationException,
)


class UserService:
    """Service for user management operations"""

    @staticmethod
    def get_collection() -> Collection:
        """Get users collection"""
        return get_users_collection()

    @staticmethod
    def create_user(user_create: UserCreate) -> UserResponse:
        """
        Create a new user during registration.
        
        SECURITY: All new users are assigned the "viewer" role by default.
        Only admin users can upgrade roles through the admin management endpoints.
        This prevents privilege escalation during registration.
            
        Returns:
            UserResponse with created user data 
        """
        from app.middleware.auth import hash_password
        
        collection = UserService.get_collection()

        email_normalized = user_create.email.lower().strip()
        
        if not user_create.name or not user_create.name.strip():
            raise ValidationException("Name cannot be empty")
        
        if user_create.name != user_create.name.strip():
            raise ValidationException("Name cannot have leading or trailing whitespace")
        
        if len(user_create.name) < 2:
            raise ValidationException("Name must be at least 2 characters")
        
        if len(user_create.name) > 100:
            raise ValidationException("Name must not exceed 100 characters")
        
        existing_user = collection.find_one({"email": email_normalized})
        if existing_user:
            raise ConflictException("Email already exists")

        password_hash = hash_password(user_create.password)
        
        user_doc = {
            "email": email_normalized,
            "name": user_create.name.strip(),
            "role": "viewer",  # Default role for all new users
            "status": "active",
            "password_hash": password_hash,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        # insert user
        try:
            result = collection.insert_one(user_doc)
            return UserResponse(
                email=user_doc["email"],
                name=user_doc["name"],
                role=user_doc["role"],
                status=user_doc["status"],
                id=str(result.inserted_id),
                created_at=user_doc["created_at"],
                updated_at=user_doc["updated_at"]
            )
        except DuplicateKeyError:
            raise ConflictException("Email already exists")
        except Exception as e:
            raise ValidationException("Failed to create user. Please try again later.")

    @staticmethod
    def create_user_with_password(user_dict: dict) -> dict:
        """
        Create a new user with password hash (for registration).
        
        Args:
            user_dict: Dictionary with email, name, role, password_hash, status
            
        Returns:
            Raw user document with _id
        """
        collection = UserService.get_collection()

        # Check email already exists
        existing_user = collection.find_one({"email": user_dict["email"].lower()})
        if existing_user:
            raise ConflictException(f"User with email '{user_dict['email']}' already exists")

        user_doc = {
            "email": user_dict["email"].lower(),
            "name": user_dict["name"],
            "role": user_dict["role"].lower(),
            "status": user_dict.get("status", "active").lower(),
            "password_hash": user_dict["password_hash"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        try:
            result = collection.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            return user_doc
        except DuplicateKeyError:
            raise ConflictException(f"User with email '{user_dict['email']}' already exists")
        except Exception as e:
            raise ValidationException(f"Failed to create user: {str(e)}")

    @staticmethod
    def get_user_by_id(user_id: str) -> UserResponse:
        """
        Get user by ID.
        
        Args:
            user_id: User ID (MongoDB ObjectId as string)
            
        Returns:
            UserResponse with user data
        """
        collection = UserService.get_collection()

        if not ObjectId.is_valid(user_id):
            raise ValidationException(f"Invalid user ID format: {user_id}")

        user = collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise NotFoundException(f"User with ID '{user_id}' not found")

        user["_id"] = str(user["_id"])
        return UserResponse(**user)

    @staticmethod
    def get_user_by_email(email: str) -> dict:
        """
        Get user by email.
        Used for authentication - includes password_hash.
        
        Args:
            email: User email
            
        Returns:
            Raw user document if found
            
        Raises:
            NotFoundException: If user not found
        """
        collection = UserService.get_collection()
        user = collection.find_one({"email": email.lower()})
        if not user:
            raise NotFoundException(f"User with email '{email}' not found")
        return user

    @staticmethod
    def get_all_users(skip: int = 0, limit: int = 100) -> tuple[List[UserResponse], int]:
        """
        Get all users with pagination.
        
        Args:
            skip: Number of users to skip (for pagination)
            limit: Maximum number of users to return
            
        Returns:
            Tuple of (list of UserResponse, total count)
        """
        collection = UserService.get_collection()

        # Get total count
        total_count = collection.count_documents({})

        # Get paginated results
        users = list(
            collection.find({})
            .skip(skip)
            .limit(limit)
            .sort("created_at", -1)
        )

        user_responses = []
        for user in users:
            user_responses.append(UserResponse(
                id=str(user["_id"]),
                email=user["email"],
                name=user["name"],
                role=user["role"],
                status=user["status"],
                created_at=user["created_at"],
                updated_at=user["updated_at"]
            ))
        
        return user_responses, total_count

    @staticmethod
    def update_user(user_id: str, user_update: UserUpdate) -> UserResponse:
        """
        Update user information.
        
        Args:
            user_id: User ID to update
            user_update: UserUpdate schema with fields to update
            
        Returns:
            Updated UserResponse
            
        Raises:
            NotFoundException: If user not found
            ValidationException: If user_id is invalid or update failed
        """
        collection = UserService.get_collection()

        # Validate ObjectId format
        if not ObjectId.is_valid(user_id):
            raise ValidationException(f"Invalid user ID format: {user_id}")

        # Prepare update document
        update_doc = {}
        if user_update.name is not None:
            update_doc["name"] = user_update.name
        if user_update.role is not None:
            update_doc["role"] = user_update.role.lower()
        if user_update.status is not None:
            update_doc["status"] = user_update.status.lower()

        # Add updated_at timestamp
        update_doc["updated_at"] = datetime.utcnow()

        # Update user
        result = collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_doc},
            return_document=True,
        )

        if not result:
            raise NotFoundException(f"User with ID '{user_id}' not found")

        result["_id"] = str(result["_id"])
        return UserResponse(**result)

    @staticmethod
    def delete_user(user_id: str) -> bool:
        """
        Delete a user by ID.
        
        Args:
            user_id: User ID to delete
            
        Returns:
            True if user was deleted, False otherwise
            
        Raises:
            NotFoundException: If user not found
            ValidationException: If user_id is invalid
        """
        collection = UserService.get_collection()

        if not ObjectId.is_valid(user_id):
            raise ValidationException(f"Invalid user ID format: {user_id}")

        # Delete user
        result = collection.delete_one({"_id": ObjectId(user_id)})

        if result.deleted_count == 0:
            raise NotFoundException(f"User with ID '{user_id}' not found")

        return True

    @staticmethod
    def user_exists_by_id(user_id: str) -> bool:
        """
        Check if user exists by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            True if user exists, False otherwise
        """
        if not ObjectId.is_valid(user_id):
            return False

        collection = UserService.get_collection()
        return collection.count_documents({"_id": ObjectId(user_id)}) > 0

    @staticmethod
    def user_exists_by_email(email: str) -> bool:
        """
        Check if user exists by email.
        
        Args:
            email: User email
            
        Returns:
            True if user exists, False otherwise
        """
        collection = UserService.get_collection()
        return collection.count_documents({"email": email.lower()}) > 0

    @staticmethod
    def change_user_status(user_id: str, status: str) -> UserResponse:
        """
        Change user status (active/inactive).
        
        Args:
            user_id: User ID
            status: New status (active or inactive)
            
        Returns:
            Updated UserResponse
        """
        if status.lower() not in ["active", "inactive"]:
            raise ValidationException("Status must be 'active' or 'inactive'")

        return UserService.update_user(
            user_id,
            UserUpdate(status=status.lower())
        )

    @staticmethod
    def change_user_role(user_id: str, role: str) -> UserResponse:
        """
        Change user role.
        
        Args:
            user_id: User ID
            role: New role (viewer, analyst, or admin)
            
        Returns:
            Updated UserResponse
            
        Raises:
            NotFoundException: If user not found
            ValidationException: If invalid role or user_id
        """
        if role.lower() not in ["viewer", "analyst", "admin"]:
            raise ValidationException("Role must be 'viewer', 'analyst', or 'admin'")

        return UserService.update_user(
            user_id,
            UserUpdate(role=role.lower())
        )
