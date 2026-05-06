# University Management System (UMS)

A full-stack University Management System with role-based access control, featuring a React Native mobile app, React.js admin dashboard, and Node.js/Express backend powered by Supabase and Prisma.

## Architecture Overview

```
university-management-system/
├── backend/                 # Node.js + Express API
│   ├── prisma/             # Database schema & seed
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth & error handling
│   │   └── routes/         # API route definitions
│   └── package.json
├── mobile/                  # React Native (Expo) App
│   ├── src/
│   │   ├── screens/        # All app screens
│   │   ├── navigation/     # Tab & stack navigators
│   │   └── services/       # API layer & auth context
│   └── package.json
├── admin-dashboard/         # React.js Web Dashboard
│   ├── src/
│   │   ├── pages/          # Dashboard & Login pages
│   │   └── components/     # Reusable UI components
│   └── package.json
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile App** | React Native (Expo), NativeWind, React Navigation |
| **Admin Dashboard** | React.js, Vite, Tailwind CSS |
| **Backend API** | Node.js, Express.js |
| **Database** | PostgreSQL via Supabase |
| **ORM** | Prisma |
| **Authentication** | Supabase Auth + JWT + RBAC |

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Supabase Account** (free tier works)

## Step 1: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Once created, go to **Settings → API** and note down:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key**
   - **service_role key** (keep secret!)
3. Go to **Settings → Database** and copy the **Connection string** (URI format)

## Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
JWT_SECRET="generate-a-strong-random-string-here"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# Seed with sample data
npx prisma db seed

# Start the server
npm run dev
```

The API will be running at `http://localhost:3000`.

## Step 3: Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

**Configure API URL:** Edit `src/services/api.js` and update `BASE_URL`:
- For Android emulator: `http://10.0.2.2:3000/api`
- For iOS simulator: `http://localhost:3000/api`
- For physical device: `http://YOUR_LOCAL_IP:3000/api`

## Step 4: Admin Dashboard Setup

```bash
cd admin-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be running at `http://localhost:3001`. The Vite proxy automatically forwards `/api` requests to the backend.

## Database Schema

The Prisma schema defines the following models:

