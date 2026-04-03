"""Record Service - Business logic for financial records"""
from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.utils.exceptions import NotFoundException, ValidationException, InsufficientFundsException


class RecordService:
    """Service for managing financial records"""

    @staticmethod
    def create_record(user_id: str, record_data: dict) -> dict:
        """Create a new financial record"""
        db = get_database()
        records_collection = db["financial_records"]

        record = {
            "user_id": user_id,
            "description": record_data.get("description", ""),
            "amount": record_data.get("amount"),
            "type": record_data.get("type"),
            "category": record_data.get("category"),
            "date": record_data.get("date"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        result = records_collection.insert_one(record)
        record["_id"] = str(result.inserted_id)
        return record

    @staticmethod
    def get_user_records(user_id: str, skip: int = 0, limit: int = 100) -> tuple:
        """Get all financial records for a user with pagination"""
        db = get_database()
        records_collection = db["financial_records"]

        total = records_collection.count_documents({"user_id": user_id})
        records = list(
            records_collection.find({"user_id": user_id})
            .sort("date", -1)
            .skip(skip)
            .limit(limit)
        )

        # Convert ObjectId to string
        for record in records:
            record["_id"] = str(record["_id"])

        return records, total

    @staticmethod
    def get_all_records(skip: int = 0, limit: int = 100) -> tuple:
        """Get ALL financial records (for admin/analyst) with pagination"""
        db = get_database()
        records_collection = db["financial_records"]

        total = records_collection.count_documents({})
        records = list(
            records_collection.find({})
            .sort("date", -1)
            .skip(skip)
            .limit(limit)
        )

        for record in records:
            record["_id"] = str(record["_id"])

        return records, total

    @staticmethod
    def get_record_by_id(record_id: str, user_id: str, role: str = "viewer") -> dict:
        """
        Get a specific financial record by ID. 
        """
        db = get_database()
        records_collection = db["financial_records"]

        try:
            obj_id = ObjectId(record_id)
        except Exception:
            raise ValidationException("Invalid record ID format")

        if role == "viewer":
            record = records_collection.find_one({"_id": obj_id, "user_id": user_id})
        else:
            record = records_collection.find_one({"_id": obj_id})

        if not record:
            raise NotFoundException("Record not found")

        record["_id"] = str(record["_id"])
        return record

    @staticmethod
    def update_record(record_id: str, user_id: str, update_data: dict, role: str = "viewer") -> dict:
        """
        Update a financial record.
        """
        db = get_database()
        records_collection = db["financial_records"]

        try:
            obj_id = ObjectId(record_id)
        except Exception:
            raise ValidationException("Invalid record ID format")

        # Build update object with only provided fields
        update_dict = {}
        for key in ["description", "amount", "type", "category", "date"]:
            if key in update_data:
                update_dict[key] = update_data[key]

        update_dict["updated_at"] = datetime.utcnow()

        if role == "viewer":
            result = records_collection.find_one_and_update(
                {"_id": obj_id, "user_id": user_id},
                {"$set": update_dict},
                return_document=True,
            )
        else:
            result = records_collection.find_one_and_update(
                {"_id": obj_id},
                {"$set": update_dict},
                return_document=True,
            )

        if not result:
            raise NotFoundException("Record not found")

        result["_id"] = str(result["_id"])
        return result

    @staticmethod
    def delete_record(record_id: str, user_id: str) -> bool:
        """Delete a financial record"""
        db = get_database()
        records_collection = db["financial_records"]

        try:
            obj_id = ObjectId(record_id)
        except Exception:
            raise ValidationException("Invalid record ID format")

        result = records_collection.delete_one({"_id": obj_id, "user_id": user_id})

        if result.deleted_count == 0:
            raise NotFoundException("Record not found")

        return True

    @staticmethod
    def get_records_by_category(user_id: str, category: str) -> list:
        """Get records for a user filtered by category"""
        db = get_database()
        records_collection = db["financial_records"]

        records = list(
            records_collection.find({"user_id": user_id, "category": category}).sort(
                "date", -1
            )
        )

        for record in records:
            record["_id"] = str(record["_id"])

        return records

    @staticmethod
    def get_summary_stats(user_id: str) -> dict:
        """Get summary statistics for user's financial records"""
        db = get_database()
        records_collection = db["financial_records"]

        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$group": {
                    "_id": "$type",
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                    "average": {"$avg": "$amount"},
                }
            },
        ]

        stats = list(records_collection.aggregate(pipeline))

        result = {"income": {}, "expense": {}}

        for stat in stats:
            record_type = stat["_id"]
            if record_type in result:
                result[record_type] = {
                    "total": stat["total"],
                    "count": stat["count"],
                    "average": stat["average"],
                }

        return result

    @staticmethod
    def validate_expense_against_income(user_id: str, expense_amount: float) -> None:
        """
        Validate that a new expense doesn't exceed total income.
        
        Args:
            user_id: The user creating the expense
            expense_amount: The amount of the expense
            
        Raises:
            InsufficientFundsException: If expense exceeds total income
        """
        db = get_database()
        records_collection = db["financial_records"]

        # Get total income
        income_stats = list(
            records_collection.aggregate([
                {"$match": {"user_id": user_id, "type": "income"}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ])
        )

        total_income = income_stats[0]["total"] if income_stats and income_stats[0].get("total") else 0

        # Get total existing expenses
        expense_stats = list(
            records_collection.aggregate([
                {"$match": {"user_id": user_id, "type": "expense"}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ])
        )

        total_expenses = expense_stats[0]["total"] if expense_stats and expense_stats[0].get("total") else 0

        # Check if new expense would exceed income
        if total_expenses + expense_amount > total_income:
            available = total_income - total_expenses
            raise InsufficientFundsException(
                f"Expense amount ${expense_amount:.2f} exceeds available balance ${available:.2f}. "
                f"Total income: ${total_income:.2f}, Current expenses: ${total_expenses:.2f}"
            )
