"""Validation utilities"""
from datetime import datetime
import re
from .exceptions import ValidationException


def validate_amount(amount: float) -> None:
    """Validate that amount is positive and properly formatted"""
    if not isinstance(amount, (int, float)):
        raise ValidationException("Amount must be a number")
    if amount <= 0:
        raise ValidationException("Amount must be greater than 0")
    
    if amount > 999999999:  
        raise ValidationException("Amount exceeds maximum allowed value")
    
    if isinstance(amount, float):
        if len(str(amount).split('.')[-1]) > 2:
            raise ValidationException("Amount cannot have more than 2 decimal places")


def validate_date_not_future(date: datetime) -> None:
    """Validate that date is not in the future"""
    if date > datetime.utcnow():
        raise ValidationException("Date cannot be in the future")


def validate_role(role: str) -> None:
    """Validate that role is valid"""
    valid_roles = ["viewer", "analyst", "admin"]
    if role not in valid_roles:
        raise ValidationException(f"Invalid role. Must be one of: {', '.join(valid_roles)}")


def validate_record_type(record_type: str) -> None:
    """Validate that record type is valid"""
    valid_types = ["income", "expense"]
    if record_type not in valid_types:
        raise ValidationException(f"Invalid type. Must be one of: {', '.join(valid_types)}")


def validate_category(category: str) -> None:
    """Validate that category is valid"""
    valid_categories = ["food", "transportation", "entertainment", "utilities", "salary", "other"]
    if category not in valid_categories:
        raise ValidationException(
            f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        )


def validate_description(description: str) -> None:
    """Validate description field"""
    if not isinstance(description, str):
        raise ValidationException("Description must be a string")
    if len(description) > 500:
        raise ValidationException("Description cannot exceed 500 characters")
    
    # Check for potential XSS/injection
    if "<script>" in description.lower() or "javascript:" in description.lower():
        raise ValidationException("Description contains invalid content")


def validate_email(email: str) -> None:
    """Validate email format and length"""
    if not isinstance(email, str):
        raise ValidationException("Email must be a string")
    if len(email) < 5:
        raise ValidationException("Email must be at least 5 characters")
    if len(email) > 255:
        raise ValidationException("Email must not exceed 255 characters")
    
    # Basic email regex validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValidationException("Invalid email format")


def validate_password(password: str) -> None:
    """Validate password strength"""
    if not isinstance(password, str):
        raise ValidationException("Password must be a string")
    if len(password) < 8:
        raise ValidationException("Password must be at least 8 characters")
    if len(password) > 128:
        raise ValidationException("Password must not exceed 128 characters")
    
    if not re.search(r'[A-Z]', password):
        raise ValidationException("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        raise ValidationException("Password must contain at least one lowercase letter")
    
    if not re.search(r'[0-9]', password):
        raise ValidationException("Password must contain at least one number")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValidationException("Password must contain at least one special character (!@#$%^&*)")


def validate_name(name: str) -> None:
    """Validate user name"""
    if not isinstance(name, str):
        raise ValidationException("Name must be a string")
    if len(name.strip()) < 2:
        raise ValidationException("Name must be at least 2 characters")
    if len(name) > 100:
        raise ValidationException("Name must not exceed 100 characters")
    if name != name.strip():
        raise ValidationException("Name cannot have leading or trailing whitespace")


def validate_pagination(skip: int, limit: int) -> None:
    """Validate pagination parameters"""
    if skip < 0:
        raise ValidationException("Skip must be >= 0")
    if limit < 1 or limit > 1000:
        raise ValidationException("Limit must be between 1 and 1000")
