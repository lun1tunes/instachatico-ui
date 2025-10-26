# Technical Assignment: Central Authentication Backend Proxy

## 1. Project Overview

### 1.1 Purpose
Create a central authentication backend service that enables multiple Instagram account owners to use the same Instachatico UI while maintaining isolated backend instances for each user.

### 1.2 Problem Statement
Currently, the Instachatico UI is designed for single-user operation with hardcoded API endpoint and bearer token. The requirement is to support multiple users, where each user:
- Has their own Instagram account
- Has their own isolated backend instance (different URL + bearer token)
- Uses the same frontend UI
- Has secure, encrypted credential storage

### 1.3 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend UI (Vue 3)                      │
│                  http://localhost:5173                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 1. Login (username/password)
                         │ 2. Get user's backend config
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Central Auth Backend (FastAPI + PostgreSQL)          │
│                  http://localhost:8080                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Services:                                            │    │
│  │ - User Authentication (JWT)                          │    │
│  │ - Backend Mapping                                    │    │
│  │ - Token Encryption/Decryption                        │    │
│  │ - User Management                                    │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Returns:
                         │ - JWT token for UI session
                         │ - User's backend URL
                         │ - Decrypted bearer token
                         │
         ┌───────────────┴───────────────┬──────────────┐
         │                               │              │
         ▼                               ▼              ▼
┌─────────────────┐          ┌─────────────────┐   ┌─────────────────┐
│  Backend #1     │          │  Backend #2     │   │  Backend #N     │
│  User: alice    │          │  User: bob      │   │  User: charlie  │
│  Port: 4291     │          │  Port: 4292     │   │  Port: 4293     │
│  Token: xxx     │          │  Token: yyy     │   │  Token: zzz     │
└─────────────────┘          └─────────────────┘   └─────────────────┘
```

## 2. Database Design

### 2.1 Database Technology
**Recommended:** PostgreSQL 14+

**Alternatives:**
- SQLite (development/small deployments)
- Supabase (cloud-managed PostgreSQL)

### 2.2 Schema

```sql
-- Users table: Core authentication data
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Backend instances: Maps users to their isolated backends
CREATE TABLE user_backends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    instagram_username VARCHAR(50) NOT NULL,
    api_base_url VARCHAR(255) NOT NULL,
    bearer_token_encrypted TEXT NOT NULL,  -- Fernet encrypted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_user_backend UNIQUE(user_id),
    CONSTRAINT url_format CHECK (api_base_url ~* '^https?://')
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_backends_user_id ON user_backends(user_id);

-- Audit log (optional but recommended)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,  -- 'login', 'logout', 'update_config', etc.
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 2.3 Sample Data

```sql
-- Insert example users (passwords are hashed with bcrypt)
INSERT INTO users (username, email, password_hash) VALUES
('alice', 'alice@example.com', '$2b$12$KIXn7gX8QZKjT5hZ9.xYr.8vZqJ1Y2K3L4M5N6O7P8Q9R0S1T2U3V'),
('bob', 'bob@example.com', '$2b$12$ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567');

-- Insert backend configurations (tokens encrypted)
INSERT INTO user_backends (user_id, instagram_username, api_base_url, bearer_token_encrypted) VALUES
(1, 'alice_instagram', 'http://localhost:4291/api/v1', 'gAAAAABk...encrypted_token...'),
(2, 'bob_instagram', 'http://localhost:4292/api/v1', 'gAAAAABk...encrypted_token...');
```

## 3. API Specification

### 3.1 Base URL
```
http://localhost:8080/api/v1
```

### 3.2 Authentication Flow

#### 3.2.1 POST /auth/login
**Description:** Authenticate user and return JWT + backend configuration

**Request:**
```json
{
  "username": "alice",
  "password": "secure_password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "instagram_username": "alice_instagram"
  },
  "backend_config": {
    "api_base_url": "http://localhost:4291/api/v1",
    "bearer_token": "bearer_token_322"  // Decrypted
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "detail": "Incorrect username or password"
}

// 403 Forbidden
{
  "detail": "Account is inactive"
}
```

