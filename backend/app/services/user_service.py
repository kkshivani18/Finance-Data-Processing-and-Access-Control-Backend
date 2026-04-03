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
    """Service for user management operations with dependency injection"""

    def __init__(self, collection: Collection = None):
        """
        Initialize UserService with a MongoDB collection.
        """
        self._collection = collection if collection is not None else get_users_collection()

    @property
    def collection(self) -> Collection:
        """Get the users collection"""
        return self._collection

    def create_user(self, user_create: UserCreate) -> UserResponse:
        """
        Create a new user during registration.
        
        SECURITY: All new users are assigned the "viewer" role by default.
        Only admin users can upgrade roles through the admin management endpoints.
        This prevents privilege escalation during registration.
            
        Returns:
            UserResponse with created user data 
        """
        from app.middleware.auth import hash_password
        
        email_normalized = user_create.email.lower().strip()
        
        if not user_create.name or not user_create.name.strip():
            raise ValidationException("Name cannot be empty")
        
        if user_create.name != user_create.name.strip():
            raise ValidationException("Name cannot have leading or trailing whitespace")
        
        if len(user_create.name) < 2:
            raise ValidationException("Name must be at least 2 characters")
        
        if len(user_create.name) > 100:
            raise ValidationException("Name must not exceed 100 characters")
        
        existing_user = self.collection.find_one({"email": email_normalized})
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
            result = self.collection.insert_one(user_doc)
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

    def create_user_with_password(self, user_dict: dict) -> dict:
        """
        Create a new user with password hash (for registration).
        
        Args:
            user_dict: Dictionary with email, name, role, password_hash, status
            
        Returns:
            Raw user document with _id
        """
        # Check email already exists
        existing_user = self.collection.find_one({"email": user_dict["email"].lower()})
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
            result = self.collection.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            return user_doc
        except DuplicateKeyError:
            raise ConflictException(f"User with email '{user_dict['email']}' already exists")
        except Exception as e:
            raise ValidationException(f"Failed to create user: {str(e)}")

    def get_user_by_id(self, user_id: str) -> UserResponse:
        """
        Get user by ID.
            
        Returns:
            UserResponse with user data
        """
        if not ObjectId.is_valid(user_id):
            raise ValidationException(f"Invalid user ID format: {user_id}")

        user = self.collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise NotFoundException(f"User with ID '{user_id}' not found")

        return UserResponse(
            email=user["email"],
            name=user["name"],
            role=user["role"],
            status=user["status"],
            id=str(user["_id"]),
            created_at=user["created_at"],
            updated_at=user["updated_at"]
        )

    def get_user_by_email(self, email: str) -> dict:
        """
        Get user by email.
        """
        user = self.collection.find_one({"email": email.lower()})
        if not user:
            raise NotFoundException(f"User with email '{email}' not found")
        return user

    def get_all_users(self, skip: int = 0, limit: int = 100) -> tuple[List[UserResponse], int]:
        """
        Get all users with pagination.
        """
        total_count = self.collection.count_documents({})

        # Get paginated results
        users = list(
            self.collection.find({})
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

    def update_user(self, user_id: str, user_update: UserUpdate) -> UserResponse:
        """
        Update user information.
            
        Returns:
            Updated UserResponse
        """
        # Validate ObjectId format
        if not ObjectId.is_valid(user_id):
            raise ValidationException(f"Invalid user ID format: {user_id}")

        update_doc = {}
        if user_update.name is not None:
            update_doc["name"] = user_update.name
        if user_update.role is not None:
            update_doc["role"] = user_update.role.lower()
        if user_update.status is not None:
            update_doc["status"] = user_update.status.lower()

        update_doc["updated_at"] = datetime.utcnow()

        # Update user
        result = self.collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_doc},
            return_document=True,
        )

        if not result:
            raise NotFoundException(f"User with ID '{user_id}' not found")

        return UserResponse(
            email=result["email"],
            name=result["name"],
            role=result["role"],
            status=result["status"],
            id=str(result["_id"]),
            created_at=result["created_at"],
            updated_at=result["updated_at"]
        )

    def delete_user(self, user_id: str) -> bool:
        """
        Delete a user by ID.    
        Returns:
            True if user was deleted, False otherwise
        """
        if not ObjectId.is_valid(user_id):
            raise ValidationException(f"Invalid user ID format: {user_id}")

        # Delete user
        result = self.collection.delete_one({"_id": ObjectId(user_id)})

        if result.deleted_count == 0:
            raise NotFoundException(f"User with ID '{user_id}' not found")

        return True

    def user_exists_by_id(self, user_id: str) -> bool:
        """
        Check if user exists by ID.
        True if user exists, False otherwise
        """
        if not ObjectId.is_valid(user_id):
            return False

        return self.collection.count_documents({"_id": ObjectId(user_id)}) > 0

    def user_exists_by_email(self, email: str) -> bool:
        """
        Check if user exists by email.
        """
        return self.collection.count_documents({"email": email.lower()}) > 0

    def change_user_status(self, user_id: str, status: str) -> UserResponse:
        """
        Change user status (active/inactive).
    
        Returns:
            Updated UserResponse
        """
        if status.lower() not in ["active", "inactive"]:
            raise ValidationException("Status must be 'active' or 'inactive'")

        return self.update_user(
            user_id,
            UserUpdate(status=status.lower())
        )

    def change_user_role(self, user_id: str, role: str) -> UserResponse:
        """
        Change user role.
        Returns:
            Updated UserResponse
        """
        if role.lower() not in ["viewer", "analyst", "admin"]:
            raise ValidationException("Role must be 'viewer', 'analyst', or 'admin'")

        return self.update_user(
            user_id,
            UserUpdate(role=role.lower())
        )
