import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders headline", () => {
    const { getByText } = render(() => <App />);
    expect(getByText(/Assistant IA/i)).toBeInTheDocument();
  });
});