#### 3.2.2 POST /auth/refresh
**Description:** Refresh JWT token

**Headers:**
```
Authorization: Bearer <expired_or_valid_jwt>
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### 3.2.3 POST /auth/logout
**Description:** Invalidate JWT token (optional, client-side deletion is primary)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

### 3.3 User Management

#### 3.3.1 POST /users (Admin only)
**Description:** Create new user with backend configuration

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request:**
```json
{
  "username": "charlie",
  "email": "charlie@example.com",
  "password": "secure_password456",
  "instagram_username": "charlie_instagram",
  "api_base_url": "http://localhost:4293/api/v1",
  "bearer_token": "bearer_token_789"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "username": "charlie",
  "email": "charlie@example.com",
  "instagram_username": "charlie_instagram",
  "created_at": "2025-10-27T10:30:00Z"
}
```

#### 3.3.2 GET /users/me
**Description:** Get current user profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "instagram_username": "alice_instagram",
  "created_at": "2025-10-20T08:15:00Z",
  "last_login": "2025-10-27T09:45:00Z"
}
```

#### 3.3.3 PUT /users/me/backend
**Description:** Update backend configuration

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "api_base_url": "http://new-server:4291/api/v1",
  "bearer_token": "new_bearer_token_456"
}
```

**Response (200 OK):**
```json
{
  "message": "Backend configuration updated successfully",
  "backend_config": {
    "api_base_url": "http://new-server:4291/api/v1",
    "updated_at": "2025-10-27T10:45:00Z"
  }
}
```

#### 3.3.4 PUT /users/me/password
**Description:** Change user password

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "current_password": "old_password",
  "new_password": "new_secure_password789"
}
```

**Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

### 3.4 Health & Status

#### 3.4.1 GET /health
**Description:** Health check endpoint

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-27T10:50:00Z"
}
```

## 4. Security Requirements

### 4.1 Password Security
- **Algorithm:** bcrypt with cost factor 12
- **Minimum Length:** 8 characters
- **Complexity:** Must include uppercase, lowercase, number, and special character
- **Storage:** Never store plain text passwords

**Implementation:**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### 4.2 Token Encryption
- **Algorithm:** Fernet (symmetric encryption)
- **Key Storage:** Environment variable `ENCRYPTION_KEY`
- **Key Generation:** `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`

**Implementation:**
```python
from cryptography.fernet import Fernet
import os

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY").encode()
fernet = Fernet(ENCRYPTION_KEY)

def encrypt_token(token: str) -> str:
    return fernet.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    return fernet.decrypt(encrypted_token.encode()).decode()
```

### 4.3 JWT Configuration
- **Algorithm:** HS256
- **Secret Key:** Strong random string (environment variable `JWT_SECRET_KEY`)
- **Expiration:** 1 hour (configurable)
- **Issuer:** "instachatico-auth"
- **Include Claims:** user_id, username, exp, iat

**Implementation:**
```python
from datetime import datetime, timedelta
import jwt
import os

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60

