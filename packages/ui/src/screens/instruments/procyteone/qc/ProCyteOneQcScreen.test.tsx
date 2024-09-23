import { beforeEach, describe, vi } from "vitest";
import { render } from "../../../../../test-utils/test-utils";
import { screen, waitFor, within } from "@testing-library/react";
import { ProCyteOneQcScreen, TestId } from "./ProCyteOneQcScreen";
import userEvent from "@testing-library/user-event";
import { useRunSmartQcMutation } from "../../../../api/QualityControlApi";
import { useNavigate } from "react-router-dom";
import {
  AcadiaQualityControlLotDto,
  InstrumentStatusDto,
  MostRecentResultEnum,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
  randomAcadiaQualityControlLotDto,
} from "@viewpoint/test-utils";
import { server } from "../../../../../test-utils/mock-server";
import dayjs from "dayjs";
import { rest } from "msw";

vi.mock("../../../../api/QualityControlApi", async (actualImport) => {
  const mod = (await actualImport()) as object;
  return {
    ...mod,
    useRunSmartQcMutation: vi.fn(),
  };
});

vi.mock("react-router-dom", async (actualImport) => {
  const mod = (await actualImport()) as object;
  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

describe("ProCyte One QC Screen", () => {
  const runSmartQc = vi.fn();
  const nav = vi.fn();

  beforeEach(() => {
    vi.mocked(useRunSmartQcMutation).mockImplementation(
      () => [runSmartQc] as any
    );

    vi.mocked(useNavigate).mockImplementation(() => nav);
  });

  it("should display lots sorted by run time descending", async () => {
    const instrumentStatus = randomInstrumentStatus({
      instrument: randomInstrumentDto({ id: 7 }),
    });

    const lotsData: AcadiaQualityControlLotDto[] = [
      randomAcadiaQualityControlLotDto({
        lotNumber: "SMARTQC321",
        mostRecentRunDate: dayjs("2023-01-01T05:00:00.000Z").toDate(),
        mostRecentResult: MostRecentResultEnum.PASS,
      }),
      randomAcadiaQualityControlLotDto({
        lotNumber: "SMARTQC234",
        mostRecentRunDate: dayjs("2022-01-01T05:00:00.000Z").toDate(),
        mostRecentResult: MostRecentResultEnum.OUTOFRANGE,
      }),
      randomAcadiaQualityControlLotDto({
        lotNumber: "SMARTQC123",
        mostRecentRunDate: dayjs("2021-01-01T05:00:00.000Z").toDate(),
        mostRecentResult: MostRecentResultEnum.PASS,
      }),
      randomAcadiaQualityControlLotDto({
        lotNumber: "SMARTQC432",
        mostRecentRunDate: dayjs("2020-01-01T05:00:00.000Z").toDate(),
        mostRecentResult: MostRecentResultEnum.PASS,
      }),
      randomAcadiaQualityControlLotDto({
        lotNumber: "SMARTQC555",
        mostRecentRunDate: dayjs("2024-01-01T05:00:00.000Z").toDate(),
        mostRecentResult: MostRecentResultEnum.PASS,
      }),
    ];

    server.use(
      rest.get(
        `*/acadiaQualityControl/${instrumentStatus.instrument.id}/lots`,
        (_req, res, ctx) => res(ctx.json(lotsData))
      )
    );

    render(<ProCyteOneQcScreen instrument={instrumentStatus} />);

    await waitFor(async () => {
      const lotsTable = await screen.getByTestId(TestId.LotsTable);
      const tbody = lotsTable.querySelector("tbody");
      const lotsRows = await within(tbody!).findAllByRole("row");
      expect(lotsRows).toHaveLength(lotsData.length);

      const lotNums = lotsRows.map(
        (row) => row.querySelector("td:first-of-type")?.textContent
      );

      //expect the lots to be sorted by most recent run date desc
      expect(lotNums).toEqual([
        "SMARTQC555",
        "SMARTQC321",
        "SMARTQC234",
        "SMARTQC123",
        "SMARTQC432",
      ]);
    });
  });

  it("should open 'smart qc' dialog when user clicks 'Run QC' button", async () => {
    render(<ProCyteOneQcScreen />);

    const runQcButton = await screen.findByRole("button", {
      name: "Run QC",
    });

    await userEvent.click(runQcButton);

    const modal = await screen.getByTestId(TestId.RunQCModal);

    expect(modal).toHaveTextContent("QC Confirmation");
  });

  describe("Run QC Modal", async () => {
    let modal: HTMLElement;
    let instrument: InstrumentStatusDto;

    beforeEach(async () => {
      instrument = randomInstrumentStatus();

      render(<ProCyteOneQcScreen instrument={instrument} />);

      const runQCButton = await screen.getByRole("button", { name: "Run QC" });

      await userEvent.click(runQCButton);

      modal = await screen.getByTestId(TestId.RunQCModal);
    });

    it("should show a 'Run QC' button", async () => {
      const button = await within(modal).getByRole("button", {
        name: "Run QC",
      });

      expect(button).toBeVisible();
    });

    it("should show a 'Cancel' button", async () => {
      const button = await within(modal).getByRole("button", {
        name: "Run QC",
      });

      expect(button).toBeVisible();
    });

    it("should close when user clicks 'Cancel' button", async () => {
      const cancelButton = await within(modal).getByRole("button", {
        name: "Cancel",
      });

      expect(modal).toBeVisible();

      await userEvent.click(cancelButton);

      expect(modal).not.toBeVisible();
    });

    it("should close when user clicks outside of modal", async () => {
      expect(modal).toBeVisible();

      await userEvent.click(document.querySelector(".spot-modal__overlay")!);

      expect(modal).not.toBeVisible();
    });

    it("should close when user clicks dismiss 'x'", async () => {
      expect(modal).toBeVisible();

      const dismissButton = modal.querySelector("button svg.icon-cancel");

      expect(dismissButton).toBeVisible();

      await userEvent.click(dismissButton!);

      expect(modal).not.toBeVisible();
    });

    it("should trigger smart qc and navigate home if 'Run QC' button is clicked", async () => {
      const runQcButton = await within(modal).getByRole("button", {
        name: "Run QC",
      });

      expect(modal).toBeVisible();

      await userEvent.click(runQcButton);

      expect(runSmartQc).toHaveBeenCalledTimes(1);
      expect(runSmartQc).toBeCalledWith(instrument.instrument.id);

      expect(nav).toHaveBeenCalledTimes(1);
      expect(nav).toHaveBeenCalledWith("/");
    });
  });

  it("should open 'replace qc' dialog when user clicks 'Change QC' button'", async () => {
    render(<ProCyteOneQcScreen />);

    const changeQcButton = await screen.findByRole("button", {
      name: "Change QC",
    });

    await userEvent.click(changeQcButton);

    const modal = await screen.getByTestId(TestId.ChangeQCModal);

    expect(modal).toHaveTextContent("Replace ProCyte One SmartQC Vial");
  });

  describe("Change QC Modal", async () => {
    let modal: HTMLElement;

    beforeEach(async () => {
      render(<ProCyteOneQcScreen />);

      const changeQcButton = await screen.getByRole("button", {
        name: "Change QC",
      });

      await userEvent.click(changeQcButton);

      modal = await screen.getByTestId(TestId.ChangeQCModal);
    });

    it("should show a 'Done' button", async () => {
      await within(modal).getByRole("button", {
        name: "Done",
      });
    });

    it("should close when the 'Done' button is clicked", async () => {
      const doneButton = await within(modal).getByRole("button", {
        name: "Done",
      });

      expect(modal).toBeVisible();

      await userEvent.click(doneButton);

      expect(modal).not.toBeVisible();
    });

    it("should show a 'Cancel' button", async () => {
      await within(modal).getByRole("button", {
        name: "Cancel",
      });
    });

    it("should close when the 'Cancel' button is clicked", async () => {
      const cancelButton = await within(modal).getByRole("button", {
        name: "Cancel",
      });

      expect(modal).toBeVisible();

      await userEvent.click(cancelButton);

      expect(modal).not.toBeVisible();
    });

    it("should close when user clicks outside of modal", async () => {
      expect(modal).toBeVisible();

      await userEvent.click(document.querySelector(".spot-modal__overlay")!);

      expect(modal).not.toBeVisible();
    });

    it("should close when user clicks dismiss 'x'", async () => {
      expect(modal).toBeVisible();

      const dismissButton = modal.querySelector("button svg.icon-cancel");

      expect(dismissButton).toBeVisible();

      await userEvent.click(dismissButton!);

      expect(modal).not.toBeVisible();
    });
  });
});
