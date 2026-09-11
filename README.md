# 🛒 ShopSphere

A full-stack e-commerce application built using **Spring Boot, React, and MySQL**.

ShopSphere allows users to browse products, search and filter products, manage their shopping cart, place orders, and make payments using Razorpay. It also provides an admin dashboard for product and order management.

---

## 🚀 Features

### 👤 User Features

- User registration and login
- JWT-based authentication
- BCrypt password hashing
- Browse products
- Search products
- Filter products by category
- Pagination and sorting
- View product details
- Shopping cart management
- Order placement
- Order history
- Razorpay test/sandbox payment integration
- Payment verification
- Order status tracking

### 🔐 Admin Features

- Admin-only access
- Add products
- Update products
- Delete products
- Manage product inventory
- View all customer orders
- Update order status

---

## 🏗️ System Architecture

```text
React Frontend
      |
      | REST API / Axios
      v
Spring Boot Backend
      |
      +-- Spring Security + JWT
      |
      +-- Service Layer
      |
      +-- Repository Layer
      |
      v
MySQL Database

Razorpay
    ^
    |
Payment Service
```

---

## 🧱 Backend Architecture

The backend follows a layered architecture:

```text
Controller
    ↓
Service Interface
    ↓
Service Implementation
    ↓
Repository
    ↓
MySQL Database
```

The project also uses:

- DTO pattern
- Mapper layer
- Global exception handling
- Request validation
- JWT security
- Role-based authorization
- Spring Data JPA

---

## 🎨 Frontend Architecture

The React frontend communicates with the Spring Boot REST API using Axios.

```text
React Components
       ↓
React Router
       ↓
Service Layer
       ↓
Axios
       ↓
Spring Boot REST API
```

JWT tokens are stored on the client side and automatically included in authenticated API requests through an Axios interceptor.

---

## 🛠️ Tech Stack

### Backend

- Java 25
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- Hibernate
- MySQL
- JWT
- BCrypt
- Lombok
- Jakarta Bean Validation
- Swagger / OpenAPI
- Maven

### Frontend

- React
- JavaScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Payment

- Razorpay Test/Sandbox

### DevOps

- Docker
- Docker Compose
- Nginx
- Git
- GitHub

---

## 🔐 Authentication & Authorization

ShopSphere uses JWT-based authentication.

### Registration Flow

```text
User
 ↓
Register
 ↓
Backend validates request
 ↓
Check whether email already exists
 ↓
Password encoded using BCrypt
 ↓
User saved in MySQL
```

### Login Flow

```text
User
 ↓
Login
 ↓
Backend finds user
 ↓
Password verified using BCrypt
 ↓
JWT token generated
 ↓
Token returned to frontend
```

### Authenticated Request

```text
React
 ↓
Axios
 ↓
Authorization: Bearer <JWT>
 ↓
JWT Authentication Filter
 ↓
Token validation
 ↓
SecurityContext
 ↓
Controller
```

The application uses two roles:

- `USER`
- `ADMIN`

User and admin APIs are protected according to their required role.

---

## 🛍️ Shopping Flow

```text
Register / Login
       ↓
Browse Products
       ↓
Search / Filter
       ↓
View Product
       ↓
Add to Cart
       ↓
Update Cart
       ↓
Checkout
       ↓
Create Order
       ↓
Razorpay Payment
       ↓
Payment Verification
       ↓
Order Confirmed
```

---

## 💳 Razorpay Payment Integration

ShopSphere integrates Razorpay test/sandbox payments.

### Payment Flow

```text
Create Order
     ↓
Create Razorpay Order
     ↓
Razorpay Checkout
     ↓
Payment Completed
     ↓
Payment ID + Signature
     ↓
Backend Signature Verification
     ↓
Payment SUCCESS
     ↓
Order CONFIRMED
```

Payment statuses:

- `CREATED`
- `SUCCESS`
- `FAILED`

