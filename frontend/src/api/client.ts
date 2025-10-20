import type {
  ChatResponse,
  ScenarioDetail,
  ScenarioSummary
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { error?: string }).error ?? response.statusText;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function listScenarios(): Promise<ScenarioSummary[]> {
  return request<ScenarioSummary[]>("/api/scenarios");
}

export function createScenario(
  payload: Pick<ScenarioDetail, "nom" | "thematique" | "description">
): Promise<ScenarioSummary> {
  return request<ScenarioSummary>("/api/scenarios", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchScenarioDetail(id: number): Promise<ScenarioDetail> {
  return request<ScenarioDetail>(`/api/scenarios/${id}`);
}

export function sendChatMessage(
  payload: Record<string, unknown>
): Promise<ChatResponse> {
  return request<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function generatePlan(scenarioId: number): Promise<{ success: boolean; plan: any; error?: string }> {
  return request(`/api/scenarios/${scenarioId}/plan`, {
    method: "POST"
  });
}

export function addObjectif(scenarioId: number, payload: { label: string; description?: string }): Promise<any> {
  return request(`/api/scenarios/${scenarioId}/objectifs`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function addCible(scenarioId: number, payload: { label: string; persona?: string; segment?: string }): Promise<any> {
  return request(`/api/scenarios/${scenarioId}/cibles`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function addRessource(scenarioId: number, payload: { type: string; titre: string; url?: string; note?: string }): Promise<any> {
  return request(`/api/scenarios/${scenarioId}/ressources`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function exportJSON(scenarioId: number): Promise<Blob> {
  return fetch(`${API_BASE}/api/scenarios/${scenarioId}/export/json`)
    .then(res => {
      if (!res.ok) throw new Error("Export failed");
      return res.blob();
    });
}

export function exportCSV(scenarioId: number): Promise<Blob> {
  return fetch(`${API_BASE}/api/scenarios/${scenarioId}/export/csv`)
    .then(res => {
      if (!res.ok) throw new Error("Export failed");
      return res.blob();
    });
}
