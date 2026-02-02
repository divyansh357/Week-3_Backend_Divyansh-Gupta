# SaaS Backend - Multi-Tenant Project Management System

## 🚀 Overview
This repository hosts the backend for a robust **Multi-Tenant SaaS Project Management System**. It is designed to handle multiple organizations, keeping their data strictly isolated while allowing seamless collaboration within teams. The system implements strict **Role-Based Access Control (RBAC)** to ensure that Admins manage the organization while Members focus on their assigned tasks.

## ✨ Key Features
- **🏢 Multi-Tenancy Architecture**: Single database instance serving multiple organizations with strict data isolation.
- **🔐 Secure Authentication**: 
    - JWT-based stateless authentication.
    - Password hashing using `bcrypt`.
- **🛡️ Role-Based Access Control (RBAC)**:
    - **Admin**: Full control over organization, users, and projects.
    - **Member**: Access limited to assigned projects and tasks.
- **📄 Activity Logging**: Tracks important actions (Project creation, Task updates) for audit trails.
- **⚡ Performance Optimized**: Efficient PostgreSQL queries and connection pooling.

## 🛠️ Tech Stack
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (Minimalist web framework)
- **Database:** PostgreSQL (Relational Database)
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** Bcrypt (Hashing), CORS (Cross-Origin Resource Sharing)
- **Tools:** Postman (Testing), Nodemon (Dev Server)

## 📂 Project Structure
A modular structure ensures scalability and maintainability.
```
/saas-backend
  /src
    /config         # 🔌 Database Connection Pool & Env Setup
    /controllers    # 🧠 Business Logic (Auth, Orgs, Projects, Tasks)
    /middleware     # 🛡️ Middleware (Auth Verification, Role Checks)
    /routes         # 🛣️ API Route Definitions
    /utils          # ⚙️ Helper Utilities (Activity Logger, Error Handler)
    app.js          # 🚀 Application Entry Point
  .env              # 🌍 Environment Variables
  package.json      # 📦 Project Dependencies
```

## 🗄️ Database Schema
The system is built on a relational model interlinking Organizations, Users, Projects, and Tasks.

| Table | Description | Key Relations |
| :--- | :--- | :--- |
| **Organizations** | Root entity for multi-tenancy. | Has many Users. |
| **Users** | System users (Admins/Members). | Belongs to an Org. Has many Projects/Tasks. |
| **Projects** | Workspaces for tasks. | Belongs to an Org. Has many Tasks. |
| **Tasks** | Unit of work. | Belongs to a Project. Assigned to a User. |

## ⚙️ Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/divyansh357/Week-3_Backend_Divyansh-Gupta.git
    cd Week-3_Backend_Divyansh-Gupta/saas-backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the `saas-backend` directory based on `.env.example`:
    ```env
    PORT=5000
    DB_USER=postgres
    DB_PASSWORD=your_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=saas_db
    JWT_SECRET=your_secure_jwt_secret
    ```

4.  **Database Setup**
    Ensure your PostgreSQL server is running and the database `saas_db` exists. The tables will need to be created using the provided SQL scripts (if applicable) or migration tools.

5.  **Run the Server**
    ```bash
    # Development Mode (with hot-reload)
    npm run dev

    # Production Mode
    npm start
    ```

## � API Endpoints & Usage

### 🔐 Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register-org` | Register a new Organization & Admin account. | Public |
| `POST` | `/api/auth/login` | Login and receive a JWT Bearer token. | Public |

### 🏢 Organization Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orgs/users` | Add a new user to the organization. | **Admin** |
| `GET` | `/api/orgs/users` | List all users in the organization. | **Admin** |

### 📁 Principals & Projects
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects` | Create a new project. | **Admin** |
| `GET` | `/api/projects` | List projects (Admin sees all, Member sees assigned). | Auth User |
| `GET` | `/api/projects/:id` | Get details of a specific project. | Auth User |

### 📝 Task Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks` | Create a new task in a project. | Auth User |
| `GET` | `/api/tasks/:projectId` | Get all tasks for a specific project. | Auth User |
| `PATCH` | `/api/tasks/:taskId` | Update task status or details. | Owner/Admin |
| `DELETE` | `/api/tasks/:taskId` | Remove a task. | Owner/Admin |

## 🧪 Error Handling
The API returns standard HTTP status codes:
- `200` OK - Success
- `201` Created - Resource successfully created
- `400` Bad Request - Invalid input data
- `401` Unauthorized - Invalid or missing token
- `403` Forbidden - Insufficient permissions (Role check failed)
- `404` Not Found - Resource does not exist
- `500` Internal Server Error - Server-side issue

## 📂 Deliverables
The project deliverables, including diagrams and testing proofs, are located in the customized folders:
- **[ER Diagram](./deliverables/er-diagram/)** - Visual representation of the database schema.
- **[Postman Collection](./deliverables/postman/)** - Importable JSON file for API testing.
- **[Screenshots](./deliverables/screenshots/)** - Evidence of Role-Based Access Control in action.

---
**Developed by Divyansh Gupta** | *Week 3 Backend Evaluation*
