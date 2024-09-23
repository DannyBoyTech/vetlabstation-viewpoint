import { describe, expect, vi } from "vitest";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { render } from "../../../../test-utils/test-utils";
import {
  CatOneInstrumentScreen,
  shutdownDisabled,
} from "./CatOneInstrumentsScreen";
import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/react";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";

describe("Catalyst One instruments screen", () => {
  it("allows upgrading via 'Upgrade Now' button", async () => {
    const upgradeMock = vi.fn();
    server.use(
      rest.post("**/api/instruments/*/upgrade", (req, res, context) => {
        upgradeMock(req.url.searchParams.get("version"));
        return res(context.json({}));
      })
    );

    const status = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Ready,
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
        instrumentStringProperties: { upgrade: "1.2.3" },
      }),
    });

    const { getByRole, getByTestId } = render(
      <CatOneInstrumentScreen instrument={status} />
    );

    const upgradeButton = getByRole("button", { name: "Upgrade Now" });
    expect(upgradeButton).toBeVisible();
    expect(upgradeButton).toBeEnabled();

    await userEvent.click(upgradeButton);

    expect(upgradeMock).not.toHaveBeenCalled();
    const confirmModal = getByTestId("confirm-modal");
    const confirmUpgradeButton = within(confirmModal).getByRole("button", {
      name: "Upgrade Now",
    });
    await userEvent.click(confirmUpgradeButton);

    expect(upgradeMock).toHaveBeenCalledWith("1.2.3");
  });

  it("does not show the 'upgrade now' button when there is no upgrade available", async () => {
    const status = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Ready,
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
        instrumentStringProperties: {},
      }),
    });

    const { queryByRole } = render(
      <CatOneInstrumentScreen instrument={status} />
    );

    const upgradeButton = queryByRole("button", { name: "Upgrade Now" });
    expect(upgradeButton).not.toBeInTheDocument();
  });

  it("does not show the 'upgrade now' button when the instrument is not connected", async () => {
    const status = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Offline,
      connected: false,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
        instrumentStringProperties: { upgrade: "1.2.3" },
      }),
    });

    const { queryByRole } = render(
      <CatOneInstrumentScreen instrument={status} />
    );

    const upgradeButton = queryByRole("button", { name: "Upgrade Now" });
    expect(upgradeButton).not.toBeInTheDocument();
  });
});

describe("shutdownDisabled", () => {
  test.each([
    { status: InstrumentStatus.Alert, expected: false },
    { status: InstrumentStatus.Busy, expected: true },
    { status: InstrumentStatus.Not_Ready, expected: false },
    { status: InstrumentStatus.Offline, expected: true },
    { status: InstrumentStatus.Ready, expected: false },
    { status: InstrumentStatus.Sleep, expected: false },
    { status: InstrumentStatus.Standby, expected: true },
  ])(
    "shutdownDisabled(status: $status) should return $expected ",
    ({ status, expected }) => {
      expect(shutdownDisabled(status)).toBe(expected);
    }
  );
});
