import { vi } from "vitest";
import {
  useGetSnapStatusesQuery,
  useStopWaitingMutation,
  useSuppressMutation,
} from "../../../api/InstrumentApi";
import dayjs from "dayjs";
import { InstrumentStatus } from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomSnapProInstrumentStatus,
  randomFrom,
} from "@viewpoint/test-utils";
import { SnapProInstrumentScreen, TestId } from "./SnapProInstrumentScreen";
import userEvent from "@testing-library/user-event";
import { render } from "../../../../test-utils/test-utils";
import { TestId as CancelProcessButtonTestId } from "../common/CancelProcessButton";
import { waitFor, within } from "@testing-library/react";

vi.mock("../../../api/InstrumentApi", async (origImport) => ({
  ...((await origImport()) as any),
  useGetSnapStatusesQuery: vi.fn(),
  useSuppressMutation: vi.fn(),
  useStopWaitingMutation: vi.fn(),
}));

const SNAP_STATUSES = [
  randomSnapProInstrumentStatus({
    instrument: randomInstrumentDto({ id: 1 }),
    connected: false,
    instrumentStatus: InstrumentStatus.Standby,
    lastConnectedDate: dayjs("2023-05-02T12:00:00.000Z").valueOf(),
  }),
  randomSnapProInstrumentStatus({
    instrument: randomInstrumentDto({ id: 3 }),
    connected: false,
    instrumentStatus: InstrumentStatus.Standby,
    lastConnectedDate: dayjs("2023-05-04T12:00:00.000Z").valueOf(),
  }),
  randomSnapProInstrumentStatus({
    instrument: randomInstrumentDto({ id: 0 }),
    connected: true,
    instrumentStatus: InstrumentStatus.Ready,
    lastConnectedDate: dayjs("2023-05-01T12:00:00.000Z").valueOf(),
  }),
  randomSnapProInstrumentStatus({
    instrument: randomInstrumentDto({ id: 2 }),
    connected: true,
    instrumentStatus: InstrumentStatus.Ready,
    lastConnectedDate: dayjs("2023-05-03T12:00:00.000Z").valueOf(),
  }),
  randomSnapProInstrumentStatus({
    instrument: randomInstrumentDto({ id: 4 }),
    connected: false,
    instrumentStatus: InstrumentStatus.Ready,
    lastConnectedDate: dayjs("2023-05-04T12:00:00.000Z").valueOf(),
  }),
];

