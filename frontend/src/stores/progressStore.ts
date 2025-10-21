import { createStore } from "solid-js/store";

interface ProgressState {
  currentStep: number; // 0: config, 1: objectifs, 2: cibles, 3: plan
  configCompleted: boolean;
  objectifsCount: number;
  ciblesCount: number;
  planGenerated: boolean;
}

const [state, setState] = createStore<ProgressState>({
  currentStep: 0,
  configCompleted: false,
  objectifsCount: 0,
  ciblesCount: 0,
  planGenerated: false
});

export const progressStore = {
  get state() {
    return state;
  },

  setStep(step: number) {
    setState("currentStep", step);
  },

  setConfigCompleted(completed: boolean) {
    setState("configCompleted", completed);
    if (completed && state.currentStep < 1) {
      setState("currentStep", 1);
    }
  },

  setObjectifsCount(count: number) {
    setState("objectifsCount", count);
  },

  setCiblesCount(count: number) {
    setState("ciblesCount", count);
  },

  setPlanGenerated(generated: boolean) {
    setState("planGenerated", generated);
    if (generated) {
      setState("currentStep", 3);
    }
  },

  reset() {
    setState({
      currentStep: 0,
      configCompleted: false,
      objectifsCount: 0,
      ciblesCount: 0,
      planGenerated: false
    });
  }
};