def create_access_token(user_id: int, username: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": expire,
        "iat": datetime.utcnow(),
        "iss": "instachatico-auth"
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 4.4 Additional Security Measures

1. **Rate Limiting:**
   - Login endpoint: 5 attempts per minute per IP
   - API endpoints: 100 requests per minute per user

2. **CORS Configuration:**
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],  # Frontend URL
       allow_credentials=True,
       allow_methods=["GET", "POST", "PUT", "DELETE"],
       allow_headers=["*"],
   )
   ```

3. **HTTPS Enforcement:**
   - Production must use HTTPS
   - Set secure cookie flags
   - Use HSTS headers

4. **Input Validation:**
   - Pydantic models for all requests
   - SQL injection prevention (use parameterized queries)
   - XSS prevention (escape user inputs)

5. **Audit Logging:**
   - Log all authentication attempts
   - Log configuration changes
   - Store IP addresses and user agents

## 5. Implementation Structure

### 5.1 Project Structure

```
central-auth-backend/
├── .env.example
├── .env
├── .gitignore
├── requirements.txt
├── alembic.ini
├── alembic/
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── backend.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   └── backend.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── crypto.py
│   │   └── user.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   └── health.py
│   └── utils/
│       ├── __init__.py
│       └── security.py
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_users.py
│   └── conftest.py
└── README.md
```

### 5.2 Environment Variables

**`.env.example`:**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/instachatico_auth
# For SQLite: DATABASE_URL=sqlite:///./instachatico_auth.db

# Security
JWT_SECRET_KEY=your-secret-key-here-min-32-chars
ENCRYPTION_KEY=your-fernet-key-here
JWT_EXPIRATION_MINUTES=60

# Server
HOST=0.0.0.0
PORT=8080
DEBUG=false

# CORS
FRONTEND_URL=http://localhost:5173

# Admin (initial setup only)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-immediately
```

### 5.3 Dependencies

**`requirements.txt`:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
cryptography==41.0.7
python-multipart==0.0.6
alembic==1.12.1
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

### 5.4 Core Implementation Files

**`app/config.py`:**
```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    encryption_key: str
    jwt_expiration_minutes: int = 60
    host: str = "0.0.0.0"
    port: int = 8080
    debug: bool = False
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

**`app/database.py`:**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=settings.debug
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**`app/models/user.py`:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
```

**`app/models/backend.py`:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class UserBackend(Base):
    __tablename__ = "user_backends"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    instagram_username = Column(String(50), nullable=False)
    api_base_url = Column(String(255), nullable=False)
    bearer_token_encrypted = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

    user = relationship("User", backref="backend")
```

**`app/schemas/auth.py`:**
```python
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

class BackendConfig(BaseModel):
    api_base_url: str
    bearer_token: str

class UserInfo(BaseModel):
    id: int
    username: str
    email: str
    instagram_username: str | None = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInfo
    backend_config: BackendConfig
```

**`app/api/auth.py`:**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth import authenticate_user, create_access_token
from app.services.crypto import decrypt_token
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    user, backend = authenticate_user(db, credentials.username, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Create JWT token
    access_token = create_access_token(user.id, user.username)

    # Decrypt bearer token
    decrypted_token = decrypt_token(backend.bearer_token_encrypted)

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=3600,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "instagram_username": backend.instagram_username
        },
        backend_config={
            "api_base_url": backend.api_base_url,
            "bearer_token": decrypted_token
        }
    )
```

## 6. Frontend Integration

### 6.1 Environment Variables Update

**`.env.example`:**
```bash
# Central Auth Backend
VITE_AUTH_API_URL=http://localhost:8080/api/v1

# These will be obtained after login (no longer hardcoded)
# VITE_API_BASE_URL=<dynamic>
# VITE_BEARER_TOKEN=<dynamic>
```

### 6.2 Updated Auth Store

**`src/stores/auth.ts`:**
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { apiService } from '@/services/api'

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL

interface UserInfo {
  id: number
  username: string
  email: string
  instagram_username: string
}

interface BackendConfig {
  api_base_url: string
  bearer_token: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: UserInfo
  backend_config: BackendConfig
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<UserInfo | null>(null)
  const jwtToken = ref<string | null>(null)
  const error = ref<string | null>(null)

