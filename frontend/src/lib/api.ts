const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.detail || res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Auth ---
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_BASE}/api/v1/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.detail || "Login failed", res.status);
  }
  return res.json();
}

// --- Jobs ---
export interface Message {
  id: string;
  tenant_id: string;
  job_id: string;
  channel: string;
  direction: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  job_id: string;
  technician_id: string | null;
  scheduled_time: string;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  tenant_id: string;
  customer_id: string;
  title: string;
  description: string | null;
  status: string;
  urgency: string;
  estimated_price: number | null;
  final_price: number | null;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  appointments?: Appointment[];
}

export function getJobs(token: string) {
  return api<Job[]>("/api/v1/jobs", { token });
}

export function getJob(token: string, jobId: string) {
  return api<Job>(`/api/v1/jobs/${jobId}`, { token });
}

export function createJob(token: string, data: {
  customer_id: string;
  title: string;
  description?: string;
  urgency?: string;
  estimated_price?: number;
}) {
  return api<Job>("/api/v1/jobs", { method: "POST", token, body: JSON.stringify(data) });
}

export function patchJob(token: string, jobId: string, data: Partial<Job>) {
  return api<Job>(`/api/v1/jobs/${jobId}`, { method: "PATCH", token, body: JSON.stringify(data) });
}

export function createMessage(token: string, jobId: string, data: { channel?: string; direction?: string; content: string }) {
  return api<Message>(`/api/v1/jobs/${jobId}/messages`, {
    method: "POST",
    token,
    body: JSON.stringify({ job_id: jobId, ...data }),
  });
}

export function createAppointment(token: string, jobId: string, data: { scheduled_time: string; duration_minutes?: number; technician_id?: string }) {
  return api<Appointment>(`/api/v1/jobs/${jobId}/appointments`, {
    method: "POST",
    token,
    body: JSON.stringify({ job_id: jobId, ...data }),
  });
}

// --- Customers ---
export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function getCustomers(token: string) {
  return api<Customer[]>("/api/v1/customers", { token });
}

export function createCustomer(token: string, data: { name: string; phone?: string; email?: string; address?: string }) {
  return api<Customer>("/api/v1/customers", { method: "POST", token, body: JSON.stringify(data) });
}

// --- AI Intake ---
export interface JobDraftExtraction {
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  job_title: string;
  job_description?: string | null;
  job_urgency: "low" | "normal" | "high" | "critical";
}

export async function aiIntake(token: string, text?: string, file?: File): Promise<JobDraftExtraction> {
  const formData = new FormData();
  if (text) formData.append("text", text);
  if (file) formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/jobs/ai-intake`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(errorBody.detail || "AI vyhodnotenie zlyhalo", res.status);
  }

  return res.json();
}
