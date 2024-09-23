import { beforeEach, describe, expect, vi } from "vitest";
import { ReportHeaderOptions, SettingTypeEnum } from "@viewpoint/api";
import { rest } from "msw";
import { server } from "../../../test-utils/mock-server";
import { render } from "../../../test-utils/test-utils";
import {
  ReportHeaderSettingsScreen,
  TestId,
} from "./ReportHeaderSettingsScreen";
import userEvent from "@testing-library/user-event";
import { unstable_useBlocker } from "react-router";

vi.mock("react-router", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  unstable_useBlocker: vi.fn(),
}));

describe("report header settings screen", () => {
  beforeEach(() => {
    vi.mocked(unstable_useBlocker).mockReturnValue({
      state: "unblocked",
    } as any);
  });

  it("allows user to enter header lines when print header option is selected", async () => {
    mockReportSettings();
    const { queryByTestId, findByTestId } = render(
      <ReportHeaderSettingsScreen />
    );

    const toggle = await findByTestId(TestId.PrintHeaderToggle);
    expect(toggle).not.toBeChecked();
    expect(await queryByTestId(TestId.LineOneInput)).not.toBeInTheDocument();
    expect(await queryByTestId(TestId.LineTwoInput)).not.toBeInTheDocument();
    expect(await queryByTestId(TestId.LineThreeInput)).not.toBeInTheDocument();

    mockReportSettings({
      [SettingTypeEnum.PRINT_REPORT_HEADER_OPTION]:
        ReportHeaderOptions.PRINT_HEADER,
    });
    await userEvent.click(toggle);
    expect(await findByTestId(TestId.LineOneInput)).toBeVisible();
    expect(await findByTestId(TestId.LineTwoInput)).toBeVisible();
    expect(await findByTestId(TestId.LineThreeInput)).toBeVisible();
  });

  it("selects 'No header' option from drop down when print report header option is 'NoHeader'", async () => {
    mockReportSettings();
    const { findByTestId } = render(<ReportHeaderSettingsScreen />);
    const dropdown = await findByTestId(TestId.PrintLinesDropdown);
    expect(dropdown).toHaveValue("0");
    expect(dropdown).toHaveTextContent("No header");
  });

  it("uses 'LeaveHeaderSpace' option when number is selected from drop down", async () => {
    const { updateCapture } = mockReportSettings();
    const { findByTestId } = render(<ReportHeaderSettingsScreen />);
    const dropdown = await findByTestId(TestId.PrintLinesDropdown);
    await userEvent.selectOptions(dropdown, "5");

    expect(updateCapture).toHaveBeenCalledWith([
      {
        "@class": "com.idexx.labstation.core.dto.SettingDto",
        settingType: SettingTypeEnum.PRINT_REPORT_HEADER_OPTION,
        settingValue: ReportHeaderOptions.LEAVE_HEADER_SPACE,
      },
      {
        "@class": "com.idexx.labstation.core.dto.SettingDto",
        settingType: SettingTypeEnum.PRINT_LINES_FOR_LETTERHEAD,
        settingValue: "5",
      },
    ]);
  });
});

function mockReportSettings(settings?: { [key in SettingTypeEnum]?: string }) {
  const updateCapture = vi.fn();
  server.use(
    rest.get("**/api/settings", (req, res, context) =>
      res(
        context.json({
          [SettingTypeEnum.PRINT_REPORT_HEADER_OPTION]:
            ReportHeaderOptions.NO_HEADER,
          ...settings,
        })
      )
    ),
    rest.post("**/api/settings", async (req, res, context) => {
      const body = await req.json();
      updateCapture(body);
      return res(context.json({}));
    })
  );
  return { updateCapture };
}
