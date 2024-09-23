import { beforeEach, describe } from "vitest";
import { InstrumentType, SettingDto, SettingTypeEnum } from "@viewpoint/api";
import { SediVueDxSettingsScreen, TestId } from "./SediVueDxSettingsScreen";
import { rest } from "msw";
import { server } from "../../../../test-utils/mock-server";
import { render } from "../../../../test-utils/test-utils";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { findByTestId, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("SediVueDxSettingsScreen", () => {
  const cases = [
    [SettingTypeEnum.MANUAL_UA_AUTO_ADD, TestId.AutoAddUaToggle],
    [SettingTypeEnum.URISED_INCLUDE_IMAGE_ON_REPORT, TestId.IncludeImageToggle],
    [
      SettingTypeEnum.URISED_ONLY_IF_SEDIMENT_PRESENT,
      TestId.OnlyIfSedimentCheckbox,
    ],
  ];

  it.each(cases)(
    "updates toggle/checkbox for setting %0",
    async (settingType, testId) => {
      // Initial value is true
      const { container } = render(<SediVueDxSettingsScreen />);
      const control = await findByTestId(container, testId);
      await waitFor(() => expect(control).toBeChecked());
      await userEvent.click(control);
      await waitFor(() => expect(control).not.toBeChecked());
    }
  );

  it("hides sediment present checkbox if auto-include images toggle is disabled", async () => {
    const { container } = render(<SediVueDxSettingsScreen />);
    // Verify checkbox is visible
    const checkbox = await findByTestId(
      container,
      TestId.OnlyIfSedimentCheckbox
    );
    expect(checkbox).toBeVisible();
    // Disable auto-include images
    await userEvent.click(
      await findByTestId(container, TestId.IncludeImageToggle)
    );
    // Verify checkbox is no longer in the DOM
    await waitFor(() => expect(checkbox).not.toBeInTheDocument());
  });
});

const DefaultSettings = {
  [SettingTypeEnum.MANUAL_UA_AUTO_ADD]: "true",
  [SettingTypeEnum.URISED_INCLUDE_IMAGE_ON_REPORT]: "true",
  [SettingTypeEnum.URISED_ONLY_IF_SEDIMENT_PRESENT]: "true",
};

let GlobalSettings: { [key in SettingTypeEnum]?: string } = {
  ...DefaultSettings,
};

beforeEach(() => {
  GlobalSettings = { ...DefaultSettings };
  server.use(
    rest.get("**/api/settings", (req, res, context) =>
      res(context.json(GlobalSettings))
    )
  );
  server.use(
    rest.post("**/api/settings", async (req, res, context) => {
      const body: SettingDto[] = await req.json();
      body.forEach(({ settingType, settingValue }) => {
        GlobalSettings[settingType] = settingValue;
      });
      return res(context.json(GlobalSettings));
    })
  );
});
