import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import {
  randomRunningLabRequest,
  randomQualityControlDto,
} from "@viewpoint/test-utils";
import {
  EventIds,
  InstrumentRunProgressDto,
  InstrumentType,
  PatientJobAcceptedDto,
  ProgressType,
  SampleTypeEnum,
  SettingTypeEnum,
} from "@viewpoint/api";
import { act, findByTestId, screen } from "@testing-library/react";
import { useEventListener } from "../../../context/EventSourceContext";
import { usePatientJobActions } from "./PatientJobHooks";
import { GlobalModalProvider } from "../../../components/global-modals/GlobalModals";
import { TestId as ModalTestId } from "../../../screens/instruments/procytedx/qc/ProCyteDxStartQcInstructions";
import { TestId as CommonTestId } from "../../../screens/instruments/procytedx/qc/common-components";
import { TestId as InvertModalId } from "../../../components/reminders/InvertSampleReminderContent";
import { useGetSettingsQuery } from "../../../api/SettingsApi";
import { TestId as SamplePrepId } from "../../../screens/instruments/urisysdx/UriSysDxSamplePrepInstructionsContent";

vi.mock("../../../context/EventSourceContext", async (orig) => ({
  ...((await orig()) as any),
  useEventListener: vi.fn(),
}));

// Intentionally mocking this rather than using MSW. The problem with using MSW
// for these hooks is that we're trying to find a specific callback to
// useEventListener, but waiting for MSW to actually mock the response causes
// the RTK query hooks to initially render with an undefined value, then render
// with the mocked value, which causes recreation of the useEventListener callbacks.
// Rather than trying to find the "right" callback, just mock the hook, so it only has to render once
vi.mock("../../../api/SettingsApi", async (orig) => ({
  ...((await orig()) as any),
  useGetSettingsQuery: vi.fn(),
}));

const HookTest = () => {
  usePatientJobActions();
  return <div />;
};

const TestBed = () => (
  <GlobalModalProvider>
    <HookTest />
  </GlobalModalProvider>
);