describe("SNAPPro instrument screen", () => {
  const suppress = vi.fn();
  const refetch = vi.fn();
  const stopWaiting = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(useGetSnapStatusesQuery).mockImplementation(() => ({
      currentData: SNAP_STATUSES,
      isFetching: false,
      refetch,
    }));
    vi.mocked(useSuppressMutation).mockImplementation(() => [suppress] as any);
    vi.mocked(useStopWaitingMutation).mockImplementation(
      () => [stopWaiting] as any
    );
  });

  it("should display a card for each instrument status", () => {
    const screen = render(<SnapProInstrumentScreen />);

    SNAP_STATUSES.forEach((status) => {
      screen.getByTestId(TestId.Instrument(status.instrument.id));
    });
  });

  it("should sort instrument cards by last connected date, most recent last", () => {
    const screen = render(<SnapProInstrumentScreen />);

    const cards = screen.getAllByRole("listitem");

    //this check relies on curated test data ordering
    for (let i = 0; i < SNAP_STATUSES.length; i++) {
      expect(cards[i]).toHaveAttribute("data-testid", TestId.Instrument(i));
    }
  });

  it("should allow selecting a single card at a time", async () => {
    const screen = render(<SnapProInstrumentScreen />);

    const cards = screen.getAllByRole("listitem");

    for (const card of cards) {
      expect(card).not.toHaveClass("selected");
      await userEvent.click(card);
      expect(card).toHaveClass("selected");
      expect(
        cards.filter((it) => it.classList.contains("selected"))
      ).toHaveLength(1);
    }
  });

  it("should allow deselecting a selected card", async () => {
    const screen = render(<SnapProInstrumentScreen />);

    const cards = screen.getAllByRole("listitem");

    const card = randomFrom(cards);

    expect(card).not.toHaveClass("selected");
    await userEvent.click(card);

    expect(card).toHaveClass("selected");

    await userEvent.click(card);
    expect(card).not.toHaveClass("selected");
  });

  it("should enable 'remove instrument' if selected instrument is in 'standby'", async () => {
    const screen = render(<SnapProInstrumentScreen />);

    const standbySnap = SNAP_STATUSES.find(
      (it) => it.instrumentStatus === InstrumentStatus.Standby
    );
    expect(standbySnap).toBeDefined();

    const standbySnapTestId = TestId.Instrument(standbySnap!.instrument.id!);

    const standbyCard = screen.getByTestId(standbySnapTestId);

    const readySnap = SNAP_STATUSES.find(
      (it) => it.instrumentStatus === InstrumentStatus.Ready
    );
    expect(readySnap).toBeDefined();

    const readySnapTestId = TestId.Instrument(readySnap!.instrument.id!);

    const readyCard = screen.getByTestId(readySnapTestId);

    const removeInstrumentButton = screen.getByTestId(
      TestId.RemoveInstrumentButton
    );

    const cards = screen.getAllByRole("listitem");

    //ensure no cards are initially selected
    expect(
      cards.filter((it) => it.classList.contains("selected"))
    ).toHaveLength(0);

    //remove instrument should be initially disabled
    expect(removeInstrumentButton).toBeDisabled();

    //click on ready card, ensure remove instrument still disabled
    await userEvent.click(readyCard);
    expect(removeInstrumentButton).toBeDisabled();

    //click on standby card, ensure remove instrument is enabled
    await userEvent.click(standbyCard);
    expect(removeInstrumentButton).toBeEnabled();

    //unselect standby card, ensure remove instrument is disabled
    await userEvent.click(standbyCard);
    expect(removeInstrumentButton).toBeDisabled();
  });

  it("should remove instrument if 'remove instrument' is clicked", async () => {
    const screen = render(<SnapProInstrumentScreen />);

    const standbySnap = SNAP_STATUSES.find(
      (it) => it.instrumentStatus === InstrumentStatus.Standby
    );
    expect(standbySnap).toBeDefined();

    const standbySnapTestId = TestId.Instrument(standbySnap!.instrument.id!);

    const standbyCard = screen.getByTestId(standbySnapTestId);

    await userEvent.click(standbyCard);

    const removeInstrumentButton = screen.getByTestId(
      TestId.RemoveInstrumentButton
    );

    expect(removeInstrumentButton).toBeEnabled();

    await userEvent.click(removeInstrumentButton);

    expect(suppress).toHaveBeenCalledTimes(1);
    expect(suppress).toHaveBeenCalledWith({
      instrumentId: standbySnap?.instrument.id,
    });
  });

  it("should disable 'Cancel Process' button if no instrument selected", async () => {
    const screen = render(<SnapProInstrumentScreen />);

    const instrumentCardIds = SNAP_STATUSES.map((it) =>
      TestId.Instrument(it.instrument.id)
    );

    for (const instrumentCardId of instrumentCardIds) {
      const instrumentCard = screen.getByTestId(instrumentCardId);
      expect(instrumentCard).not.toHaveClass("selected");
    }

    const cancelProcessButton = screen.getByTestId(TestId.CancelProcessButton);

    expect(cancelProcessButton).toBeDisabled();
  });

  it("should enable 'Cancel Process' button if selected instrument is connected", async () => {
    const screen = render(<SnapProInstrumentScreen />);

    const instrumentCardIds = SNAP_STATUSES.map((it) =>
      TestId.Instrument(it.instrument.id)
    );

    for (const instrumentCardId of instrumentCardIds) {
      const instrumentCard = screen.getByTestId(instrumentCardId);
      expect(instrumentCard).not.toHaveClass("selected");
    }

    const connectedInstrumentCard = screen.getByTestId(
      TestId.Instrument(SNAP_STATUSES[3].instrument.id)
    );

    await userEvent.click(connectedInstrumentCard);

    await waitFor(async () => {
      const cancelProcessButton = screen.getByTestId(
        TestId.CancelProcessButton
      );

      expect(cancelProcessButton).toBeEnabled();
    });
  });

  it("should disable 'Cancel Process' button if selected instrument is disconnected", async () => {
    const screen = render(<SnapProInstrumentScreen />);

    const instrumentCardIds = SNAP_STATUSES.map((it) =>
      TestId.Instrument(it.instrument.id)
    );

    for (const instrumentCardId of instrumentCardIds) {
      const instrumentCard = screen.getByTestId(instrumentCardId);
      expect(instrumentCard).not.toHaveClass("selected");
    }

    const disconnectedInstrumentCard = screen.getByTestId(
      TestId.Instrument(SNAP_STATUSES[4].instrument.id)
    );

    await userEvent.click(disconnectedInstrumentCard);

    await waitFor(async () => {
      const cancelProcessButton = screen.getByTestId(
        TestId.CancelProcessButton
      );

      expect(cancelProcessButton).toBeDisabled();
    });
  });

  it("should stop waiting if 'Cancel Process' confirmed", async () => {
    const screen = render(<SnapProInstrumentScreen />);

    const connectedInstrument = SNAP_STATUSES[3];

    const connectedInstrumentCardTestId = TestId.Instrument(
      SNAP_STATUSES[3].instrument.id
    );

    const instrumentCardIds = SNAP_STATUSES.map((it) =>
      TestId.Instrument(it.instrument.id)
    );

    for (const instrumentCardId of instrumentCardIds) {
      const instrumentCard = screen.getByTestId(instrumentCardId);
      expect(instrumentCard).not.toHaveClass("selected");
    }

    const cancelProcessButton = screen.getByTestId(TestId.CancelProcessButton);

    expect(cancelProcessButton).toBeDisabled();

    const connectedInstrumentCard = screen.getByTestId(
      connectedInstrumentCardTestId
    );

    await userEvent.click(connectedInstrumentCard);

    await waitFor(async () => {
      expect(cancelProcessButton).toBeEnabled();
    });

    await userEvent.click(cancelProcessButton);

    const cancelProcessConfirmModal = screen.getByTestId(
      CancelProcessButtonTestId.ConfirmModal(TestId.CancelProcessButton)
    );

    await waitFor(async () => {
      expect(cancelProcessConfirmModal).toBeVisible();
    });

    const confirmButton = await within(cancelProcessConfirmModal).findByRole(
      "button",
      { name: "Cancel Process" }
    );

    await userEvent.click(confirmButton);

    await waitFor(async () => {
      expect(cancelProcessConfirmModal).not.toBeVisible();
    });

    expect(stopWaiting).toHaveBeenCalledOnce();
    expect(stopWaiting).toHaveBeenCalledWith({
      instrumentId: connectedInstrument.instrument.id,
    });
  });
});
