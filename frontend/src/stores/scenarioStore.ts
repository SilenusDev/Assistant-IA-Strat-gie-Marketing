import { createResource, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import {
  createScenario as createScenarioApi,
  fetchScenarioDetail,
  listScenarios
} from "../api/client";
import type { ScenarioDetail, ScenarioSummary } from "../types";

interface ScenarioStoreState {
  scenarios: ScenarioSummary[];
  selectedScenario: ScenarioDetail | null;
  loading: boolean;
  error: string | null;
}

const [state, setState] = createStore<ScenarioStoreState>({
  scenarios: [],
  selectedScenario: null,
  loading: false,
  error: null
});

const [reloadCounter, setReloadCounter] = createSignal(0);

const [scenarios] = createResource(reloadCounter, async () => {
  setState({ loading: true, error: null });
  try {
    const data = await listScenarios();
    setState({ scenarios: data, loading: false });
    return data;
  } catch (error) {
    setState({ error: (error as Error).message, loading: false });
    return [];
  }
});

async function selectScenario(id: number) {
  setState({ loading: true, error: null });
  try {
    const detail = await fetchScenarioDetail(id);
    setState({ selectedScenario: detail, loading: false });
  } catch (error) {
    setState({ error: (error as Error).message, loading: false });
  }
}

function setSelectedScenario(detail: ScenarioDetail | null) {
  setState({ selectedScenario: detail });
}

function refreshScenarios() {
  setReloadCounter((value) => value + 1);
}

async function createScenario(payload: {
  nom: string;
  thematique: string;
  description?: string | null;
}) {
  setState({ loading: true, error: null });
  try {
    const created = await createScenarioApi(payload);
    refreshScenarios();
    await selectScenario(created.id);
    setState({ loading: false });
  } catch (error) {
    setState({ error: (error as Error).message, loading: false });
    throw error;
  }
}

export const scenarioStore = {
  state,
  scenarios,
  createScenario,
  selectScenario,
  setSelectedScenario,
  refreshScenarios
};
