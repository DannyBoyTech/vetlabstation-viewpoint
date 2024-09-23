import { describe, test, expect, vi } from "vitest";
import {
  SnapSettingsScreen,
  supportedReminderThreshold,
} from "./SnapSettingsScreen";
import { render } from "../../../../test-utils/test-utils";
import { useNavigate } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { SettingDto, SettingTypeEnum } from "@viewpoint/api";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";
import { waitFor } from "@testing-library/react";

vi.mock("react-router-dom", async (actualImport) => {
  const origModule = (await actualImport()) as object;
  return {
    ...origModule,
    useNavigate: vi.fn(),
  };
});

describe("SnapSettingsScreen", () => {
  const nav = vi.fn();

  const INITIAL_SETTINGS = {
    [SettingTypeEnum.SNAP_ENABLETIMER]: "true",
    [SettingTypeEnum.ALERT_WARNING_DURATION]: "10",
    [SettingTypeEnum.SNAP_COMPLETIONBEEP]: "false",
  };

  let settings: { [key in SettingTypeEnum]?: string } = {
    ...INITIAL_SETTINGS,
  };

  beforeEach(() => {
    vi.mocked(useNavigate).mockImplementation(() => nav);

    settings = { ...INITIAL_SETTINGS };

    server.use(
      rest.get("**/api/settings", (_req, res, context) =>
        res(context.json(settings))
      )
    );

    server.use(
      rest.post("**/api/settings", async (req, res, context) => {
        const body: SettingDto[] = await req.json();
        body.forEach(({ settingType, settingValue }) => {
          settings[settingType] = settingValue;
        });
        return res(context.json(settings));
      })
    );
  });

  describe("supportedReminderThreshold", () => {
    test.each([
      { input: undefined, expected: 10 },
      { input: -2, expected: 10 },
      { input: 0, expected: 0 },
      { input: 1, expected: 5 },
      { input: 2, expected: 5 },
      { input: 3, expected: 5 },
      { input: 5, expected: 5 },
      { input: 7, expected: 10 },
      { input: 10, expected: 10 },
      { input: 13, expected: 20 },
      { input: 17, expected: 20 },
      { input: 19, expected: 20 },
      { input: 20, expected: 20 },
      { input: 23, expected: 30 },
      { input: 29, expected: 30 },
      { input: 31, expected: 40 },
      { input: 37, expected: 40 },
      { input: 40, expected: 40 },
      { input: 41, expected: 50 },
      { input: 43, expected: 50 },
      { input: 47, expected: 50 },
      { input: 50, expected: 50 },
      { input: 53, expected: 60 },
      { input: 59, expected: 60 },
      { input: 60, expected: 60 },
      { input: 61, expected: 10 },
    ])(
      "supportedRemdinderThreshold($input) -> $expected",
      ({ input, expected }) => {
        expect(supportedReminderThreshold(input)).toBe(expected);
      }
    );
  });

  it("should render initial timer enable correctly", async () => {
    const container = render(<SnapSettingsScreen />);
    const timerEnableToggle = container.getByLabelText("Enable SNAP Timer");

    await waitFor(async () => {
      expect(timerEnableToggle).toBeDefined();
      expect(timerEnableToggle).toBeEnabled();
      expect(timerEnableToggle).toBeChecked();
    });
  });

  it("should render initial reminder threshold correctly", async () => {
    const container = render(<SnapSettingsScreen />);
    const reminderThreshold = container.getByLabelText("SNAP Reminder");

    await waitFor(async () => {
      expect(reminderThreshold).toBeDefined();
      expect(reminderThreshold).toBeEnabled();
      expect(reminderThreshold).toHaveValue("10");
    });
  });

  it("should render initial beep enable correctly", async () => {
    const container = render(<SnapSettingsScreen />);
    const beepEnableToggle = container.getByLabelText(
      "Beep when SNAP test completes"
    );

    await waitFor(async () => {
      expect(beepEnableToggle).toBeDefined();
      expect(beepEnableToggle).toBeEnabled();
      expect(beepEnableToggle).not.toBeChecked();
    });
  });

  it("should disable reminder and beep controls when timer disabled", async () => {
    const container = render(<SnapSettingsScreen />);

    const timerEnableToggle = container.getByLabelText("Enable SNAP Timer");
    const reminderThreshold = container.getByLabelText("SNAP Reminder");
    const beepEnableToggle = container.getByLabelText(
      "Beep when SNAP test completes"
    );

    await waitFor(async () => {
      expect(timerEnableToggle).toBeDefined();
      expect(timerEnableToggle).toBeEnabled();
      expect(timerEnableToggle).toBeChecked();

      expect(reminderThreshold).toBeDefined();
      expect(reminderThreshold).toBeEnabled();

      expect(beepEnableToggle).toBeDefined();
      expect(beepEnableToggle).toBeEnabled();
    });

    await userEvent.click(timerEnableToggle);

    await waitFor(async () => {
      expect(timerEnableToggle).not.toBeChecked();
      expect(reminderThreshold).not.toBeEnabled();
      expect(beepEnableToggle).not.toBeEnabled();
    });
  });

  it("should enable reminder and beep controls when timer enabled", async () => {
    const container = render(<SnapSettingsScreen />);

    const timerEnableToggle = container.getByLabelText("Enable SNAP Timer");
    const reminderThreshold = container.getByLabelText("SNAP Reminder");
    const beepEnableToggle = container.getByLabelText(
      "Beep when SNAP test completes"
    );

    await waitFor(async () => {
      expect(timerEnableToggle).toBeDefined();
      expect(timerEnableToggle).toBeEnabled();
      expect(timerEnableToggle).toBeChecked();

      expect(reminderThreshold).toBeDefined();
      expect(reminderThreshold).toBeEnabled();

      expect(beepEnableToggle).toBeDefined();
      expect(beepEnableToggle).toBeEnabled();
    });

    await userEvent.click(timerEnableToggle);

    await waitFor(async () => {
      expect(timerEnableToggle).not.toBeChecked();
      expect(reminderThreshold).not.toBeEnabled();
      expect(beepEnableToggle).not.toBeEnabled();
    });

    await userEvent.click(timerEnableToggle);

    await waitFor(async () => {
      expect(timerEnableToggle).toBeChecked();
      expect(reminderThreshold).toBeEnabled();
      expect(beepEnableToggle).toBeEnabled();
    });
  });

  it("should update reminder threshold when changed", async () => {
    const container = render(<SnapSettingsScreen />);

    const timerEnableToggle = container.getByLabelText("Enable SNAP Timer");
    const reminderThreshold = container.getByLabelText("SNAP Reminder");

    await waitFor(async () => {
      expect(timerEnableToggle).toBeDefined();
      expect(timerEnableToggle).toBeEnabled();
      expect(timerEnableToggle).toBeChecked();

      expect(reminderThreshold).toBeDefined();
      expect(reminderThreshold).toBeEnabled();
      expect(reminderThreshold).toHaveValue("10");
    });

    await userEvent.selectOptions(reminderThreshold, "30");

    await waitFor(async () => {
      expect(reminderThreshold).toHaveValue("30");
    });

    await userEvent.selectOptions(reminderThreshold, "50");

    await waitFor(async () => {
      expect(reminderThreshold).toHaveValue("50");
    });
  });

  it("should mutate beep enable when clicked", async () => {
    const container = render(<SnapSettingsScreen />);

    const timerEnableToggle = container.getByLabelText("Enable SNAP Timer");
    const beepEnableToggle = container.getByLabelText(
      "Beep when SNAP test completes"
    );

    await waitFor(async () => {
      expect(timerEnableToggle).toBeDefined();
      expect(timerEnableToggle).toBeEnabled();
      expect(timerEnableToggle).toBeChecked();

      expect(beepEnableToggle).toBeDefined();
      expect(beepEnableToggle).toBeEnabled();
      expect(beepEnableToggle).not.toBeChecked();
    });

    await userEvent.click(beepEnableToggle);

    await waitFor(async () => {
      expect(beepEnableToggle).toBeChecked();
    });

    await userEvent.click(beepEnableToggle);

    await waitFor(async () => {
      expect(beepEnableToggle).not.toBeChecked();
    });
  });

  it("should navigate back when requested", async () => {
    const container = render(<SnapSettingsScreen />);

    const backButton = container.getByRole("button", { name: "Back" });

    expect(backButton).toBeDefined();

    await userEvent.click(backButton);

    expect(nav).toHaveBeenCalledWith(-1);
  });
});
