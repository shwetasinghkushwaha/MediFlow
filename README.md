# MediFlow — MERN Patient Queue Management

A standalone JavaScript MERN application using MongoDB, Express, React, Node.js, JWT authentication, and Socket.io queue updates.

## Features

- Admin, doctor, and patient roles.
- First registered account becomes an admin; later accounts become patients.
- Admin hospital, doctor, user-role, and live-queue management.
- Doctor queue controls: call, start, complete, and skip.
- Patient hospital browsing, appointment booking, tokens, wait estimates, and cancellation.
- Socket.io updates for queues, doctors, and hospitals.

## Folder structure

```text
queuecare-mern/
├── server/
│   ├── config/          # Environment and MongoDB setup
│   ├── controllers/     # Request handling and business logic
│   ├── middleware/      # Authentication, authorization, errors
│   ├── models/          # Mongoose data models
│   ├── routes/          # Express URL mappings only
│   ├── socket/          # Socket.io setup and room listeners
│   ├── utils/           # Shared server helpers
│   ├── app.js           # Express application assembly
│   └── server.js        # Server entry point
└── client/
    └── src/
        ├── components/  # Reusable interface pieces
        ├── lib/         # API, auth, sockets, queue helpers
        ├── pages/       # Complete screens
        └── routes/      # Client URL mappings
```

Each concern is separated: route files only declare endpoints, controllers contain request logic, models define data, middleware handles request guards, and configuration/socket startup have their own folders.

## Requirements

- Node.js 18+
- MongoDB locally or through MongoDB Atlas

## Run the backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Set a private `JWT_SECRET` and your MongoDB connection in `.env`. The backend runs at `http://localhost:5000`.

## Run the frontend

```bash
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Main API endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST /api/hospitals`, `DELETE /api/hospitals/:id`
- `GET|POST /api/doctors`, `GET /api/doctors/me`, `PATCH|DELETE /api/doctors/:id`
- `GET /api/appointments/queue/:doctorId`, `GET /api/appointments/mine`
- `POST /api/appointments`, `PATCH /api/appointments/:id/status`
- `POST /api/appointments/next/:doctorId`
- `GET /api/users`, `PATCH /api/users/:id/role`
