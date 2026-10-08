# Pro-Tasker

Pro-Tasker is an owner-only project board. A user registers, creates projects, and moves each project's tasks across three columns: To Do, In Progress, and Done.

The API is Express and MongoDB. The client is React. A JSON Web Token identifies the caller, and every project and task route checks that the caller owns the record.

## Deployment

| Service | URL |
| --- | --- |
| Application | https://full-stack-mern-application-pro-tasker-1.onrender.com |
| API | https://full-stack-mern-application-pro-tasker.onrender.com |

Both services deploy from the `main` branch. The application is the React site. The API is the Express service. Local setup below is for running the same app on your machine.

## Features

- Register, log in, and log out. The token is stored in `sessionStorage` and expires after 2 hours.
- Create, read, update, and delete projects.
- Create, read, update, and delete tasks nested under a project.
- Deleting a project also deletes that project's tasks.
- Light mode and night mode. The choice is saved in `localStorage`.

Collaboration and drag-and-drop are not in this version. A task changes column through Edit.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express 5, Mongoose 9, JWT, bcrypt |
| Database | MongoDB |

## Project structure

```text
Backend/
  config/connection.js      MongoDB connection
  controllers/              User, project, and task handlers
  models/                   User, Project, Task
  routes/api/               /api/users and /api/projects
  utils/auth.js             Sign a token and require one on protected routes
  server.js
Frontend/
  src/components/           Forms, cards, columns, modal, theme toggle
  src/context/              Auth and theme contracts
  src/hooks/                useApi (POST, PUT, DELETE) and useFetch (GET)
  src/pages/                Login, register, dashboard
  src/providers/            Session state and light/night mode
  src/types/index.ts        Shared TypeScript types
```

## Setup

Use two terminals. Start the API before the client.

### Backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
PORT=3000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret
```

`PORT` defaults to `3001` if it is omitted. This project uses `3000` so it matches the client.

```bash
npm run dev
```

`npm start` runs the server without nodemon.

### Frontend

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_TOKEN_KEY=pro-tasker-token
```

```bash
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

## App routes

| Path | Who can open it |
| --- | --- |
| `/login` | Guests |
| `/register` | Guests |
| `/dashboard` | Signed-in users. This is the project sidebar and the task board. |
| `/projects/:projectId` | Signed-in users |

Any other path redirects to `/dashboard`.

## API

Send `Authorization: Bearer <token>` on every route except register and login. A missing or invalid token returns **401**. A record owned by someone else returns **403**. A missing record returns **404**.

### Users

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/users/register` | `username`, `email`, `password` (at least 5 characters) |
| POST | `/api/users/login` | `email`, `password` |
| GET | `/api/users/me` | — |

Register and login return a token. The client then calls `/api/users/me` and uses that user, which does not include the password.

### Projects

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/projects` | `name`, `description` |
| GET | `/api/projects` | — |
| GET | `/api/projects/:id` | — |
| PUT | `/api/projects/:id` | `name`, `description` |
| DELETE | `/api/projects/:id` | — |

The owner is stored as `user`. The client cannot change that field. Delete also removes every task whose `project` is that id.

### Tasks

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/projects/:projectId/tasks` | `title`, `description`, `status` |
| GET | `/api/projects/:projectId/tasks` | — |
| PUT | `/api/projects/:projectId/tasks/:taskId` | `title`, `description`, `status` |
| DELETE | `/api/projects/:projectId/tasks/:taskId` | — |

`status` is `To Do`, `In Progress`, or `Done`. It defaults to `To Do`. Update and delete return **404** when the task does not belong to `:projectId`.

## How a request moves

1. The dashboard calls `useFetch` for `GET /api/projects` and `GET /api/projects/:id/tasks`.
2. Create, update, and delete go through `useApi` (`post`, `put`, `del`).
3. `authMiddleware` reads the bearer token and sets `req.user`.
4. The controller checks ownership, then reads or writes MongoDB.
5. The page adds the returned record to the list already on screen. A failed call returns `null` and shows the API `message`.
