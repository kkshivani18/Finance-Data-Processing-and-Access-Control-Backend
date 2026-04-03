# Finance Data Processing and Access Control Backend

> A comprehensive full-stack finance dashboard system with role-based access control, financial record management, and advanced analytics.

**Submission:** Zorvyn Backend Developer Assignment

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Assignment Requirement Mapping](#assignment-requirement-mapping)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Role-Based Access Control](#role-based-access-control)
- [Design Decisions & Assumptions](#design-decisions--assumptions)
- [Key Enhancements](#key-enhancements)

## 🎯 Project Overview

This project is a full-stack finance dashboard application built with **FastAPI** (Python) backend and **React** frontend. It demonstrates proper backend architecture, role-based access control, comprehensive input validation, and clean data modeling for a financial records management system.

The system allows users with different roles (Viewer, Analyst, Admin) to manage financial records, view dashboard analytics, and access insights—all while maintaining strict access control at the API level.

### Key Goals Achieved

✅ **Role-based access control** implemented at middleware/route level  
✅ **Comprehensive financial record management** with CRUD operations  
✅ **Dashboard summary APIs** with aggregated data (income, expenses, trends)  
✅ **Input validation & error handling** with meaningful error messages  
✅ **MongoDB persistence** with proper indexing strategy  
✅ **JWT authentication** with token-based user context  
✅ **Full-stack integration** with React frontend and interactive dashboard  

---

## 📊 Assignment Requirement Mapping

| Requirement | Implementation | Status |
|-------------|-----------------|--------|
| **User & Role Management** | UserService with 3 roles (Viewer, Analyst, Admin). Users have email, name, role, status fields. | ✅ Complete |
| **Financial Records CRUD** | RecordService with create, read, update, delete operations. Fields: amount, type, category, date, description. | ✅ Complete |
| **Dashboard Summary APIs** | 6 endpoints: summary stats, categories, trends, weekly, recent activity, AI insights. | ✅ Complete |
| **Access Control Logic** | Role-based checks in routes & middleware. Viewer < Analyst < Admin hierarchy. | ✅ Complete |
| **Validation & Error Handling** | Pydantic validators + custom validators. Proper HTTP status codes (400, 401, 404, 409, 422). | ✅ Complete |
| **Data Persistence** | MongoDB Atlas with collections, indexes, and proper schema modeling. | ✅ Complete |
| **Authentication** | JWT tokens with 24-hour expiration. Token validation on protected endpoints. | ✅ Enhanced |
| **Pagination** | Implemented with skip/limit parameters. Validated bounds (0-1000). | ✅ Enhanced |
| **Input Validation** | Password strength (8+ chars, uppercase, lowercase, number, special char). Email format validation. Expense amount limits. | ✅ Enhanced |
| **Error Messages** | Generic security-focused messages for login, specific messages for validation errors. | ✅ Enhanced |
| **Full-Stack UI** | React frontend with authentication, dashboard, records management, calendar views. | ✅ Enhanced |

---

## 🏗️ Architecture

### Multi-Tenancy Design

This application implements a **shared multi-tenancy architecture** where all users share the same database and application instance. This design pattern offers:

**Key Characteristics:**
- ✅ **Single Database Instance** - All users' data stored in same MongoDB collections
- ✅ **Data Isolation via User ID** - Records are filtered by `user_id` at the query level
- ✅ **Role-Based Access Control** - Access enforcement through middleware & route handlers
- ✅ **Efficient Resource Utilization** - Single backend instance serves multiple users
- ✅ **Shared Infrastructure** - Cost-effective scaling for teams

**Data Isolation Strategy:**
```
Users share:
├── Single MongoDB cluster
├── Single backend application
└── Single frontend deployment

Data segregation happens at:
├── Query level (WHERE user_id = ?)
├── Middleware level (JWT token contains user_id)
└── Route handler level (check_role validation)
```

**Security Implementation:**
- JWT tokens contain `user_id` - embedded in every request
- Middleware extracts user context from token
- Service layer filters all queries by user_id
- Routes validate user permissions before data access
- Admin/Analyst roles can bypass user_id filter for authorized operations

---

### Data Flow

```
User Request
    ↓
Frontend (React)
    ↓
HTTP Request + JWT Token
    ↓
FastAPI Router
    ↓
Middleware (JWT validation, Role check)
    ↓
Service Layer (Business logic, Validation)
    ↓
MongoDB (Data persistence)
    ↓
Response (JSON with proper status codes)
    ↓
Frontend (Display with error handling)
```

---

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI 0.104.1
- **Language:** Python 3.12.10
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (PyJWT)
- **Password Hashing:** bcrypt
- **Validation:** Pydantic 2.5.2
- **ODM:** PyMongo
- **CORS:** FastAPI CORS Middleware

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **HTTP Client:** Fetch API
- **Date Handling:** date-fns
- **Routing:** React Router

### Database
- **MongoDB Collections:**
  - `users` - User accounts with roles
  - `financial_records` - Transaction records

---

## ✨ Features

### 1. **Authentication & Authorization**
- User registration with password strength validation
- JWT-based login system
- 24-hour token expiration
- Role-based request routing
- Automatic token refresh on valid session

### 2. **Financial Record Management**
- Create, read, update, delete records
- Record types: Income, Expense
- Categories: Food, Transportation, Entertainment, Utilities, Salary, Other
- Amount validation (positive, max 2 decimal places)
- Description with XSS prevention
- Date validation (cannot be future dates)

### 3. **Dashboard Analytics**
- **Summary Stats:** Total income, expenses, net balance
- **Category Breakdown:** Spending by category with percentages
- **Monthly Trends:** Income & expenses for all 12 months
- **Weekly Trends:** Daily breakdown of current week
- **Recent Activity:** Last 5 transactions with metadata
- **AI Insights:** 
  - Current vs previous month comparison
  - Spending projections
  - Top spending categories
  - Trend detection (increasing/decreasing)
  - Personalized recommendations

### 4. **Advanced Validation**
- **Password Strength:** 8+ chars, uppercase, lowercase, number, special char
- **Email Validation:** Format & uniqueness checks
- **Amount Validation:** Positive numbers, max 2 decimals, sensible limits
- **Expense Control:** Cannot exceed total income
- **Date Validation:** No future dates allowed
- **Input Sanitization:** XSS prevention in descriptions

### 5. **Error Handling**
- **HTTP Status Codes:** 200, 201, 400, 401, 403, 404, 409, 422, 500
- **Generic Security Messages:** Login errors don't reveal user existence
- **Specific Validation Errors:** Clear messages for input issues
- **User-Friendly Alerts:** Frontend displays errors in red alert box

### 6. **Role-Based Features**
- **Viewers:** Dashboard only, no record access
- **Analysts:** View all records, edit any record, no create/delete
- **Admins:** Full CRUD access, manage records and users

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. **Clone & navigate to backend:**
```bash
cd finance_data_processing_dasboard/backend
```

2. **Create virtual environment:**
```bash
python -m venv assessment-env
source assessment-env/Scripts/activate  # Windows
# or
source assessment-env/bin/activate  # Linux/Mac
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create `.env` file:**
```bash
cat > .env << EOF
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=finance_dashboard
JWT_SECRET_KEY=your-secret-key-change-this-in-production
EOF
```

5. **Run migrations (if any):**
```bash
python -m app.database  # Initialize collections & indexes
```

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd finance_data_processing_dasboard/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file (optional):**
```bash
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

---

## ▶️ Running the Application

### Start Backend
```bash
cd backend
source assessment-env/Scripts/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### Start Frontend
```bash
cd frontend
npm run dev
```

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/auth/login`
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "analyst",
    "status": "active",
    "created_at": "2026-04-01T10:30:00",
    "updated_at": "2026-04-01T10:30:00"
  }
}
```

**Errors:**
- `401 Unauthorized`: "Invalid credentials"
- `403 Forbidden`: "User account is inactive"

---

#### POST `/auth/register`
Create new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecurePass@123"
}
```

**Response (201):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": { ... }
}
```

**Errors:**
- `409 Conflict`: "Email already exists"
- `422 Unprocessable Entity`: "Password must contain..." (validation errors)

---

### Financial Records Endpoints

#### GET `/records` (Admin/Analyst: all records, Viewer: own records)
List financial records with pagination.

**Query Parameters:**
- `skip` (0-∞, default: 0): Records to skip
- `limit` (1-1000, default: 100): Max records to return

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "amount": 50.00,
      "type": "expense",
      "category": "food",
      "date": "2026-03-28T10:00:00",
      "description": "Grocery shopping",
      "created_at": "2026-03-28T10:00:00",
      "updated_at": "2026-03-28T10:00:00"
    }
  ],
  "total": 150,
  "skip": 0,
  "limit": 100,
  "count": 50
}
```

