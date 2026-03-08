const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("token");
}

function buildQuery(params?: Record<string, any>) {
  if (!params) return "";
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    qs.set(key, String(value));
  });

  const str = qs.toString();
  return str ? `?${str}` : "";
}

/**
 * JSON request helper
 * Supports skipAuth for public endpoints like /auth/login
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
  config?: { skipAuth?: boolean }
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!config?.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data: any = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.reply ||
      data?.detail ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

/**
 * FormData request helper
 * IMPORTANT: do NOT set Content-Type manually for multipart/form-data
 */
async function requestFormData<T>(
  path: string,
  formData: FormData,
  config?: { skipAuth?: boolean }
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {};

  if (!config?.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers,
  });

  const data: any = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.reply ||
      data?.detail ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

/* -------------------------------------------------------------------------- */
/*                                   API                                      */
/* -------------------------------------------------------------------------- */

export const api = {
  /* -------------------- AUTH -------------------- */

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: any }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      { skipAuth: true }
    ),

  register: (payload: { name: string; email: string; password: string }) =>
    request<any>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      { skipAuth: true }
    ),

  me: () => request<any>("/auth/me"),

  /* -------------------- PREDICTION -------------------- */

  predict: (payload: {
    gender: string;
    pregnancies?: number;
    glucose: number;
    bloodPressure: number;
    skinThickness?: number;
    insulin?: number;
    bmi: number;
    diabetesPedigree?: number;
    age: number;
  }) =>
    request<any>("/predict", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  predictionHistory: () => request<any[]>("/predict/history"),

  /* -------------------- WOUND SEGMENTATION -------------------- */

  woundPredict: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return requestFormData<{
  mask: string;
  wound_detected: boolean;
  wound_area_percent: number;
  severity: string;
  recommendation: string;
}>("/wound/predict", formData);
  },

  /* -------------------- DOCTORS -------------------- */

  doctors: (params?: { includeInactive?: boolean }) => {
    const qs = buildQuery({
      includeInactive: params?.includeInactive ? "true" : undefined,
    });
    return request<any[]>(`/doctors${qs}`);
  },

  doctorById: (id: string) => request<any>(`/doctors/${id}`),

  filterDoctors: (params: Record<string, any>) => {
    const qs = buildQuery(params);
    return request<any[]>(`/doctors/filter/search${qs}`);
  },

  /* -------------------- APPOINTMENTS -------------------- */

  myAppointments: () => request<any[]>("/appointments/my"),

  bookAppointment: (payload: {
    doctorId: string;
    appointmentDate: string;
    timeSlot: string;
    reason?: string;
  }) =>
    request<any>("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  cancelAppointment: (id: string) =>
    request<any>(`/appointments/${id}/cancel`, {
      method: "PUT",
    }),

  /* -------------------- CHATBOT -------------------- */

  chatbotMessage: (message: string) =>
    request<{ intent: string; confidence: number; reply: string }>(
      "/chatbot/message",
      {
        method: "POST",
        body: JSON.stringify({ message }),
      }
    ),
};