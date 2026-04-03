from datetime import datetime, timedelta
from app.database import get_database
from app.models.dashboard import DashboardSummary, CategoryBreakdown, MonthlyTrend, RecentActivity


class DashboardService:
    """Service for managing dashboard data"""

    @staticmethod
    def get_summary_stats(user_id: str = None) -> dict:
        """Get summary statistics for dashboard (shared across all users if user_id is None)"""
        db = get_database()
        records_collection = db["financial_records"]

        # Build match stage - if user_id is None, fetch all records (shared dashboard)
        match_stage = {} if user_id is None else {"user_id": user_id}

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": None,
                    "total_income": {
                        "$sum": {"$cond": [{"$eq": ["$type", "income"]}, "$amount", 0]}
                    },
                    "total_expense": {
                        "$sum": {"$cond": [{"$eq": ["$type", "expense"]}, "$amount", 0]}
                    },
                    "total_records": {"$sum": 1},
                }
            },
        ]

        result = list(records_collection.aggregate(pipeline))
        
        if not result:
            return {
                "total_income": 0.0,
                "total_expense": 0.0,
                "net_balance": 0.0,
                "total_records": 0,
                "last_7_days_expense": 0.0,
                "last_30_days_expense": 0.0,
            }

        stats = result[0]
        total_income = stats.get("total_income", 0.0)
        total_expense = stats.get("total_expense", 0.0)
        
        # Get last 7 days and 30 days expense
        now = datetime.utcnow()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)
        
        match_7days = {"type": "expense", "date": {"$gte": seven_days_ago}}
        match_30days = {"type": "expense", "date": {"$gte": thirty_days_ago}}
        
        if user_id is not None:
            match_7days["user_id"] = user_id
            match_30days["user_id"] = user_id
        
        last_7_days_expense = list(records_collection.aggregate([
            {"$match": match_7days},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]))
        
        last_30_days_expense = list(records_collection.aggregate([
            {"$match": match_30days},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]))

        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "net_balance": total_income - total_expense,
            "total_records": stats.get("total_records", 0),
            "last_7_days_expense": last_7_days_expense[0]["total"] if last_7_days_expense else 0.0,
            "last_30_days_expense": last_30_days_expense[0]["total"] if last_30_days_expense else 0.0,
        }

    @staticmethod
    def get_category_wise_totals(user_id: str = None) -> list:
        """Get category-wise totals for a user (or all users if user_id is None)"""
        db = get_database()
        records_collection = db["financial_records"]
        match_stage = {} if user_id is None else {"user_id": user_id}

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": {"category": "$category", "type": "$type"},
                    "amount": {"$sum": "$amount"},
                    "record_count": {"$sum": 1},
                }
            },
            {"$project": {
                "_id": 0,
                "category": "$_id.category",
                "type": "$_id.type",
                "amount": 1,
                "record_count": 1
            }},
            {"$sort": {"amount": -1}}
        ]

        return list(records_collection.aggregate(pipeline))

    @staticmethod
    def get_monthly_trends(user_id: str = None) -> list:
        """Get monthly trends (shared across all users if user_id is None)"""
        db = get_database()
        records_collection = db["financial_records"]

        # Build match stage - if user_id is None, fetch all records (shared dashboard)
        match_stage = {} if user_id is None else {"user_id": user_id}

        # Aggregate by month
        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$date"},
                        "month": {"$month": "$date"}
                    },
                    "income": {
                        "$sum": {"$cond": [{"$eq": ["$type", "income"]}, "$amount", 0]}
                    },
                    "expense": {
                        "$sum": {"$cond": [{"$eq": ["$type", "expense"]}, "$amount", 0]}
                    },
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]

        try:
            result = list(records_collection.aggregate(pipeline))
        except Exception as e:
            result = []
        
        month_map = {}
        for item in result:
            month_num = item['_id']['month']
            month_map[month_num] = item

        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly_data = []
        
        for month_num in range(1, 13):
            data = month_map.get(month_num, {})
            income_val = data.get("income", 0.0) if data else 0.0
            expense_val = data.get("expense", 0.0) if data else 0.0
            monthly_data.append({
                "month": months[month_num - 1],
                "monthNum": month_num,
                "income": float(income_val) if income_val else 0.0,
                "expense": float(expense_val) if expense_val else 0.0,
                "net": float(income_val - expense_val) if income_val and expense_val else (float(income_val) if income_val else 0.0)
            })

        return monthly_data


    @staticmethod
    def get_weekly_trends(user_id: str = None) -> list:
        """Get daily trends for the current week (shared across all users if user_id is None)"""
        db = get_database()
        records_collection = db["financial_records"]

        now = datetime.utcnow()
        monday = now - timedelta(days=now.weekday())
        sunday = monday + timedelta(days=6)

        match_stage = {
            "date": {
                "$gte": monday.replace(hour=0, minute=0, second=0, microsecond=0),
                "$lte": sunday.replace(hour=23, minute=59, second=59)
            }
        }
        if user_id is not None:
            match_stage["user_id"] = user_id

        pipeline = [
            {
                "$match": match_stage
            },
            {
                "$group": {
                    "_id": {
                        "dayOfWeek": {"$dayOfWeek": "$date"}  
                    },
                    "income": {
                        "$sum": {"$cond": [{"$eq": ["$type", "income"]}, "$amount", 0]}
                    },
                    "expense": {
                        "$sum": {"$cond": [{"$eq": ["$type", "expense"]}, "$amount", 0]}
                    },
                }
            },
        ]

        result = list(records_collection.aggregate(pipeline))
        
        day_map = {}
        for item in result:
            day_num = item['_id']['dayOfWeek']
            day_map[day_num] = item

        day_short_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        day_order = [2, 3, 4, 5, 6, 7, 1]
        
        weekly_data = []
        for day_num in day_order:
            data = day_map.get(day_num, {})
            day_name = day_short_names[day_num - 1] 
            
            weekly_data.append({
                "day": day_name,
                "dayNum": day_num,
                "income": data.get("income", 0.0),
                "expense": data.get("expense", 0.0),
                "net": data.get("income", 0.0) - data.get("expense", 0.0)
            })

        return weekly_data

    @staticmethod
    def get_recent_activity(user_id: str = None, limit: int = 5) -> list:
        """Get recent financial activity"""
        db = get_database()
        records_collection = db["financial_records"]

        filter_stage = {} if user_id is None else {"user_id": user_id}

        records = list(
            records_collection.find(filter_stage)
            .sort("date", -1)
            .limit(limit)
        )

        for record in records:
            record["_id"] = str(record["_id"])

        return records

    @staticmethod
    def get_ai_insights(user_id: str = None) -> dict:
        """
        Generate AI insights based on current month expenses and project next month.
        Analyzes spending patterns and provides predictions.
        """
        db = get_database()
        records_collection = db["financial_records"]

        # get current date
        now = datetime.utcnow()
        current_month = now.month
        current_year = now.year
        current_day = now.day
        
        # get previous month to compare
        if current_month == 1:
            prev_month = 12
            prev_year = current_year - 1
        else:
            prev_month = current_month - 1
            prev_year = current_year

        match_stage = {} if user_id is None else {"user_id": user_id}

        # get current month expenses wrt category
        current_month_start = datetime(current_year, current_month, 1)
        if current_month == 12:
            next_month_start = datetime(current_year + 1, 1, 1)
        else:
            next_month_start = datetime(current_year, current_month + 1, 1)
        current_month_end = next_month_start - timedelta(days=1)

        match_current = {
            **match_stage,
            "type": "expense",
            "date": {
                "$gte": current_month_start,
                "$lt": next_month_start
            }
        }

        prev_month_start = datetime(prev_year, prev_month, 1)
        if prev_month == 12:
            next_prev_month = datetime(prev_year + 1, 1, 1)
        else:
            next_prev_month = datetime(prev_year, prev_month + 1, 1)

        match_previous = {
            **match_stage,
            "type": "expense",
            "date": {
                "$gte": prev_month_start,
                "$lt": next_prev_month
            }
        }

        # aggregate current month wrt category
        pipeline_current = [
            {"$match": match_current},
            {
                "$group": {
                    "_id": "$category",
                    "amount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"amount": -1}}
        ]

        # aggregate previous month expenses
        pipeline_previous = [
            {"$match": match_previous},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"}
                }
            }
        ]

        current_categories = list(records_collection.aggregate(pipeline_current))
        previous_total_result = list(records_collection.aggregate(pipeline_previous))
        
        current_total = sum(cat["amount"] for cat in current_categories)
        previous_total = previous_total_result[0]["total"] if previous_total_result else 0

        days_in_current_month = (current_month_end - current_month_start).days + 1
        days_passed = current_day
        daily_average = current_total / days_passed if days_passed > 0 else 0
        projected_month = daily_average * days_in_current_month
        
        trend_percent = ((projected_month - previous_total) / previous_total * 100) if previous_total > 0 else 0
        trend = "increasing" if trend_percent > 5 else "decreasing" if trend_percent < -5 else "stable"

        top_categories = [
            {
                "category": cat["_id"],
                "amount": float(cat["amount"]),
                "percentage": (cat["amount"] / current_total * 100) if current_total > 0 else 0
            }
            for cat in current_categories[:3]
        ]

        days_remaining = days_in_current_month - days_passed
        insight_lines = [
            f"You've spent ${current_total:,.2f} in {days_passed} days (daily avg: ${daily_average:,.2f}).",
            f"Based on your current spending rate, you may spend approximately ${projected_month:,.2f} by month end.",
        ]
        
        if trend == "increasing":
            insight_lines.append(f"This is ~{abs(trend_percent):.1f}% higher than last month. Consider reviewing your spending.")
        elif trend == "decreasing":
            insight_lines.append(f"Great! This is ~{abs(trend_percent):.1f}% lower than last month. Keep up the disciplined spending.")
        else:
            insight_lines.append("Your spending is on par with last month.")

        if top_categories:
            top_cat = top_categories[0]
            insight_lines.append(f"Top category: {top_cat['category']} (${top_cat['amount']:,.2f}, {top_cat['percentage']:.1f}% of spending).")

        return {
            "summary": " ".join(insight_lines),
            "current_month_spending": float(current_total),
            "projected_month_spending": float(projected_month),
            "previous_month_spending": float(previous_total),
            "daily_average": float(daily_average),
            "trend": trend,
            "trend_percent": float(trend_percent),
            "top_categories": top_categories,
            "days_passed": days_passed,
            "days_remaining": days_remaining,
            "current_month": f"{now.strftime('%B')} {current_year}"
        }