**Requirements:**
- Authorization header with Bearer token
- Role: Viewer, Analyst, Admin

---

#### POST `/records` (Admin only)
Create a new financial record.

**Request:**
```json
{
  "amount": 5000.00,
  "type": "income",
  "category": "salary",
  "date": "2026-04-01T00:00:00",
  "description": "Monthly salary payment"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... record object ... }
}
```

**Validation:**
- Amount: > 0, ≤ 999,999,999, max 2 decimals
- Type: "income" or "expense"
- Date: Cannot be future date
- Description: Max 500 chars, no XSS

**Errors:**
- `400 Bad Request`: "Expense amount exceeds available balance"
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient role permissions
- `422 Unprocessable Entity`: Validation errors

---

#### GET `/records/{record_id}`
Get a specific record.

**Response (200):**
```json
{
  "success": true,
  "data": { ... record object ... }
}
```

**Errors:**
- `404 Not Found`: Record not found
- `401 Unauthorized`: Invalid token

---

#### PUT `/records/{record_id}` (Admin/Analyst)
Update a record.

**Request:**
```json
{
  "amount": 5100.00,
  "description": "Updated salary"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... updated record ... }
}
```

**Notes:**
- For expense amount increases, validates against income limit
- Only provided fields are updated

---

#### DELETE `/records/{record_id}` (Admin only)
Delete a record.

