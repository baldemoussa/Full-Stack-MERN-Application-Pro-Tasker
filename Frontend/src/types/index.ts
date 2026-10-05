import type { ReactNode } from 'react'

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

export interface AuthResponse {
  token: string
  user: Omit<User, 'password'>
}

export interface ApiMessage {
  message: string
}

export interface RegisterBody {
  username: string
  email: string
  password: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface ProjectBody {
  name: string
  description: string
}

export interface TaskBody {
  title: string
  description: string
  status?: TaskStatus
}

export interface UseApiConfig {
  token?: string | null
  baseUrl?: string
}

export type HttpMethod = 'POST' | 'PUT' | 'DELETE'

export interface RequestOptions<TBody = unknown> {
  headers?: HeadersInit
  body?: TBody
}

export interface ApiResponse<TData = unknown> {
  data: TData | null;
  error: Error | null;
  loading: boolean;
  execute: (
    url: string,
    method: HttpMethod,
    options?: RequestOptions<unknown>
  ) => Promise<TData | null>;
  post: <TBody = unknown>(
    url: string,
    body?: TBody,
    headers?: Record<string, string>
  ) => Promise<TData | null>;
  put: <TBody = unknown>(
    url: string,
    body?: TBody,
    headers?: Record<string, string>
  ) => Promise<TData | null>;
  del: <TBody = unknown>(
    url: string,
    body?: TBody,
    headers?: Record<string, string>
  ) => Promise<TData | null>;
}

export type SessionUser = Omit<User, 'password'>

export interface AuthContextType {
  user: SessionUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  submitting: boolean
  error: string | null
  login: (body: LoginBody) => Promise<boolean>
  register: (body: RegisterBody) => Promise<boolean>
  logout: () => void
}

export interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
}

export interface AuthProviderProps {
  children: ReactNode
}

export interface ThemeProviderProps {
  children: ReactNode
}

export interface AlertProps {
  message: string | null
}
