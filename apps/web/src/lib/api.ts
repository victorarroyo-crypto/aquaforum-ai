const API_URL = "https://aquaforum-ai-production.up.railway.app";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export interface ForumConfig {
  topic: string;
  panelists: {
    name: string;
    role: string;
    persona: string;
    color: string;
    avatar_url?: string;
  }[];
  max_rounds: number;
  rules: string[];
}

export interface StartForumResponse {
  session_id: string;
  status: string;
}

export interface SessionState {
  session_id: string;
  topic: string;
  status: string;
  current_round: number;
  max_rounds: number;
  config: ForumConfig;
  messages: ForumMessage[];
}

export interface ForumMessage {
  id: string;
  session_id: string;
  agent_name: string;
  agent_role: string;
  content: string;
  message_type: string;
  round_number: number;
  turn_number: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const api = {
  startForum: (config: ForumConfig) =>
    request<StartForumResponse>("/forum/start", {
      method: "POST",
      body: JSON.stringify(config),
    }),

  nextCycle: (sessionId: string) =>
    request<{ status: string; cycle: number }>(`/forum/${sessionId}/next-cycle`, {
      method: "POST",
    }),

  stopForum: (sessionId: string) =>
    request<{ status: string }>(`/forum/${sessionId}/stop`, {
      method: "POST",
    }),

  getState: (sessionId: string) =>
    request<SessionState>(`/forum/${sessionId}/state`),

  exportForum: (sessionId: string) =>
    request<{ report_id: string; content: string }>(`/forum/${sessionId}/export`, {
      method: "POST",
    }),
};
// build trigger 1774214774
// 1774216809