**Response (200):**
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

### Dashboard Analytics Endpoints

#### GET `/dashboard/summary`
Total income, expenses, and net balance.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_income": 15000.00,
    "total_expenses": 2500.00,
    "net_balance": 12500.00
  }
}
```

---

#### GET `/dashboard/categories`
Spending breakdown by category.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "food",
      "income": 0,
      "expense": 150.00
    },
    {
      "category": "salary",
      "income": 15000.00,
      "expense": 0
    }
  ]
}
```

---

#### GET `/dashboard/trends`
Monthly trends for all 12 months.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "monthNum": 1,
      "month": "January",
      "income": 5000.00,
      "expense": 500.00,
      "net": 4500.00
    },
    ...
  ]
}
```

---

#### GET `/dashboard/weekly`
Current week daily breakdown.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "day": "Monday",
      "income": 0,
      "expense": 50.00,
      "net": -50.00
    },
    ...
  ]
}
```

---

#### GET `/dashboard/recent`
Last 5 transactions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "amount": 50.00,
      "type": "expense",
      "category": "food",
      "date": "2026-04-01T10:00:00",
      "description": "Grocery shopping"
    }
  ]
}
```

---

#### GET `/dashboard/insights`
AI-powered financial insights.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_month_total": 2000.00,
    "previous_month_total": 1800.00,
    "spending_trend": "increasing",
    "daily_average": 65.00,
    "projected_spending": 2100.00,
    "top_categories": [
      {"category": "Food", "percentage": 45},
      {"category": "Transport", "percentage": 30}
    ],
    "insight_text": "Your spending is increasing. Based on current trends..."
  }
}
```

---

## 🔐 Role-Based Access Control

### Role Hierarchy

```
Viewer (Lowest)
  ├─ View dashboard
  └─ Cannot: manage records, create, delete
  
Analyst (Middle)
  ├─ View all records
  ├─ Edit any record
  └─ Cannot: delete, create, manage users
  
Admin (Highest)
  ├─ Full CRUD on records
  ├─ Manage users
  └─ Full system access
```

### Implementation Details

**Middleware (`app/middleware/auth.py`):**
```python
async def get_user_context(request: Request) -> UserContext:
    # Extract JWT token from Authorization header
    # Validate token signature and expiration
    # Return UserContext with user_id and role
```

**Route Protection (`app/routes/records.py`):**
```python
check_role(current_user, ["admin"])  # Only admins can create
check_role(current_user, ["admin", "analyst"])  # Admins & analysts can edit
check_role(current_user, ["analyst", "admin"])  # Both can view records
```

**Record Visibility:**
- **Admin**: Can view/edit ALL records
- **Analyst**: Can view/edit ALL records
- **Viewer**: Can only view their own records (limited to dashboard)

---

## 🎨 Design Decisions & Assumptions

### 0. **Architecture: Multi-Tenancy with Shared Database**
**Decision:** Implement shared multi-tenancy where all users share the same MongoDB database and application instance  
**Reasoning:**
- **Cost-Effective:** Single backend/database serves multiple users
- **Operational Simplicity:** One application to maintain and deploy
- **Data Isolation:** User data safely segregated via user_id filtering
- **Standard Practice:** Common SaaS application pattern

**Implementation Details:**
- Every `financial_record` has `user_id` field - basis for data isolation
- JWT middleware extracts `user_id` from token on every request
- Service layer methods filter queries: `find({"user_id": user_id})`
- Admin/Analyst can bypass user_id for legitimate business needs
- Role-based access enforced at middleware level

**Example Query Isolation:**
```python
# Viewer/Own user: Can only see their own records
records = collection.find({"user_id": current_user.user_id})

# Admin/Analyst: Can see all records
records = collection.find({})  # No user_id filter
```

