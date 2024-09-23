import { useNavigate } from "react-router-dom";
import { describe, it } from "vitest";
import { vi } from "vitest";
import { TestId, UAAnalyzerSettingsScreen } from "./UAAnalyzerSettingsScreen";
import { render } from "../../../../test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { server } from "../../../../test-utils/mock-server";
import { waitFor } from "@testing-library/react";

vi.mock("react-router-dom", async (origImport) => ({
  ...((await origImport()) as any),
  useNavigate: vi.fn(),
}));

describe("UA Analyzer Settings screen", () => {
  const nav = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockImplementation(() => nav);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("should fire navigation back when 'back' button is clicked", async () => {
    const screen = render(<UAAnalyzerSettingsScreen />);

    const backButton = await screen.getByTestId(TestId.BackButton);

    await userEvent.click(backButton);

    expect(nav).toHaveBeenCalledTimes(1);
    expect(nav).toHaveBeenCalledWith(-1);
  });

  it("should display auto-add manual UA as checked when setting is enabled", async () => {
    server.use(
      rest.get("*/api/settings", (_req, res, ctx) => {
        return res(
          ctx.json({
            MANUAL_UA_AUTO_ADD: "true",
          })
        );
      })
    );

    const screen = render(<UAAnalyzerSettingsScreen />);

    await waitFor(async () => {
      const toggle = await screen.getByTestId(TestId.AutoAddManualUAToggle);

      expect(toggle).toBeChecked();
    });
  });

  it("should display auto-add manual UA as unchecked when setting is disabled", async () => {
    server.use(
      rest.get("*/api/settings", (_req, res, ctx) => {
        return res(
          ctx.json({
            MANUAL_UA_AUTO_ADD: "false",
          })
        );
      })
    );

    const screen = render(<UAAnalyzerSettingsScreen />);

    await waitFor(async () => {
      const toggle = await screen.getByTestId(TestId.AutoAddManualUAToggle);

      expect(toggle).not.toBeChecked();
    });
  });

  it("should disable auto-add manual UA while current state is loading", async () => {
    server.use(
      rest.get("*/api/settings", (_req, res, ctx) => {
        return res(ctx.delay("infinite"));
      })
    );

    const screen = render(<UAAnalyzerSettingsScreen />);

    const toggle = await screen.getByTestId(TestId.AutoAddManualUAToggle);

    expect(toggle).toBeDisabled();
  });

  it("should disable auto-add manual UA toggle while update is in progress", async () => {
    server.use(
      rest.get("*/api/settings", (_req, res, ctx) => {
        return res(
          ctx.json({
            MANUAL_UA_AUTO_ADD: "true",
          })
        );
      })
    );

    server.use(
      rest.post("*/api/settings", (_req, res, ctx) => {
        return res(ctx.delay("infinite"));
      })
    );

    const screen = render(<UAAnalyzerSettingsScreen />);

    await waitFor(async () => {
      const toggle = await screen.getByTestId(TestId.AutoAddManualUAToggle);

      expect(toggle).toBeEnabled();
    });

    const toggle = await screen.getByTestId(TestId.AutoAddManualUAToggle);

    expect(toggle).toBeEnabled();

    await userEvent.click(toggle);

    expect(toggle).toBeDisabled();
  });
});