The Razorpay payment signature is verified on the backend before the order is confirmed.

> Razorpay secret credentials must be stored as environment variables and should never be committed to GitHub.

---

## 🔎 Product Search, Filtering & Pagination

The product API supports:

- Keyword search
- Category filtering
- Pagination
- Sorting
- Ascending order
- Descending order

### Example

```http
GET /api/products?page=0&size=8&sortBy=id&direction=asc
```

### Search

```http
GET /api/products?keyword=phone
```

### Category Filter

```http
GET /api/products?category=Electronics
```

Search can match product names and descriptions.

---

## 📦 Order Management

Orders contain:

- Order ID
- User
- Order items
- Product
- Quantity
- Price
- Total amount
- Order status
- Creation time

### Order Lifecycle

```text
PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
SHIPPED
   ↓
DELIVERED
```

---

## 🗄️ Database Design

The application uses **MySQL** as the relational database.

### Main Entities

- `User`
- `Product`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Payment`

### Entity Relationships

```text
User
 ├── Cart
 │    └── CartItem
 │          └── Product
 │
 └── Order
      └── OrderItem
            └── Product

Order
 └── Payment
```

---

## 📄 REST API

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/reset-password` | Reset password |

### Products

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Public | Get products with pagination, search and filtering |
| GET | `/api/products/{id}` | Public | Get product by ID |
| GET | `/api/products/search` | Public | Search products |
| GET | `/api/products/category/{category}` | Public | Get products by category |
| POST | `/api/products` | ADMIN | Create product |
| PUT | `/api/products/{id}` | ADMIN | Update product |
| DELETE | `/api/products/{id}` | ADMIN | Delete product |

### Cart

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/cart` | USER | Get current user's cart |
| POST | `/api/cart/items` | USER | Add product to cart |
| PUT | `/api/cart/items/{itemId}` | USER | Update cart item |
| DELETE | `/api/cart/items/{itemId}` | USER | Remove cart item |

### Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | USER | Create order |
| GET | `/api/orders` | USER | Get user's orders |
| GET | `/api/orders/{orderId}` | USER | Get user's order |

### Payments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/create-order` | USER | Create Razorpay order |
| POST | `/api/payments/verify` | USER | Verify Razorpay payment |

### Admin Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/orders` | ADMIN | Get all orders |
| PUT | `/api/admin/orders/{orderId}/status` | ADMIN | Update order status |

---

## 📑 API Documentation

Swagger / OpenAPI is used for API documentation and testing.

When the backend is running locally:

```text
http://localhost:8080/swagger-ui/index.html
```

OpenAPI specification:

```text
http://localhost:8080/v3/api-docs
```

---

## 🛡️ Security

Security features include:

- JWT authentication
- BCrypt password hashing
- Role-based authorization
- Stateless authentication
- Custom JWT authentication filter
- Protected admin endpoints
- Protected user endpoints
- CORS configuration
- Request validation
- Server-side payment signature verification

Passwords are never stored as plain text.

---

## ⚠️ Validation & Exception Handling

The application uses Jakarta Bean Validation for request validation.

Examples include:

```text
@NotBlank
@NotNull
@Positive
@PositiveOrZero
```

Custom exceptions include:

```text
BadRequestException
ResourceNotFoundException
```

A global exception handler provides consistent API error responses.

Example:

```json
{
  "success": false,
  "message": "Product not found",
  "data": null
}
```

---

## 📦 DTO & Mapper Pattern

The application uses DTOs to transfer data between the frontend and backend instead of directly exposing JPA entities.

```text
Entity
   ↓
Mapper
   ↓
DTO
   ↓
Controller Response
```

Benefits include:

- Separation between API and database models
- Better control over exposed fields
- Reduced coupling
- Easier API maintenance

---

## 🧪 Testing

The backend contains automated tests for important business logic.

### Test Classes

