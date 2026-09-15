# Production CRM Backend API (Node.js + Express.js + Firebase)

A complete, production-ready, modular, and secure **CRM REST API** built with **Node.js**, **Express.js**, and **Firebase** (Admin SDK, Authentication, Cloud Firestore, and Firebase Storage) along with **Resend** for transactional email delivery.

---

## 1. Project Overview

This backend provides enterprise-grade customer relationship management services designed to connect smoothly with modern frontends (e.g., React.js + Vite, Next.js, or mobile applications). It replaces traditional SQL/MongoDB setups with Firebase Cloud Firestore, Firebase Authentication, and Firebase Cloud Storage while keeping sensitive administrative privileges and business rules strictly secured inside the Express.js server.

---

## 2. Features

* **Authentication & Identity**: Firebase Authentication ID Token verification via Firebase Admin SDK.
* **Role-Based Access Control (RBAC)**: Fine-grained permissions for `Admin`, `Manager`, `Sales Agent`, and `Support Agent`.
* **Customer Management**: Complete CRUD, search, multi-faceted filtering, cursor-based pagination, and a 360-degree aggregated details view.
* **Lead Management & Atomic Conversion**: Lead lifecycle tracking, pipeline progression, and transactional conversion into customers.
* **Deals & Pipeline Management**: Multi-stage deals pipeline (`New`, `Qualified`, `Proposal`, `Negotiation`, `Won`, `Lost`), win/loss notifications, and team celebration triggers.
* **Task Scheduling**: Assignment, prioritization, due date tracking, and quick completion toggles.
* **Touchpoints & Activities**: Team communication logging for calls, meetings, emails, notes, and follow-ups.
* **Support Helpdesk**: Ticket generation (`TICK-XXXXXX`), agent assignment, priority workflows, and email notifications.
* **In-App Notifications**: Real-time notification dispatch, unread badges, and bulk read operations.
* **Executive Dashboard**: Real-time KPI summaries, revenue trends, conversion funnel ratios, and pipeline values.
* **Reporting Engine**: Dynamic sales, customer growth, lead acquisition, employee performance, and revenue reports by customizable periods (`today`, `week`, `month`, `year`, `custom`).
* **Secure File Uploads**: Multer file type filtering with direct streaming to Firebase Storage or local fallback.
* **Transactional Email**: Automated notifications powered by Resend (welcome email, password reset, lead follow-up, deal celebrations, and ticket alerts).

---

## 3. Technology Stack

* **Runtime**: Node.js (ES Modules, `"type": "module"`)
* **Framework**: Express.js
* **Backend Database**: Cloud Firestore (via `firebase-admin`)
* **Authentication**: Firebase Authentication
* **Cloud Storage**: Firebase Storage
* **Email Provider**: Resend
* **File Processing**: Multer
* **Request Validation**: Express Validator
* **HTTP Logging**: Morgan
* **Security & CORS**: CORS middleware with strict origin verification

---

## 4. Folder Structure

