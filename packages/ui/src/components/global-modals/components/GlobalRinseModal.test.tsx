import { describe, it, vi } from "vitest";
import { Location, useLocation, useNavigate } from "react-router-dom";
import { render } from "../../../../test-utils/test-utils";
import { useEventListener } from "../../../context/EventSourceContext";
import { EventIds, HealthCode } from "@viewpoint/api";
import { GlobalModalProvider, useGlobalModals } from "../GlobalModals";
import {
  useRinseModalAddListener,
  useRinseModalRemoveListener,
} from "./GlobalRinseModal";
import {
  randomDetailedInstrumentStatus,
  randomInstrumentProgressEvent,
  randomInstrumentWaitingEvent,
} from "@viewpoint/test-utils";
import faker from "faker";

const AddUsage = () => {
  useRinseModalAddListener();
  return <></>;
};

const AddTestBed = () => (
  <GlobalModalProvider>
    <AddUsage />
  </GlobalModalProvider>
);

interface RemoveUsageProps {
  instrumentId: number;
  rinseModalId: string;
}

const RemoveUsage = (props: RemoveUsageProps) => {
  const { instrumentId, rinseModalId } = props;
  useRinseModalRemoveListener(instrumentId, rinseModalId);
  return <></>;
};

const RemoveTestBed = (props: RemoveUsageProps) => (
  <GlobalModalProvider>
    <RemoveUsage
      instrumentId={props.instrumentId}
      rinseModalId={props.rinseModalId}
    />
  </GlobalModalProvider>
);

vi.mock("../../../context/EventSourceContext", async (origImport) => ({
  ...((await origImport()) as any),
  useEventListener: vi.fn(),
}));

