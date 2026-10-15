# Pro-Tasker

**Author:** [Mamadou Moussa BALDE](https://www.linkedin.com/in/2mb/)

Pro-Tasker is a project board. A user registers, creates projects, invites other registered users, and moves each project's tasks across four columns: To Do, In Progress, Done, and Hold.

The API is Express and MongoDB. The client is React. A JSON Web Token identifies the caller. Project and task routes then check whether that caller is the owner, an editor, or a viewer.

## Deployment

| Service | URL |
| --- | --- |
| Application | https://full-stack-mern-application-pro-tasker-1.onrender.com |
| API | https://full-stack-mern-application-pro-tasker.onrender.com |

Both services deploy from the `main` branch. The application is the React site. The API is the Express service. Local setup below is for running the same app on your machine.

## Screenshots

### Dashboard

![Project list, project actions, and the overview counts](docs/screenshots/dashboard.png)

### Board

![To Do and In Progress columns, with priority, a due date, and an overdue card](docs/screenshots/board.png)

### Analytics

![Status pie chart with a quarter of the tasks in each column](docs/screenshots/analytics.png)

![Tasks added over the last 14 days](docs/screenshots/analytics-trend.png)

### Night mode

![The dashboard in night mode](docs/screenshots/dashboard-night.png)

### Log in

![Log in screen](docs/screenshots/login.png)

### Create an account

![Registration screen](docs/screenshots/register.png)

## Features

- Register, log in, and log out. The token is stored in `sessionStorage` and expires after 2 hours. A signed-in user can update their profile and change their password.
- Create, read, update, and delete projects. The owner can close, archive, or reopen a project. A closed or archived project stays readable and cannot be edited until it is reopened.
- Share a project with a registered user as view only or can edit. The owner can change that permission or remove the person.
- Create, read, update, and delete tasks nested under a project. Each task has a priority of Low, Medium, or High, and can be assigned to one or more people the project was shared with. View-only collaborators can read the board and add comments.
- Search the project list by name or description. Search the open board by title, description, or assignee, and filter it by status or priority.
- Comment on a task, and reply to a comment. The author or the project owner can delete a comment, which also removes its replies.
- An overview shows the owner, the number of invited contributors, and counts Total, To Do, In Progress, Done, and Hold for the open project.
- Analytics opens for the selected project and shows completion, a status pie chart, a 14-day trend line, priority, overdue tasks, and assignment totals.
- Drag a card onto another column. The new status is saved. Edit still changes status too.
- Deleting a project also deletes that project's tasks and comments. Only the owner can delete a project.
- Light mode and night mode. The choice is saved in `localStorage`.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS, dnd-kit, Motion |
| Backend | Node.js, Express 5, Mongoose 9, JWT, bcrypt |
| Database | MongoDB |

## Project structure

```text
Backend/
  config/connection.js      MongoDB connection
  controllers/              User, project, task, and comment handlers
  models/                   User, Project, Task, Comment
  routes/api/               /api/users and /api/projects
  utils/auth.js             Sign a token and require one on protected routes
  utils/access.js           Owner, edit, and view checks
  server.js
Frontend/
  src/components/           Forms, cards, drag-and-drop board, share form, modal, theme toggle
  src/context/              Auth and theme contracts
  src/hooks/                useApi (POST, PUT, DELETE) and useFetch (GET)
  src/pages/                Login, register, dashboard, analytics
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

Send `Authorization: Bearer <token>` on every route except register and login. A missing or invalid token returns **401**. A caller without access returns **403**. A missing record returns **404**.

### Users

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/users/register` | `fullName`, `position`, `username`, `email`, `password` (at least 5 characters). `profilePhoto` is optional |
| POST | `/api/users/login` | `email`, `password` |
| GET | `/api/users/me` | — |
| PUT | `/api/users/me` | `fullName`, `position`, `username`, `email`, `profilePhoto` |
| PUT | `/api/users/me/password` | `currentPassword`, `newPassword` (at least 5 characters, and different from the current password) |

Register and login return a token. The client then calls `/api/users/me` and uses that user, which does not include the password.

### Projects

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/projects` | `name`, `description`, optional `invites` |
| GET | `/api/projects` | — |
| GET | `/api/projects/:id` | — |
| PUT | `/api/projects/:id` | `name`, `description`, optional `invites`, optional `removeCollaboratorIds` |
| DELETE | `/api/projects/:id` | — |
| PUT | `/api/projects/:id/close` | — |
| PUT | `/api/projects/:id/archive` | — |
| PUT | `/api/projects/:id/reopen` | — |
| POST | `/api/projects/:id/collaborators` | `email`, `permission` (`view` or `edit`) |
| DELETE | `/api/projects/:id/collaborators/:userId` | — |

The owner is stored as `user`. The client cannot replace that field. Create and update can add collaborators with `invites`, and update can remove them with `removeCollaboratorIds`. Only the owner can change who is invited. `GET /api/projects` includes owned projects and invited projects. Each project includes `access`: `owner`, `edit`, or `view`. Only the owner can invite, remove a collaborator, delete the project, or change its status between open, closed, and archived. Delete also removes every task whose `project` is that id, and the comments on those tasks.

### Tasks

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/projects/:projectId/tasks` | `title`, `description`, `status`, `priority`, `dueDate`, `assignees` |
| GET | `/api/projects/:projectId/tasks` | — |
| PUT | `/api/projects/:projectId/tasks/:taskId` | `title`, `description`, `status`, `priority`, `dueDate`, `assignees` |
| DELETE | `/api/projects/:projectId/tasks/:taskId` | — |
| GET | `/api/projects/:projectId/tasks/:taskId/comments` | — |
| POST | `/api/projects/:projectId/tasks/:taskId/comments` | `text`. Optional `parent` comment id for a reply |
| DELETE | `/api/projects/:projectId/tasks/:taskId/comments/:commentId` | — |

`status` is `To Do`, `In Progress`, `Done`, or `Hold`. It defaults to `To Do`. `priority` is `Low`, `Medium`, or `High`. It defaults to `Medium`. `assignees` is a list of user ids for people the project was shared with. The owner cannot be assigned. It defaults to an empty list. `dueDate` is an optional `YYYY-MM-DD` date. Update and delete return **404** when the task does not belong to `:projectId`. Anyone who can view the project can comment. A reply's `parent` must be a comment on that task, and that comment cannot itself be a reply. Deleting a comment also deletes its replies.

## How a request moves

1. The dashboard calls `useFetch` for `GET /api/projects` and `GET /api/projects/:id/tasks`.
2. Create, update, and delete go through `useApi` (`post`, `put`, `del`).
3. `authMiddleware` reads the bearer token and sets `req.user`.
4. The controller checks whether the caller is the owner, an editor, or a viewer, then reads or writes MongoDB.
5. Dragging a card sends `PUT` with the new `status`. The card moves immediately and returns if the save fails.
6. The page adds the returned record to the list already on screen. A failed call returns `null` and shows the API `message`.