  function initialize() {
    const storedUser = localStorage.getItem('user')
    const storedJwt = localStorage.getItem('jwt_token')
    const storedBackendUrl = localStorage.getItem('api_base_url')
    const storedBearerToken = localStorage.getItem('bearer_token')

    if (storedUser && storedJwt && storedBackendUrl && storedBearerToken) {
      user.value = JSON.parse(storedUser)
      jwtToken.value = storedJwt
      isAuthenticated.value = true

      // Configure API service with user's backend
      apiService.setBaseURL(storedBackendUrl)
      apiService.setAuthToken(storedBearerToken)
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    try {
      error.value = null

      const response = await axios.post<LoginResponse>(`${AUTH_API_URL}/auth/login`, {
        username,
        password
      })

      const { access_token, user: userData, backend_config } = response.data

      // Store auth data
      jwtToken.value = access_token
      user.value = userData
      isAuthenticated.value = true

      localStorage.setItem('jwt_token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('api_base_url', backend_config.api_base_url)
      localStorage.setItem('bearer_token', backend_config.bearer_token)

      // Configure API service with user's backend
      apiService.setBaseURL(backend_config.api_base_url)
      apiService.setAuthToken(backend_config.bearer_token)

      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Login failed'
      return false
    }
  }

  function logout() {
    jwtToken.value = null
    user.value = null
    isAuthenticated.value = false

    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user')
    localStorage.removeItem('api_base_url')
    localStorage.removeItem('bearer_token')
  }

  return {
    isAuthenticated,
    user,
    error,
    initialize,
    login,
    logout
  }
})
```

### 6.3 Updated API Service

**`src/services/api.ts`:**
```typescript
import axios from 'axios'
import type { AxiosInstance } from 'axios'

class ApiService {
  private client: AxiosInstance
  private bearerToken: string | null = null

  constructor() {
    // Base URL will be set dynamically after login
    this.client = axios.create({
      timeout: 10000
    })

    this.client.interceptors.request.use((config) => {
      if (this.bearerToken) {
        config.headers.Authorization = `Bearer ${this.bearerToken}`
      }
      return config
    })
  }

  setBaseURL(url: string) {
    this.client.defaults.baseURL = url
  }

  setAuthToken(token: string) {
    this.bearerToken = token
  }