vi.mock("react-router-dom", async (origImport) => ({
  ...((await origImport()) as any),
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock("../GlobalModals", async (origImport) => ({
  ...((await origImport()) as any),
  useGlobalModals: vi.fn(),
}));

describe("GlobalRinseModal", () => {
  const mockNav = vi.fn();
  const mockUseEventListener = vi.mocked(useEventListener);
  const mockAddModal = vi.fn();
  const mockRemoveModal = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockImplementation(() => mockNav);
    vi.mocked(useLocation).mockImplementation(
      () =>
        ({
          pathname: new URL(faker.internet.url()).pathname,
        } as Location)
    );
    vi.mocked(useGlobalModals).mockImplementation(() => ({
      addModal: mockAddModal,
      removeModal: mockRemoveModal,
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("useRinseModalAddListener", () => {
    it("should register a listener for 'instrument_waiting' events", () => {
      render(<AddTestBed />);

      expect(mockUseEventListener).toHaveBeenCalledWith(
        EventIds.InstrumentWaiting,
        expect.any(Function)
      );
    });
  });

  describe("useRinseModalRemoveListener", () => {
    it("should register a listener for 'instrument_progress' events", () => {
      render(
        <RemoveTestBed
          instrumentId={faker.datatype.number()}
          rinseModalId={faker.datatype.string(10)}
        />
      );

      expect(mockUseEventListener).toHaveBeenCalledWith(
        EventIds.InstrumentProgress,
        expect.any(Function)
      );
    });
  });

  describe("rinseModal add listener", () => {
    it("should add a rinse modal when an InstrumentWaiting event occurs", () => {
      render(<AddTestBed />);

      expect(mockUseEventListener).toHaveBeenCalledTimes(1);

      const listener = mockUseEventListener.mock.calls[0][1];

      const waitingEvent = randomInstrumentWaitingEvent();
      const messageEvent = new MessageEvent("data", {
        data: JSON.stringify(waitingEvent),
      });

      listener(messageEvent);

      expect(mockAddModal).toHaveBeenCalledTimes(1);
      expect(mockAddModal).toHaveBeenCalledWith(
        expect.objectContaining({
          id: `rinse-${waitingEvent.instrument.id}`,
        })
      );
    });
  });

  describe("rinseModal remove listener", () => {
    it("should remove rinse modal when an Instrument Progress event occurs", () => {
      const progressEvent = randomInstrumentProgressEvent();
      const messageEvent = new MessageEvent("data", {
        data: JSON.stringify(progressEvent),
      });
      const rinseModalId = `rinse-${progressEvent.instrumentId}`;

      render(
        <RemoveTestBed
          instrumentId={progressEvent.instrumentId}
          rinseModalId={rinseModalId}
        />
      );

      expect(mockUseEventListener).toHaveBeenCalledTimes(2);

      const listener = mockUseEventListener.mock.calls.find(
        ([eventType]) => eventType === EventIds.InstrumentProgress
      )![1];

      listener(messageEvent);

      expect(mockRemoveModal).toHaveBeenCalledTimes(1);
      expect(mockRemoveModal).toHaveBeenCalledWith(rinseModalId);
    });

    it("should navigate up when an InstrumentProgress event occurs and location is that instrument's maintenance page", () => {
      const progressEvent = randomInstrumentProgressEvent();
      const messageEvent = new MessageEvent("data", {
        data: JSON.stringify(progressEvent),
      });
      const rinseModalId = `rinse-${progressEvent.instrumentId}`;

      const mockUseLocation = vi.mocked(useLocation);
      mockUseLocation.mockClear();
      mockUseLocation.mockImplementation(
        () =>
          ({
            pathname: `/instruments/${progressEvent.instrumentId}/maintenance`,
          } as Location)
      );

      render(
        <RemoveTestBed
          instrumentId={progressEvent.instrumentId}
          rinseModalId={rinseModalId}
        />
      );
      expect(mockUseEventListener).toHaveBeenCalledTimes(2);

      const listener = mockUseEventListener.mock.calls.find(
        ([eventType]) => eventType === EventIds.InstrumentProgress
      )![1];

      listener(messageEvent);

      expect(mockNav).toBeCalledTimes(1);
      expect(mockNav).toBeCalledWith("../");
    });

    it("should not navigate up when an InstrumentProgress event occurs and location is not that instrument's maintenance page", () => {
      const progressEvent = randomInstrumentProgressEvent();
      const messageEvent = new MessageEvent("data", {
        data: JSON.stringify(progressEvent),
      });
      const rinseModalId = `rinse-${progressEvent.instrumentId}`;

      const mockUseLocation = vi.mocked(useLocation);
      mockUseLocation.mockClear();
      mockUseLocation.mockImplementation(
        () =>
          ({
            pathname: `/not/an/instrument/maintenance/page`,
          } as Location)
      );

      render(
        <RemoveTestBed
          instrumentId={progressEvent.instrumentId}
          rinseModalId={rinseModalId}
        />
      );

      expect(mockUseEventListener).toHaveBeenCalledTimes(2);

      const listener = mockUseEventListener.mock.calls.find(
        ([eventType]) => eventType === EventIds.InstrumentProgress
      )![1];

      listener(messageEvent);

      expect(mockNav).not.toHaveBeenCalled();
    });

    it("should not navigate up when an InstrumentProgress event occurs and location is a different instrument's maintenance page", () => {
      const progressEvent = randomInstrumentProgressEvent();
      const messageEvent = new MessageEvent("data", {
        data: JSON.stringify(progressEvent),
      });
      const rinseModalId = `rinse-${progressEvent.instrumentId}`;

      const mockUseLocation = vi.mocked(useLocation);
      mockUseLocation.mockClear();
      mockUseLocation.mockImplementation(
        () =>
          ({
            pathname: `/instruments/${
              progressEvent.instrumentId + 7
            }/maintenance`,
          } as Location)
      );

      render(
        <RemoveTestBed
          instrumentId={progressEvent.instrumentId}
          rinseModalId={rinseModalId}
        />
      );
      expect(mockUseEventListener).toHaveBeenCalledTimes(2);

      const listener = mockUseEventListener.mock.calls.find(
        ([eventType]) => eventType === EventIds.InstrumentProgress
      )![1];

      listener(messageEvent);

      expect(mockNav).not.toHaveBeenCalled();
    });
  });

  it("schedules modal removal 15 seconds after receiving RUNNING health code detailed status message", () => {
    vi.useFakeTimers();
    const detailedStatus = randomDetailedInstrumentStatus({
      status: HealthCode.RUNNING,
    });
    const messageEvent = new MessageEvent("data", {
      data: JSON.stringify(detailedStatus),
    });
    const rinseModalId = `rinse-${detailedStatus.instrument.id}`;

    render(
      <RemoveTestBed
        instrumentId={detailedStatus.instrument.id}
        rinseModalId={rinseModalId}
      />
    );

    expect(mockUseEventListener).toHaveBeenCalledTimes(2);

    const listener = mockUseEventListener.mock.calls.find(
      ([eventType]) => eventType === EventIds.DetailedInstrumentStatusUpdated
    )![1];

    listener(messageEvent);

    expect(mockRemoveModal).not.toHaveBeenCalled();
    vi.advanceTimersByTime(16000);

    expect(mockRemoveModal).toHaveBeenCalledTimes(1);
    expect(mockRemoveModal).toHaveBeenCalledWith(rinseModalId);
  });
});
