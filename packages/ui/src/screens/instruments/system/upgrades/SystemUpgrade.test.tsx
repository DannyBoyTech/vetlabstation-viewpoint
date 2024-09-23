import { beforeEach, describe, expect, vi } from "vitest";
import { UpgradeMedium } from "@viewpoint/api";
import { server } from "../../../../../test-utils/mock-server";
import { rest } from "msw";
import { render } from "../../../../../test-utils/test-utils";
import { SystemUpgrade } from "./SystemUpgrade";
import { findByTestId, queryByTestId } from "@testing-library/react";
import { TestId as SelectorTestId } from "./UpgradeMediumSelector";
import userEvent from "@testing-library/user-event";
import { SmartServiceUpgradeAction } from "../../../../api/UpgradeApi";

vi.mock("./UsbUpgrade", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  UsbUpgrade: () => <div data-testid="mock-usb-upgrade"></div>,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("SystemUpgrade", () => {
  it("shows upgrade medium selector if USB and SmartService upgrades are available. CD Option is not presented/considered.", async () => {
    mockUpgradeMediums([
      UpgradeMedium.USB,
      UpgradeMedium.SMART_SERVICE,
      UpgradeMedium.CD,
    ]);
    const { container } = render(<SystemUpgrade onCancel={() => {}} />);

    expect(
      await findByTestId(container, SelectorTestId.MediumSelector)
    ).toBeVisible();
    expect(
      await findByTestId(
        container,
        SelectorTestId.MediumButton(UpgradeMedium.USB)
      )
    ).toBeVisible();
    expect(
      await findByTestId(
        container,
        SelectorTestId.MediumButton(UpgradeMedium.SMART_SERVICE)
      )
    ).toBeVisible();
    // CD Restore workflows should never be presented/considered when advertised as an option by IVLS (i.e. the PC has a CD drive)
    expect(
      queryByTestId(container, SelectorTestId.MediumButton(UpgradeMedium.CD))
    ).not.toBeInTheDocument();
  });

  it("moves straight to USB upgrade workflow if only USB is available as an upgrade medium. CD Option ignored.", async () => {
    mockUpgradeMediums([UpgradeMedium.USB, UpgradeMedium.CD]);
    const { container } = render(<SystemUpgrade onCancel={() => {}} />);
    // Actual USB upgrade workflow mocked out with this test ID
    expect(await findByTestId(container, "mock-usb-upgrade")).toBeVisible();
  });

  it("initiates a SmartService upgrade if user selects SmartService as an upgrade medium", async () => {
    const upgradeInitiatedCallback = vi.fn();
    server.use(
      rest.post(
        "**/api/upgrade/perform/SmartService/:action",
        (req, res, context) => {
          upgradeInitiatedCallback(req.params["action"]);
          return res(context.json({}));
        }
      )
    );
    mockUpgradeMediums([UpgradeMedium.USB, UpgradeMedium.SMART_SERVICE]);
    const { container } = render(<SystemUpgrade onCancel={() => {}} />);
    await userEvent.click(
      await findByTestId(
        container,
        SelectorTestId.MediumButton(UpgradeMedium.SMART_SERVICE)
      )
    );

    expect(upgradeInitiatedCallback).toHaveBeenCalledWith(
      SmartServiceUpgradeAction.Manual
    );
  });
});

function mockUpgradeMediums(mediums: UpgradeMedium[]) {
  server.use(
    rest.get("**/api/upgrade/upgrade_mediums", (req, res, context) =>
      res(context.json(mediums))
    )
  );
}