```text
backend/
│
├── config/
│   ├── firebase.js              # Client SDK config
│   └── firebaseAdmin.js         # Firebase Admin SDK initialization
│
├── controllers/
│   ├── authController.js        # Auth sync & current user
│   ├── userController.js        # Admin user management & RBAC
│   ├── customerController.js    # Customer CRUD & 360 view
│   ├── leadController.js        # Lead tracking & conversion
│   ├── dealController.js        # Deals & sales pipeline
│   ├── taskController.js        # Task tracking & due dates
│   ├── activityController.js    # Team activity & touchpoint logs
│   ├── ticketController.js      # Support tickets & assignment
│   ├── notificationController.js# In-app notifications
│   ├── dashboardController.js   # Executive stats & graphs
│   └── reportController.js      # Filtered business reports
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── customerRoutes.js
│   ├── leadRoutes.js
│   ├── dealRoutes.js
│   ├── taskRoutes.js
│   ├── activityRoutes.js
│   ├── ticketRoutes.js
│   ├── notificationRoutes.js
│   ├── dashboardRoutes.js
│   └── reportRoutes.js
│
├── middleware/
│   ├── authMiddleware.js        # Firebase ID Token verification
│   ├── roleMiddleware.js        # Role-based route guard
│   ├── errorMiddleware.js       # Centralized error handler
│   ├── notFoundMiddleware.js    # 404 handler
│   ├── validationMiddleware.js  # express-validator handler
│   └── uploadMiddleware.js      # Multer file filter & upload limits
│
├── validators/
│   ├── authValidator.js
│   ├── customerValidator.js
│   ├── leadValidator.js
│   ├── dealValidator.js
│   ├── taskValidator.js
│   └── ticketValidator.js
│
├── services/
│   ├── emailService.js          # Resend transactional email templates
│   ├── notificationService.js   # Firestore notifications dispatcher
│   ├── storageService.js        # Firebase Storage bucket upload
│   ├── customerService.js       # Customer 360 multi-collection query
│   ├── leadService.js           # Transactional lead conversion
│   ├── dashboardService.js      # Metric calculations & KPIs
│   └── reportService.js         # Time-bounded reporting algorithms
│
├── utils/
│   ├── apiResponse.js           # Standardized JSON response format
│   ├── pagination.js            # Firestore cursor pagination helper
│   ├── generateTicketId.js      # Human-readable ticket ID generator
│   └── dateUtils.js             # Period/date calculations
│
├── seed/
│   └── seedData.js              # Comprehensive demo dataset seeder
│
├── uploads/                     # Local fallback storage directory
├── .env.example
├── .gitignore
├── package.json
├── server.js                    # Express app entry point
└── README.md
```

---

## 5. Firebase Project Setup

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project (or select an existing one, e.g., `crm-project-01-47884`).
3. Under **Build**, enable:
   * **Authentication** (Sign-in method: **Email/Password**).
   * **Cloud Firestore** (Start in production or test mode).
   * **Storage** (Default storage bucket).

---

## 6. Authentication Setup

The client authenticates directly with Firebase Authentication SDK (Email/Password, Google, etc.) and receives a Firebase ID Token.
The frontend sends this token in every HTTP request:
```http
Authorization: Bearer <firebase-id-token>
```
The Express backend verifies the token using:
```javascript
admin.auth().verifyIdToken(token)
```
No passwords or manual bcrypt hashes are stored in the backend or Firestore.

---

## 7. Firestore Setup

Main Firestore Collections:
* `users`: User profiles with roles, active status, contact details (`users/{uid}`).
* `customers`: Enterprise and individual customer records.
* `leads`: Sales inquiries and prospective customers.
* `deals`: Opportunities with pipeline stages, probability, and deal value.
* `tasks`: Action items with assignees, priorities, and deadlines.
* `activities`: Logged calls, emails, notes, and meetings.
* `tickets`: Customer service support tickets.
* `notifications`: User notifications with read/unread statuses.

---

## 8. Storage Setup

Firebase Cloud Storage stores:
* User profile images (`profiles/`)
* Customer documents & attachments (`documents/`)
* Support ticket attachments (`attachments/`)

The backend verifies file MIME types, blocks dangerous executable extensions (`.exe`, `.bat`, `.cmd`, `.sh`, `.php`, `.js`), and limits files to 10MB.

---

## 9. Firebase Admin Setup