```text
ApplicationTests
ProductServiceImplTest
OrderServiceImplTest
PaymentServiceImplTest
```

The test suite currently contains **15 tests**, all passing.

Tests cover areas such as:

- Product operations
- Product search and filtering
- Order creation
- Stock validation
- Payment creation
- Payment verification
- Payment failure handling

### Run Tests

Linux/macOS:

```bash
./mvnw test
```

Windows:

```powershell
.\mvnw.cmd test -DforkCount=0
```

---

## 🐳 Docker

The application can be run using Docker Compose.

### Services

```text
Frontend
Backend
MySQL
```

### Start

```bash
docker compose up --build
```

### Stop

```bash
docker compose down
```

### Local Ports

```text
Frontend → http://localhost:5173
Backend  → http://localhost:8080
MySQL    → localhost:3307
```

---

## ⚙️ Local Setup

### Prerequisites

Install:

- Java 25
- Maven
- Node.js
- MySQL
- Git
- Docker Desktop (optional)

### 1. Create MySQL Database

```sql
CREATE DATABASE shopsphere;
```

Make sure MySQL is running.

### 2. Start Backend

```powershell
cd ShopSphere-Backend
.\mvnw.cmd spring-boot:run
```

Backend:

```text
http://localhost:8080
```

### 3. Start Frontend

```bash
cd ShopSphere-Frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔑 Environment Variables

The application uses environment variables for sensitive configuration.

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Example local configuration:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/shopsphere}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}

jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

razorpay.key.id=${RAZORPAY_KEY_ID}
razorpay.key.secret=${RAZORPAY_KEY_SECRET}
```

> Never commit real database passwords, JWT secrets, or Razorpay secret keys to GitHub.

---

## 📁 Project Structure

```text
ShopSphere
│
├── .github
├── .gitignore
├── .env
├── docker-compose.yml
├── openapi.json
├── README.md
│
├── ShopSphere-Backend
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com.shopsphere
│   │   │   │       ├── config
│   │   │   │       ├── controller
│   │   │   │       ├── dto
│   │   │   │       ├── entity
│   │   │   │       ├── exception
│   │   │   │       ├── mapper
│   │   │   │       ├── repository
│   │   │   │       ├── security
│   │   │   │       └── service
│   │   │   └── resources
│   │   └── test
│   ├── pom.xml
│   ├── Dockerfile
│   └── .dockerignore
│
└── ShopSphere-Frontend
    ├── src
    ├── package.json
    ├── package-lock.json
    ├── Dockerfile
    ├── nginx.conf
    └── .dockerignore
```

---

## 🎯 Key Technical Highlights

- RESTful API development using Spring Boot
- Layered backend architecture
- Dependency Injection
- JWT authentication and authorization
- BCrypt password hashing
- Spring Data JPA and Hibernate
- MySQL relational database
- DTO and Mapper pattern
- Product search and filtering
- Pagination and sorting
- Shopping cart management
- Order management
- Razorpay payment integration
- Server-side payment signature verification
- Global exception handling
- Bean validation
- Swagger/OpenAPI documentation
- Automated testing
- Docker containerization
- React frontend integration
- Environment-based configuration

---

## 🔮 Future Enhancements

- Wishlist
- Product reviews and ratings
- Coupon and discount system
- Email notifications
- Product image upload
- Redis caching
- Refresh token authentication
- Advanced admin analytics
- CI/CD pipeline
- Production cloud deployment

---

## 📸 Screenshots

Add application screenshots here when available.

Suggested screenshots:

```text
screenshots/
├── home.png
├── products.png
├── product-details.png
├── cart.png
├── checkout.png
├── payment.png
├── orders.png
└── admin-dashboard.png
```

---

## 👨‍💻 Author

**Joydip Karmakar**

Java | Spring Boot | React | MySQL | Full-Stack Development

---

## 📄 License

This project is created for educational, portfolio, and interview preparation purposes.
