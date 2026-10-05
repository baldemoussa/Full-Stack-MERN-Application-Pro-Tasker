export type UserRole = 'admin' | 'user'

export type TaskStatus = 'To Do' | 'In Progress' | 'Done'

export interface User {
  _id: string
  username: string
  email: string
  password: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Project {
  _id: string
  name: string
  description: string
  user: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  _id: string
  title: string
  description: string
  status: TaskStatus
  project: string
  createdAt: string
  updatedAt: string
}