To obtain a Service Account Key:
1. Go to **Project Settings** in the Firebase Console.
2. Select the **Service Accounts** tab.
3. Click **Generate new private key**.
4. Download the JSON file.
5. In production or `.env`, extract:
   * `FIREBASE_PROJECT_ID` = `project_id`
   * `FIREBASE_CLIENT_EMAIL` = `client_email`
   * `FIREBASE_PRIVATE_KEY` = `private_key` (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

`config/firebaseAdmin.js` automatically converts escaped `\n` characters to actual newlines. Alternatively, place the downloaded file as `config/serviceAccountKey.json`.

---

## 10. Environment Variables

Create a `.env` file in `backend/` based on `.env.example`:

```env
NODE_ENV=development
PORT=5000

CLIENT_URL=http://localhost:5173

# Firebase Admin SDK
FIREBASE_PROJECT_ID=crm-project-01-47884
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@crm-project-01-47884.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=crm-project-01-47884.firebasestorage.app

# Transactional Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=onboarding@resend.dev
```

---

## 11. Installation

```bash
cd backend
npm install
```

---

## 12. Running Locally

### Development Mode (with hot reload via Nodemon):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Verify backend health:
```bash
curl http://localhost:5000/api/health
```

Expected output:
```json
{
  "success": true,
  "message": "CRM API is running"
}
```

---

## 13. Seed Data

To populate the database with realistic demo accounts (Admin, Manager, Sales Agent, Support Agent), sample customers, leads, deals, tasks, tickets, and notifications:

```bash
npm run seed
```

### Demo Accounts Created:
* **Admin**: `admin@crmdemo.com` / `Password123!`
* **Manager**: `manager@crmdemo.com` / `Password123!`
* **Sales Agent**: `sales@crmdemo.com` / `Password123!`
* **Support Agent**: `support@crmdemo.com` / `Password123!`

---

## 14. API Endpoints

### Health Check
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Verify server health |

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/auth/me` | Protected | Current user's profile |
| `POST` | `/api/auth/sync-user` | Protected | Sync profile with Firestore |

### User Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin, Manager | List all users (paginated) |
| `GET` | `/api/users/:id` | Admin, Manager, Self | Get user profile |
| `POST` | `/api/users` | Admin | Create user in Auth & Firestore |
| `PUT` | `/api/users/:id` | Admin, Self | Update user details |
| `DELETE` | `/api/users/:id` | Admin | Deactivate/delete user |
| `PATCH` | `/api/users/:id/role` | Admin | Change user role |
| `PATCH` | `/api/users/:id/status` | Admin | Activate/deactivate user |

### Customers
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/customers` | Protected | List customers (search, filter, pagination) |
| `GET` | `/api/customers/:id` | Protected | Get single customer |
| `GET` | `/api/customers/:id/details`| Protected | 360 view (customer, activities, deals, tasks, tickets) |
| `POST` | `/api/customers` | Protected | Create new customer |
| `PUT` | `/api/customers/:id` | Protected | Update customer |
| `DELETE` | `/api/customers/:id` | Admin, Manager | Delete customer |

### Leads
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/leads` | Protected | List leads (filtered by status, priority) |
| `GET` | `/api/leads/:id` | Protected | Get lead by ID |
| `POST` | `/api/leads` | Protected | Create new lead |
| `PUT` | `/api/leads/:id` | Protected | Update lead |
| `POST` | `/api/leads/:id/convert` | Protected | Convert lead into customer (transactional) |
| `DELETE` | `/api/leads/:id` | Admin, Manager | Delete lead |

### Deals
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/deals` | Protected | List deals (filter by stage, customer) |
| `GET` | `/api/deals/:id` | Protected | Get deal details |
| `POST` | `/api/deals` | Protected | Create new deal |
| `PUT` | `/api/deals/:id` | Protected | Update deal |
| `PATCH` | `/api/deals/:id/stage` | Protected | Advance deal stage (`Won`, `Lost`, etc.) |
| `DELETE` | `/api/deals/:id` | Admin, Manager | Delete deal |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | Protected | List tasks (status, priority, due date) |
| `GET` | `/api/tasks/:id` | Protected | Get single task |
| `POST` | `/api/tasks` | Protected | Create task |
| `PUT` | `/api/tasks/:id` | Protected | Update task |
| `PATCH` | `/api/tasks/:id/complete` | Protected | Toggle task completion |
| `DELETE` | `/api/tasks/:id` | Protected | Delete task |

### Activities
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/activities` | Protected | List touchpoints (Call, Meeting, Email, Note) |
| `GET` | `/api/activities/:id` | Protected | Get activity by ID |
| `POST` | `/api/activities` | Protected | Log new activity |
| `PUT` | `/api/activities/:id` | Protected | Update activity |
| `DELETE` | `/api/activities/:id` | Protected | Delete activity |

### Support Tickets
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tickets` | Protected | List tickets (status, priority, agent) |
| `GET` | `/api/tickets/:id` | Protected | Get ticket by ID |
| `POST` | `/api/tickets` | Protected | Create support ticket |
| `PUT` | `/api/tickets/:id` | Protected | Update ticket |
| `PATCH` | `/api/tickets/:id/status` | Protected | Update ticket status (`Open`, `Resolved`, etc.) |
| `PATCH` | `/api/tickets/:id/assign` | Protected | Assign ticket to an agent |
| `DELETE` | `/api/tickets/:id` | Admin, Manager | Delete ticket |

### In-App Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Protected | Get notifications for authenticated user |
| `PATCH` | `/api/notifications/:id/read` | Protected | Mark specific notification as read |
| `PATCH` | `/api/notifications/read-all` | Protected | Mark all user notifications as read |
| `DELETE` | `/api/notifications/:id` | Protected | Delete notification |

### Dashboard Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Protected | High-level summary metrics and KPIs |
| `GET` | `/api/dashboard/revenue` | Protected | Monthly revenue timeline |
| `GET` | `/api/dashboard/leads` | Protected | Leads distribution by status & source |
| `GET` | `/api/dashboard/customers` | Protected | Customer acquisition breakdown |
| `GET` | `/api/dashboard/pipeline` | Protected | Active deal pipeline counts & values |

### Business Reports
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports/sales` | Admin, Manager | Deal close rates and revenue |
| `GET` | `/api/reports/revenue` | Admin, Manager | Filtered revenue and daily breakdown |
| `GET` | `/api/reports/customers` | Admin, Manager | Customer acquisition over time |
| `GET` | `/api/reports/leads` | Admin, Manager | Inbound lead channels report |
| `GET` | `/api/reports/employees` | Admin, Manager | Rep performance (deals, tasks, tickets) |
| `GET` | `/api/reports/conversion` | Admin, Manager | Funnel conversion metrics |

*Query params for reports*: `?period=month` (or `today`, `week`, `year`, `custom&from=2026-01-01&to=2026-09-15`).

### File Uploads
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/upload` | Protected | Upload file (`multipart/form-data`) |

---

## 15. Authentication Flow

```text
1. User logs in on React frontend using Firebase Client SDK.
2. Firebase Authentication returns an ID Token (JWT).
3. React sends HTTP Request:
   Authorization: Bearer <ID_TOKEN>
4. Express authMiddleware verifies token with Firebase Admin SDK:
   admin.auth().verifyIdToken(token)
5. Middleware reads user profile from Firestore `users/{uid}`.
6. User identity and permissions are attached to `req.user`.
7. Controller executes business logic with verified user identity.
```

---

## 16. Roles & Permissions

* **Admin**: Unrestricted access. Can manage users, alter roles, delete accounts, view reports, and configure all resources.
* **Manager**: Can view user directories, view company analytics/reports, and oversee sales/support workflows.
* **Sales Agent**: Manages assigned customers, leads, deals, tasks, and client touchpoints.
* **Support Agent**: Manages customer support tickets, status updates, and troubleshooting touchpoints.

---

## 17. Email Setup (Resend)

1. Register at [Resend.com](https://resend.com).
2. Generate an API Key in the API Keys section.
3. Configure in `.env`:
   ```env
   RESEND_API_KEY=re_your_api_key
   MAIL_FROM=onboarding@resend.dev
   ```
4. If no API key is set, the email service operates in safe simulation mode (logs email output without crashing or blocking execution).

---

## 18. File Upload Architecture

* Uploads are sent using `multipart/form-data` with field name `file`.
* Processed using Multer's in-memory storage.
* Streamed to Firebase Storage bucket or written to local `uploads/` directory as fallback.
* Returns standard payload:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "data": {
      "fileName": "avatar.png",
      "storagePath": "profiles/1694760000-avatar.png",
      "downloadUrl": "https://storage.googleapis.com/...",
      "size": 245100,
      "contentType": "image/png"
    }
  }
  ```

---

## 19. Firestore Composite Indexes

For high-volume queries with multiple filters and ordering, Cloud Firestore requires composite indexes.

The following indexes should be created in the Firebase Console:

1. **Customers**:
   * Collection: `customers` | Fields: `assignedEmployee` (ASC), `createdAt` (DESC)
   * Collection: `customers` | Fields: `status` (ASC), `createdAt` (DESC)

2. **Leads**:
   * Collection: `leads` | Fields: `assignedUser` (ASC), `createdAt` (DESC)
   * Collection: `leads` | Fields: `status` (ASC), `createdAt` (DESC)
   * Collection: `leads` | Fields: `priority` (ASC), `createdAt` (DESC)

3. **Deals**:
   * Collection: `deals` | Fields: `assignedSalesperson` (ASC), `createdAt` (DESC)
   * Collection: `deals` | Fields: `stage` (ASC), `createdAt` (DESC)
   * Collection: `deals` | Fields: `customerId` (ASC), `createdAt` (DESC)

4. **Tasks**:
   * Collection: `tasks` | Fields: `assignedUser` (ASC), `createdAt` (DESC)
   * Collection: `tasks` | Fields: `status` (ASC), `createdAt` (DESC)
   * Collection: `tasks` | Fields: `customerId` (ASC), `createdAt` (DESC)

5. **Tickets**:
   * Collection: `tickets` | Fields: `assignedAgent` (ASC), `createdAt` (DESC)
   * Collection: `tickets` | Fields: `status` (ASC), `createdAt` (DESC)
   * Collection: `tickets` | Fields: `customerId` (ASC), `createdAt` (DESC)

6. **Activities**:
   * Collection: `activities` | Fields: `customerId` (ASC), `createdAt` (DESC)
   * Collection: `activities` | Fields: `userId` (ASC), `createdAt` (DESC)
   * Collection: `activities` | Fields: `type` (ASC), `createdAt` (DESC)

---

## 20. Testing with Postman / cURL

### 1. Test Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Test Authenticated Request
Obtain an ID token from your client SDK and send:
```bash
curl -H "Authorization: Bearer YOUR_ID_TOKEN" http://localhost:5000/api/auth/me
```

### 3. Create a Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "company": "Tech Solutions",
    "status": "Active"
  }'
```

---

## 21. Deployment Guidelines

### Deploying to Render:
1. Create a **New Web Service** linked to your Git repository.
2. Set **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Configure Environment Variables under the **Environment** tab:
   * `NODE_ENV` = `production`
   * `PORT` = `10000` (or leave default)
   * `CLIENT_URL` = `https://your-frontend-domain.com`
   * `FIREBASE_PROJECT_ID` = your Firebase project ID
   * `FIREBASE_CLIENT_EMAIL` = your service account client email
   * `FIREBASE_PRIVATE_KEY` = your private key (with escaped newlines `\n`)
   * `FIREBASE_STORAGE_BUCKET` = your storage bucket
   * `RESEND_API_KEY` = your Resend API key

### Deploying to Railway:
1. Create a **New Project** -> **Deploy from GitHub repo**.
2. Set root directory to `/backend`.
3. Add the environment variables from `.env`.
4. Railway will automatically detect Node.js and run `npm start`.

---

## 22. Troubleshooting

* **401 Unauthorized**:
  * Ensure the `Authorization` header has the format `Bearer <token>`.
  * Ensure token has not expired (Firebase ID tokens expire after 1 hour).
* **Private Key Parsing Error**:
  * Ensure the private key string in `.env` preserves newline characters or is enclosed in double quotes with `\n`.
* **Missing or Insufficient Permissions (Firestore)**:
  * Verify that your Firebase service account has the **Firebase Admin SDK Administrator Service Agent** or **Cloud Datastore User** role in GCP IAM.
* **CORS Error**:
  * Ensure `CLIENT_URL` in `.env` matches your frontend domain exactly (including protocol and port, e.g. `http://localhost:5173`).