**Scalability Path:**
- Current: Single instance, shared database (suitable for <1M users)
- Future: Could migrate to database-per-tenant or application-per-tenant if needed
- Sharding ready: MongoDB collections indexed by user_id for easy sharding

---

### 1. **Database Choice: MongoDB**
**Decision:** Use MongoDB document database  
**Reasoning:**
- Flexible schema for financial records
- Native support for aggregation pipelines (efficient analytics)
- Easy horizontal scaling
- JSON-like structure matches API responses

**Assumption:** Sufficient for current data volume. Would add sharding strategy if scale increases 1000x.

---

### 2. **Authentication: JWT Tokens**
**Decision:** JWT with 24-hour expiration  
**Reasoning:**
- Stateless authentication (no session store needed)
- Works well with stateless REST APIs
- Standard industry practice

**Assumption:** No refresh tokens implemented (simple approach). For production, would implement refresh token rotation.

---

### 3. **Password Strength Requirements**
**Decision:** Minimum 8 characters with uppercase, lowercase, number, and special character  
**Reasoning:**
- Prevents common weak passwords
- OWASP-aligned recommendations
- Balances security with usability

**Assumption:** No multi-factor authentication (out of scope). Would add SMS/email verification for production.

---

### 4. **Error Messages: Security-Focused**
**Decision:** Generic messages for authentication, specific for validation  

**Examples:**
- ❌ Don't reveal user existence: "Invalid credentials" (not "email not registered")
- ✅ Specific validation: "Password must contain uppercase letter"

---

### 5. **Expense Validation: Cannot Exceed Income**
**Decision:** Enforce expense ≤ total_income - existing_expenses  
**Reasoning:**
- Prevents overspending in single transaction
- Real-world financial best practice
- Can be configured/disabled per requirements

**Assumption:** This is a business requirement. Could make it configurable via settings if needed.

---

### 6. **Role Permissions: Analyst Can Edit Records**
**Decision:** Analyst can read all + edit any record, but NOT delete or create  
**Reasoning:**
- Supports review/correction workflows
- Prevents data loss (no delete)
- Prevents unauthorized record creation
- Flexible: can adjust per requirements

---

### 7. **Data Persistence: Production MongoDB**
**Decision:** MongoDB Atlas with connection pooling  
**Reasoning:**
- Scalable cloud database
- Automatic backups
- Built-in redundancy

**Assumption:** Access to MongoDB Atlas. For local testing, can use local MongoDB instance by changing connection string.

---

### 8. **Frontend Framework: React + Vite**
**Decision:** React with Vite for fast build times  
**Reasoning:**
- Modern, performant setup
- Hot module replacement during development
- Smaller bundle sizes than Create React App

---

## 🚀 Key Enhancements

### Beyond Core Requirements

| Feature | Description | Benefits |
|---------|-------------|----------|
| **Full-Stack UI** | Complete React dashboard with login, records, analytics | User-friendly demonstration |
| **Password Strength Validation** | 8+ chars, case-insensitive, numbers, special chars | Enhanced security |
| **Expense Income Check** | Cannot create expense > total income | Financial safeguards |
| **AI Insights** | Monthly comparisons, spending projections, trends | Advanced analytics |
| **Pagination** | Skip/limit with bounds validation | Scalable data handling |
| **Input Sanitization** | XSS prevention, email validation, description checks | Security hardening |
| **Comprehensive Error Handling** | 10+ specific error codes, user-friendly messages | Better UX |
| **Date-FNS Integration** | Proper date formatting and calculations | Reliable date handling |
| **Recharts Integration** | Interactive income vs expense visualization | Advanced dashboard |
| **Calendar Component** | Monthly view with balance display | Intuitive navigation |
| **Recent Activity** | Last 5 transactions with metadata | Quick insights |
| **Category Breakdown** | Pie chart with spending percentages | Visual analytics |

---

## ✅ Checklist: Assignment Requirements

- [x] User & Role Management
- [x] Financial Records CRUD
- [x] Dashboard Summary APIs
- [x] Access Control Logic
- [x] Input Validation
- [x] Error Handling
- [x] Data Persistence (MongoDB)
- [x] Authentication (JWT)
- [x] Pagination
- [x] Clean Code & Documentation
- [x] Full-Stack Implementation
- [x] Advanced Features (AI insights, password strength, etc.)

---

## 📄 License

This project is submitted as part of Zorvyn Backend Developer Internship Assessment.

---

**Built with ❤️ for evaluation purposes**  
*Submission Date: April 4, 2026*
