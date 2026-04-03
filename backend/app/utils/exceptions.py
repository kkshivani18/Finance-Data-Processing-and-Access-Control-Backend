"""Custom exceptions for the application"""


class AppException(Exception):
    """Base exception for the application"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationException(AppException):
    """Raised when input validation fails"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class UnauthorizedException(AppException):
    """Raised when user is not authorized to perform action"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=403)


class NotFoundException(AppException):
    """Raised when resource is not found"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class ConflictException(AppException):
    """Raised when there's a conflict (e.g., duplicate email)"""
    def __init__(self, message: str):
        super().__init__(message, status_code=409)


class InternalServerException(AppException):
    """Raised when there's an internal server error"""
    def __init__(self, message: str = "Internal server error"):
        super().__init__(message, status_code=500)


class InsufficientFundsException(AppException):
    """Raised when expense exceeds available income"""
    def __init__(self, message: str = "Insufficient funds"):
        super().__init__(message, status_code=400)


class InvalidInputException(AppException):
    """Raised when input validation fails"""
    def __init__(self, message: str):
        super().__init__(message, status_code=422)