| Model | Description |
|-------|-------------|
| **User** | Authentication data (email, password hash, role) linked to Supabase Auth |
| **Profile** | Personal info (name, phone, department, student/employee ID) |
| **Department** | University departments with code and description |
| **Course** | Courses with credits, semester, capacity, assigned faculty |
| **Enrollment** | Student-course registration records |
| **Attendance** | Daily attendance records (PRESENT/ABSENT/LATE) |
| **Grade** | Semester grades with midterm, final, assignment breakdown |
| **FeeStatus** | Fee payment tracking (PAID/PENDING/OVERDUE/PARTIAL) |
| **StudyMaterial** | Uploaded resources linked to courses and faculty |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Admin Routes (requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users (filterable) |
| POST | `/api/admin/onboard-user` | Create new student/faculty |
| GET/POST | `/api/admin/departments` | Manage departments |
| GET/POST | `/api/admin/courses` | Manage courses |
| GET/POST | `/api/admin/fees` | Track/update fee status |

### Faculty Routes (requires FACULTY role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faculty/stats` | Faculty dashboard stats |
| GET | `/api/faculty/courses` | Get assigned courses |
| GET | `/api/faculty/courses/:id/students` | Get enrolled students |
| POST | `/api/faculty/attendance` | Mark attendance |
| GET | `/api/faculty/attendance/:courseId` | View attendance records |
| POST | `/api/faculty/materials` | Upload study material |
| POST | `/api/faculty/grades` | Enter/update grades |

### Student Routes (requires STUDENT role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/stats` | Student dashboard stats |
| GET | `/api/student/attendance` | View attendance records |
| GET | `/api/student/grades` | View semester grades |
| GET | `/api/student/available-courses` | Browse available courses |
| POST | `/api/student/register-course` | Register for a course |
| GET | `/api/student/my-courses` | View enrolled courses |
| GET | `/api/student/digital-id` | Get digital ID card data |
| GET | `/api/student/materials` | View study materials |
| GET | `/api/student/fees` | View fee status |

## Demo Credentials

After running the seed script, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@university.edu | admin123 |
| Faculty | john.smith@university.edu | faculty123 |
| Faculty | sarah.johnson@university.edu | faculty123 |
| Student | alice.williams@university.edu | student123 |
| Student | bob.davis@university.edu | student123 |
| Student | carol.martinez@university.edu | student123 |

## User Roles & Permissions

### Admin
- Full system access
- Onboard students and faculty
- Create/manage departments and courses
- Track fee payments
- View all system statistics

### Faculty
- View assigned courses
- Mark student attendance
- Upload study materials
- Enter and update grades

### Student
- View personal dashboard with stats
- Check attendance records per course
- View semester grades and CGPA
- Register for available courses
- Access digital ID card
- View uploaded study materials
- Check fee payment status

## Design Principles

- **Dark Mode First**: All interfaces use a dark color palette (Slate 900/950 backgrounds)
- **Mobile First**: React Native app designed for mobile-first experience
- **Minimalist UI**: Clean, professional design with consistent spacing
- **Color System**: Indigo (primary), Emerald (success), Amber (warning), Red (error)
- **Typography**: Clear hierarchy with proper font weights and sizes

## Project Structure Details

### Backend (`/backend`)
```
├── .env.example              # Environment template
├── package.json              # Dependencies & scripts
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.js               # Initial data seeder
└── src/
    ├── index.js              # Express app entry point
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── admin.controller.js
    │   ├── faculty.controller.js
    │   └── student.controller.js
    ├── middleware/
    │   ├── auth.middleware.js    # JWT + RBAC
    │   └── error.middleware.js   # Global error handler
    └── routes/
        ├── auth.routes.js
        ├── admin.routes.js
        ├── faculty.routes.js
        └── student.routes.js
```

### Mobile App (`/mobile`)
```
├── App.js                    # Entry point
├── app.json                  # Expo configuration
├── package.json
├── tailwind.config.js        # NativeWind theme
└── src/
    ├── navigation/
    │   ├── RootNavigator.js  # Auth flow + role routing
    │   ├── StudentTabs.js    # Student bottom tabs
    │   ├── FacultyTabs.js    # Faculty bottom tabs
    │   └── AdminTabs.js      # Admin bottom tabs
    ├── screens/
    │   ├── auth/LoginScreen.js
    │   ├── student/
    │   │   ├── StudentDashboard.js
    │   │   ├── AttendanceScreen.js
    │   │   ├── GradesScreen.js
    │   │   ├── CourseRegistration.js
    │   │   └── DigitalIdScreen.js
    │   ├── faculty/
    │   │   ├── FacultyDashboard.js
    │   │   ├── MarkAttendance.js
    │   │   ├── UploadMaterials.js
    │   │   └── EnterGrades.js
    │   └── admin/AdminDashboard.js
    └── services/
        ├── api.js            # API service layer
        └── AuthContext.js    # Auth state management
```

### Admin Dashboard (`/admin-dashboard`)
```
├── index.html
├── package.json
├── vite.config.js            # Vite + API proxy
├── tailwind.config.js
└── src/
    ├── main.jsx
    ├── App.jsx               # Router + Auth provider
    ├── index.css             # Tailwind + custom classes
    ├── pages/
    │   ├── Login.jsx
    │   └── Dashboard.jsx
    └── components/
        └── Sidebar.jsx
```

## Troubleshooting

**Database connection issues:**
- Ensure your Supabase project is active
- Check that the DATABASE_URL includes `?schema=public`
- Verify the password doesn't contain special characters that need URL encoding

**Mobile app can't connect to backend:**
- Use your machine's local IP instead of `localhost` for physical devices
- Ensure the backend is running on port 3000
- Check that CORS is properly configured in the backend

**Prisma issues:**
- Run `npx prisma generate` after any schema changes
- Use `npx prisma db push` for development (no migrations needed)
- Use `npx prisma studio` to visually inspect your database

## License

MIT License - Built for educational purposes.