describe("PatientJobHooks", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("procyte dx", () => {
    it("listens for QC runs to start and displays confirm modal", async () => {
      vi.mocked(useGetSettingsQuery).mockReturnValue({
        data: {},
      } as any);

      render(<TestBed />);

      const lr = randomRunningLabRequest();
      const data: PatientJobAcceptedDto = {
        id: "patient_job_accepted",
        "lab-request": lr,
        "instrument-run": {
          ...lr.instrumentRunDtos![0],
          instrumentType: InstrumentType.ProCyteDx,
          sampleType: SampleTypeEnum.QUALITYCONTROL,
        },
        "quality-control": {
          ...randomQualityControlDto(),
          level: "1",
          lotNumber: "12345",
          controlType: "C",
        },
      };

      const callback = vi.mocked(useEventListener).mock.calls[0][1];
      const msg = { data: JSON.stringify(data) };
      act(() => callback(msg as MessageEvent));

      expect(await screen.findByTestId(ModalTestId.ContentRoot)).toBeVisible();
      expect(await screen.findByTestId(CommonTestId.Lot)).toHaveTextContent(
        data["quality-control"]!.lotNumber!
      );
      expect(await screen.findByTestId(CommonTestId.Level)).toHaveTextContent(
        data["quality-control"]!.level!
      );
    });

    it("closes the QC instruction modal when receiving instrument progress", async () => {
      vi.mocked(useGetSettingsQuery).mockReturnValue({
        data: {},
      } as any);

      render(<TestBed />);

      const lr = randomRunningLabRequest();
      const data: PatientJobAcceptedDto = {
        id: "patient_job_accepted",
        "lab-request": lr,
        "instrument-run": {
          ...lr.instrumentRunDtos![0],
          instrumentType: InstrumentType.ProCyteDx,
          sampleType: SampleTypeEnum.QUALITYCONTROL,
        },
        "quality-control": {
          ...randomQualityControlDto(),
          level: "1",
          lotNumber: "12345",
          controlType: "C",
        },
      };

      expect(useEventListener).toHaveBeenCalledWith(
        EventIds.PatientJobAccepted,
        expect.anything()
      );

      const jobAcceptedCallback = vi.mocked(useEventListener).mock.calls[0][1];
      act(() =>
        jobAcceptedCallback({ data: JSON.stringify(data) } as MessageEvent)
      );

      expect(await screen.findByTestId(ModalTestId.ContentRoot)).toBeVisible();

      expect(useEventListener).toHaveBeenCalledWith(
        EventIds.InstrumentRunProgress,
        expect.anything()
      );

      const progressData: InstrumentRunProgressDto = {
        id: "instrument_run_progress",
        instrumentRunId: 1,
        instrumentId: data["instrument-run"].instrumentId,
        progress: 0.5,
        progressType: ProgressType.PERCENT_COMPLETE,
      };
      // Find the right callback -- useEventListener may have been called with the other event ID a couple times
      const closeCallback = vi
        .mocked(useEventListener)
        .mock.calls.find(
          (call) => call[0] === EventIds.InstrumentRunProgress
        )?.[1];
      expect(closeCallback).toBeDefined();

      act(() =>
        closeCallback!({ data: JSON.stringify(progressData) } as MessageEvent)
      );

      expect(
        await screen.queryByTestId(ModalTestId.ContentRoot)
      ).not.toBeInTheDocument();
    });

    it("should listen for runs to start and displays the sample inversion modal", async () => {
      vi.mocked(useGetSettingsQuery).mockReturnValue({
        data: { [SettingTypeEnum.INVERT_SAMPLE_REMINDER]: "true" },
      } as any);

      render(<TestBed />);

      const lr = randomRunningLabRequest();
      const data: PatientJobAcceptedDto = {
        id: "patient_job_accepted",
        "lab-request": lr,
        "instrument-run": {
          ...lr.instrumentRunDtos![0],
          instrumentType: InstrumentType.ProCyteDx,
          sampleType: SampleTypeEnum.BLOOD,
        },
      };

      const jobAcceptedCallback = vi.mocked(useEventListener).mock.calls[0][1];
      act(() =>
        jobAcceptedCallback({ data: JSON.stringify(data) } as MessageEvent)
      );

      expect(
        await screen.findByTestId(InvertModalId.ContentRoot)
      ).toBeVisible();
    });

    it("should close the sample inversion modal when receiving instrument progress", async () => {
      vi.mocked(useGetSettingsQuery).mockReturnValue({
        data: { [SettingTypeEnum.INVERT_SAMPLE_REMINDER]: "true" },
      } as any);

      render(<TestBed />);

      const lr = randomRunningLabRequest();
      const data: PatientJobAcceptedDto = {
        id: "patient_job_accepted",
        "lab-request": lr,
        "instrument-run": {
          ...lr.instrumentRunDtos![0],
          instrumentType: InstrumentType.ProCyteDx,
          sampleType: SampleTypeEnum.BLOOD,
        },
      };

      expect(useEventListener).toHaveBeenCalledWith(
        EventIds.PatientJobAccepted,
        expect.anything()
      );

      const jobAcceptedCallback = vi.mocked(useEventListener).mock.calls[0][1];
      act(() =>
        jobAcceptedCallback({ data: JSON.stringify(data) } as MessageEvent)
      );

      expect(
        await screen.findByTestId(InvertModalId.ContentRoot)
      ).toBeVisible();

      expect(useEventListener).toHaveBeenCalledWith(
        EventIds.InstrumentRunProgress,
        expect.anything()
      );

      const progressData: InstrumentRunProgressDto = {
        id: "instrument_run_progress",
        instrumentRunId: 1,
        instrumentId: data["instrument-run"].instrumentId,
        progress: 0.5,
        progressType: ProgressType.PERCENT_COMPLETE,
      };

      const closeCallback = vi
        .mocked(useEventListener)
        .mock.calls.find(
          (call) => call[0] === EventIds.InstrumentRunProgress
        )?.[1];
      expect(closeCallback).toBeDefined();

      act(() =>
        closeCallback!({ data: JSON.stringify(progressData) } as MessageEvent)
      );

      expect(
        await screen.queryByTestId(InvertModalId.ContentRoot)
      ).not.toBeInTheDocument();
    });

    it("should not display the sample inversion modal if the setting is toggled off", async () => {
      vi.mocked(useGetSettingsQuery).mockReturnValue({
        data: { [SettingTypeEnum.INVERT_SAMPLE_REMINDER]: "false" },
      } as any);

      render(<TestBed />);

      const lr = randomRunningLabRequest();
      const data: PatientJobAcceptedDto = {
        id: "patient_job_accepted",
        "lab-request": lr,
        "instrument-run": {
          ...lr.instrumentRunDtos![0],
          instrumentType: InstrumentType.ProCyteDx,
          sampleType: SampleTypeEnum.BLOOD,
        },
      };

      const jobAcceptedCallback = vi.mocked(useEventListener).mock.calls[0][1];
      act(() =>
        jobAcceptedCallback({ data: JSON.stringify(data) } as MessageEvent)
      );

      expect(
        await screen.queryByTestId(InvertModalId.ContentRoot)
      ).not.toBeInTheDocument();
    });
  });

  describe("ngua", () => {
    it("should listen for runs to start and displays the sample preparation modal", async () => {
      vi.mocked(useGetSettingsQuery).mockReturnValue({
        data: {
          [SettingTypeEnum.URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED]: "true",
        },
      } as any);

      render(<TestBed />);

      const lr = randomRunningLabRequest();
      const data: PatientJobAcceptedDto = {
        id: "patient_job_accepted",
        "lab-request": lr,
        "instrument-run": {
          ...lr.instrumentRunDtos![0],
          instrumentType: InstrumentType.UriSysDx,
          sampleType: SampleTypeEnum.URINE,
        },
      };

      const jobAcceptedCallback = vi.mocked(useEventListener).mock.calls[0][1];
      act(() =>
        jobAcceptedCallback({ data: JSON.stringify(data) } as MessageEvent)
      );

      expect(await screen.findByTestId(SamplePrepId.ContentRoot)).toBeVisible();
    });

    it("should close the sample preparation modal when receiving instrument progress", async () => {
      vi.mocked(useGetSettingsQuery).mockReturnValue({
        data: {
          [SettingTypeEnum.URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED]: "true",
        },
      } as any);

      render(<TestBed />);

      const lr = randomRunningLabRequest();
      const data: PatientJobAcceptedDto = {
        id: "patient_job_accepted",
        "lab-request": lr,
        "instrument-run": {
          ...lr.instrumentRunDtos![0],
          instrumentType: InstrumentType.UriSysDx,
          sampleType: SampleTypeEnum.URINE,
        },
      };

      expect(useEventListener).toHaveBeenCalledWith(
        EventIds.PatientJobAccepted,
        expect.anything()
      );

      const jobAcceptedCallback = vi.mocked(useEventListener).mock.calls[0][1];
      act(() =>
        jobAcceptedCallback({ data: JSON.stringify(data) } as MessageEvent)
      );

      expect(await screen.findByTestId(SamplePrepId.ContentRoot)).toBeVisible();

      expect(useEventListener).toHaveBeenCalledWith(
        EventIds.InstrumentRunProgress,
        expect.anything()
      );

      const progressData: InstrumentRunProgressDto = {
        id: "instrument_run_progress",
        instrumentRunId: 1,
        instrumentId: data["instrument-run"].instrumentId,
        progress: 0.5,
        progressType: ProgressType.PERCENT_COMPLETE,
      };

      const closeCallback = vi
        .mocked(useEventListener)
        .mock.calls.find(
          (call) => call[0] === EventIds.InstrumentRunProgress
        )?.[1];
      expect(closeCallback).toBeDefined();

      act(() =>
        closeCallback!({ data: JSON.stringify(progressData) } as MessageEvent)
      );

      expect(
        await screen.queryByTestId(SamplePrepId.ContentRoot)
      ).not.toBeInTheDocument();
    });

    it("should not display the sample inversion modal if the setting is toggled off", async () => {
      vi.mocked(useGetSettingsQuery).mockReturnValue({
        data: {
          [SettingTypeEnum.URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED]: "false",
        },
      } as any);

      render(<TestBed />);

      const lr = randomRunningLabRequest();
      const data: PatientJobAcceptedDto = {
        id: "patient_job_accepted",
        "lab-request": lr,
        "instrument-run": {
          ...lr.instrumentRunDtos![0],
          instrumentType: InstrumentType.UriSysDx,
          sampleType: SampleTypeEnum.URINE,
        },
      };

      const jobAcceptedCallback = vi.mocked(useEventListener).mock.calls[0][1];
      act(() =>
        jobAcceptedCallback({ data: JSON.stringify(data) } as MessageEvent)
      );

      expect(
        await screen.queryByTestId(SamplePrepId.ContentRoot)
      ).not.toBeInTheDocument();
    });
  });
});
