import { beforeEach, describe } from "vitest";
import {
  TimeConfigurationDto,
  TimeZoneMigrationTypeEnum,
} from "@viewpoint/api";
import dayjs from "dayjs";
import { server } from "../../../test-utils/mock-server";
import { rest } from "msw";
import { render } from "../../../test-utils/test-utils";
import { SettingsScreen, TestId } from "./SettingsScreen";
import ViewpointSettingsProvider from "./SettingsScreenContext";
import userEvent from "@testing-library/user-event";
import { TestId as TimeDateTestId } from "./TimeAndDateSettings";
import { useNavigate } from "react-router-dom";
import { waitFor, within } from "@testing-library/react";
import { SettingsCategory } from "./common-settings-components";

describe("settings screen", () => {
  describe("time and date", () => {
    function TimeDateTestBed() {
      const nav = useNavigate();
      return (
        <ViewpointSettingsProvider>
          <button data-testid="nav-button" onClick={() => nav("/")}></button>
          <SettingsScreen settingsSection={SettingsCategory.TIME_DATE} />
        </ViewpointSettingsProvider>
      );
    }

    let CurrentTimeConfig: TimeConfigurationDto;
    beforeEach(() => {
      mockTimeConfig();
      CurrentTimeConfig = {
        timeZoneId: "America/New_York",
        dstEnabled: true,
        migrationType: TimeZoneMigrationTypeEnum.NONE,
        localDateTime: dayjs()
          .format("YYYY-M-D-H-m-s-SSS")
          .split("-")
          .map(Number),
      };
    });
    it("prompts the user to restart when navigating away if changes have been made to the time configuration", async () => {
      const { findByTestId, rerender } = render(<TimeDateTestBed />);

      // Verify DST is turned on
      const dstToggle = await findByTestId(TimeDateTestId.toggleDsT);
      await waitFor(() => expect(dstToggle).toBeChecked());

      // Turn off DST
      await userEvent.click(dstToggle);

      // Nav away
      await userEvent.click(await findByTestId("nav-button"));

      // Verify the modal pops up
      const restartModal = await findByTestId(TestId.settingsRestartModal);
      expect(restartModal).toBeVisible();

      // Flush the changes
      await userEvent.click(
        await within(restartModal).findByTestId("done-button")
      );

      // Go back to the page and verify it's been updated
      rerender(<TimeDateTestBed />);
      const updatedDstToggle = await findByTestId(TimeDateTestId.toggleDsT);
      await waitFor(() => expect(updatedDstToggle).not.toBeChecked());
    });

    function mockTimeConfig() {
      server.use(
        rest.get("**/api/timeZone", (req, res, context) =>
          res(context.json(CurrentTimeConfig))
        ),
        rest.post("**/api/timeZone", async (req, res, context) => {
          const updatedConfig: TimeConfigurationDto = await req.json();
          CurrentTimeConfig = { ...CurrentTimeConfig, ...updatedConfig };
          return res(context.json(CurrentTimeConfig));
        })
      );
    }
  });
});
