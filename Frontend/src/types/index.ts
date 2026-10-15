import type { ReactNode } from 'react'

export type UserRole = 'admin' | 'user'

export type TaskStatus = 'To Do' | 'In Progress' | 'Hold' | 'Done'

export type ProjectAccess = 'owner' | 'edit' | 'view'

export type CollaboratorPermission = 'view' | 'edit'

export interface CollaboratorUser {
  _id: string
  username: string
  email: string
  fullName?: string
  position?: string
  profilePhoto?: string
}

export interface Collaborator {
  _id: string
  user: CollaboratorUser
  permission: CollaboratorPermission
}

export interface User {
  _id: string
  username: string
  email: string
  password: string
  role: UserRole
  fullName: string
  position: string
  profilePhoto: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  _id: string
  name: string
  description: string
  user: CollaboratorUser
  collaborators: Collaborator[]
  access: ProjectAccess
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

export interface Comment {
  _id: string
  text: string
  task: string
  parent: string | null
  user: CollaboratorUser
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
  fullName: string
  position: string
  profilePhoto?: string
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
  title?: string
  description?: string
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
  replaceUser: (user: SessionUser) => void
}

export interface ProfileBody {
  fullName: string
  position: string
  username: string
  email: string
  profilePhoto: string
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

export interface ProjectCardProps {
  project: Project
  selected: boolean
  onSelect: (projectId: string) => void
}

export interface TaskCardProps {
  task: Task
  canEdit: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onComment: (task: Task) => void
}

export interface TaskColumnProps {
  status: TaskStatus
  tasks: Task[]
  canEdit: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onComment: (task: Task) => void
}

export interface TaskBoardProps {
  tasks: Task[]
  canEdit: boolean
  onMove: (task: Task, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onComment: (task: Task) => void
}

export interface CollaboratorFormProps {
  collaborators: Collaborator[]
  submitting: boolean
  error: string | null
  onInvite: (body: { email: string; permission: CollaboratorPermission }) => Promise<boolean>
  onRemove: (userId: string) => void
}

export interface SpinnerProps {
  label: string
  light?: boolean
}

export interface ProjectFormProps {
  initialValues?: ProjectBody
  submitLabel: string
  submitting?: boolean
  error?: string | null
  onSubmit: (body: ProjectBody) => void
  onCancel?: () => void
}

export interface TaskFormProps {
  initialValues?: TaskBody
  submitLabel: string
  submitting?: boolean
  error?: string | null
  onSubmit: (body: TaskBody) => void
  onCancel?: () => void
}

export interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}