  // ... rest of methods unchanged
}

export const apiService = new ApiService()
```

### 6.4 Updated Login View

**`src/views/Login.vue`:**
```typescript
// Update handleLogin function
async function handleLogin() {
  loading.value = true

  const success = await authStore.login(username.value, password.value)

  if (success) {
    await router.push('/media')
  }

  loading.value = false
}
```

Remove the hint about default credentials (line 78-80).

## 7. Deployment

### 7.1 Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd central-auth-backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Generate encryption key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# 5. Create .env file
cp .env.example .env
# Edit .env with your values

# 6. Run database migrations
alembic upgrade head

# 7. Create admin user (optional script)
python scripts/create_admin.py

# 8. Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

### 7.2 Production Deployment

**Docker Compose:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: instachatico
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: instachatico_auth
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  auth-backend:
    build: .
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://instachatico:secure_password@postgres:5432/instachatico_auth
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      FRONTEND_URL: https://instachatico.example.com
    ports:
      - "8080:8080"
    volumes:
      - ./app:/app/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8080

volumes:
  postgres_data:
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 7.3 Migration Strategy

**Phase 1: Parallel Operation**
- Deploy central auth backend
- Keep existing single-user setup working
- Test with pilot users

**Phase 2: Migration**
- Create user accounts for existing Instagram owners
- Migrate backend configurations to database
- Update frontend to use central auth

**Phase 3: Cutover**
- Switch all users to new system
- Deprecate old authentication method

## 8. Testing Requirements

### 8.1 Unit Tests

**`tests/test_auth.py`:**
```python
import pytest
from app.services.auth import create_access_token, verify_token
from app.services.crypto import encrypt_token, decrypt_token

def test_password_hashing():
    from app.utils.security import hash_password, verify_password
    password = "TestPassword123!"
    hashed = hash_password(password)
    assert verify_password(password, hashed)
    assert not verify_password("WrongPassword", hashed)

def test_token_encryption():
    original = "bearer_token_123"
    encrypted = encrypt_token(original)
    decrypted = decrypt_token(encrypted)
    assert original == decrypted

def test_jwt_creation():
    token = create_access_token(1, "alice")
    payload = verify_token(token)
    assert payload["username"] == "alice"
    assert payload["sub"] == "1"
```

### 8.2 Integration Tests

**`tests/test_users.py`:**
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success():
    response = client.post("/api/v1/auth/login", json={
        "username": "alice",
        "password": "secure_password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "alice"

def test_login_invalid_credentials():
    response = client.post("/api/v1/auth/login", json={
        "username": "alice",
        "password": "wrong_password"
    })
    assert response.status_code == 401
```

### 8.3 Load Testing

Use tools like Apache Bench or Locust to test:
- 1000 concurrent login requests
- 10,000 requests/minute to protected endpoints
- Database connection pool performance

## 9. Monitoring & Logging

### 9.1 Logging Configuration

```python
import logging
from logging.handlers import RotatingFileHandler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('app.log', maxBytes=10485760, backupCount=5),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
```

### 9.2 Metrics to Track

- Login success/failure rates
- JWT token creation/validation times
- Database query performance
- API endpoint response times
- Active user sessions

### 9.3 Alerts

- Failed login attempts > 10 from same IP in 5 minutes
- Database connection failures
- Disk space < 20%
- API response time > 2 seconds

## 10. Maintenance & Operations

### 10.1 Database Backups

```bash
# Daily backup script
pg_dump -U instachatico -h localhost instachatico_auth > backup_$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * /path/to/backup.sh
```

### 10.2 Key Rotation

Rotate JWT secret and encryption keys every 90 days:
1. Generate new keys
2. Update environment variables
3. Invalidate old sessions (users re-login)
4. Monitor for issues

### 10.3 User Management Tasks

**Create user:**
```bash
python scripts/create_user.py --username alice --email alice@example.com --backend-url http://localhost:4291/api/v1 --bearer-token token_123
```

**Deactivate user:**
```sql
UPDATE users SET is_active = false WHERE username = 'alice';
```

**Reset password:**
```bash
python scripts/reset_password.py --username alice
```

## 11. Security Checklist

- [ ] All passwords hashed with bcrypt (cost 12+)
- [ ] Bearer tokens encrypted with Fernet
- [ ] JWT tokens signed with strong secret
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] Audit logging enabled
- [ ] Environment variables not committed
- [ ] Database backups automated
- [ ] Error messages don't leak sensitive info
- [ ] Admin endpoints protected
- [ ] Token expiration enforced

## 12. Appendix

### 12.1 Sample Admin Creation Script

**`scripts/create_admin.py`:**
```python
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User
from app.utils.security import hash_password
from app.config import get_settings

settings = get_settings()

def create_admin():
    db = SessionLocal()
    try:
        admin = User(
            username=settings.admin_username,
            email=settings.admin_email,
            password_hash=hash_password(settings.admin_password),
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"Admin user created: {admin.username}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
```

### 12.2 API Request Examples (cURL)

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "secure_password123"}'
```

**Get User Profile:**
```bash
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Update Backend Config:**
```bash
curl -X PUT http://localhost:8080/api/v1/users/me/backend \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "api_base_url": "http://localhost:4291/api/v1",
    "bearer_token": "new_token_456"
  }'
```

### 12.3 Troubleshooting

**Issue:** "Token expired" error
**Solution:** Refresh JWT token or re-login

**Issue:** Database connection refused
**Solution:** Check DATABASE_URL, ensure PostgreSQL is running

**Issue:** Invalid encryption key
**Solution:** Verify ENCRYPTION_KEY format (Fernet key, base64)

**Issue:** CORS errors in browser
**Solution:** Add frontend URL to CORS allowed origins

---

**Document Version:** 1.0
**Last Updated:** 2025-10-27
**Author:** Technical Team
**Status:** Ready for Implementation
