export type ScenarioStatus = "draft" | "ready";

type Timestamp = string;

export interface Objectif {
  id: number;
  label: string;
  description?: string | null;
}

export interface Cible {
  id: number;
  label: string;
  persona?: string | null;
  segment?: string | null;
  maturite?: "awareness" | "consideration" | "decision" | null;
}

export interface Article {
  id: number;
  nom: string;
  resume?: string | null;
}

export interface PlanItem {
  id: number;
  format: string;
  message: string;
  canal: string;
  frequence?: string | null;
  kpi?: string | null;
}

export interface Plan {
  id: number;
  resume?: string | null;
  generated_at: Timestamp;
  items: PlanItem[];
  articles: Article[];
}

export interface ScenarioSummary {
  id: number;
  nom: string;
  thematique: string;
  description?: string | null;
  statut: ScenarioStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Configuration {
  id: number;
  scenario_id: number;
  nom: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ConfigurationDetail extends Configuration {
  objectifs: Objectif[];
  cibles: Cible[];
  plans: Plan[];
}

export interface ScenarioDetail extends ScenarioSummary {
  configurations: ConfigurationDetail[];
}

export interface ChatMessage {
  id?: string;
  author: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  scenarioId?: number;
}

export interface ChatAction {
  label: string;
  action: string;
  payload?: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  actions: ChatAction[];
  scenario?: ScenarioDetail | null;
}
