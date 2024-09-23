import { describe, expect, vi } from "vitest";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { render } from "../../../../test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/react";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";
import { SediVueDxInstrumentScreen } from "./SediVueDxInstrumentScreen";

vi.mock("../../../context/EventSourceContext");

describe("SediVue Dx instruments screen", () => {
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
        instrumentType: InstrumentType.SediVueDx,
        instrumentStringProperties: { upgrade: "1.2.3" },
      }),
    });

    const { getByRole, getByTestId } = render(
      <SediVueDxInstrumentScreen instrumentStatus={status} />
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
        instrumentType: InstrumentType.SediVueDx,
        instrumentStringProperties: {},
      }),
    });

    const { queryByRole } = render(
      <SediVueDxInstrumentScreen instrumentStatus={status} />
    );

    const upgradeButton = queryByRole("button", { name: "Upgrade Now" });
    expect(upgradeButton).not.toBeInTheDocument();
  });

  it("does not show the 'upgrade now' button when the instrument is not connected", async () => {
    const status = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Offline,
      connected: false,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
        instrumentStringProperties: { upgrade: "1.2.3" },
      }),
    });

    const { queryByRole } = render(
      <SediVueDxInstrumentScreen instrumentStatus={status} />
    );

    const upgradeButton = queryByRole("button", { name: "Upgrade Now" });
    expect(upgradeButton).not.toBeInTheDocument();
  });
});
