import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  InstrumentStatusDto,
  InstrumentType,
  ModeEnum,
  RestoreDto,
} from "@viewpoint/api";
import { useRestoreStatusNotifier } from "./RestoreHooks";
import { render } from "../../../../../test-utils/test-utils";
import { server } from "../../../../../test-utils/mock-server";
import { rest } from "msw";
import { GlobalModalProvider } from "../../../../components/global-modals/GlobalModals";
import { waitFor } from "@testing-library/react";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";

vi.mock("../../../../context/EventSourceContext", async (orig) => ({
  ...((await orig()) as any),
  useEventListener: vi.fn(),
}));

type Presence = "success" | "failure" | "absent";

interface ExpectedMessages {
  patient: Presence;
  settings: Presence;
  content: Presence;
  calibration: Presence;
  failureMessage: Presence;
}

describe("restore notification", () => {
  beforeEach(() => {
    mockInstruments([]);
  });

  describe("restore mode ALL", () => {
    const cases: {
      restoreDto: Partial<RestoreDto>;
      expectations: ExpectedMessages;
    }[] = [
      // All DBs restored successfully
      {
        restoreDto: {
          restorePatientDataSuccess: true,
          restoreSettingsDataSuccess: true,
          restoreContentDataSuccess: true,
          restoreLaserCyteCalibrationSuccess: true,
          restoreProCyteCalibrationSuccess: true,
          laserCyteCalibrationDataPresent: true,
          proCyteCalibrationDataPresent: true,
          restoreContentDatabaseName: "jackalope",
        },
        expectations: {
          patient: "success",
          settings: "success",
          content: "absent",
          calibration: "success",
          failureMessage: "absent",
        },
      },
      // Patient data failure
      {
        restoreDto: {
          restorePatientDataSuccess: false,
          restoreSettingsDataSuccess: true,
          restoreContentDataSuccess: true,
          restoreLaserCyteCalibrationSuccess: true,
          restoreProCyteCalibrationSuccess: true,
          laserCyteCalibrationDataPresent: true,
          proCyteCalibrationDataPresent: true,
          restoreContentDatabaseName: "jackalope",
        },
        expectations: {
          patient: "failure",
          settings: "success",
          content: "absent",
          calibration: "success",
          failureMessage: "success",
        },
      },
      // Settings DB failure
      {
        restoreDto: {
          restorePatientDataSuccess: true,
          restoreSettingsDataSuccess: false,
          restoreContentDataSuccess: true,
          restoreLaserCyteCalibrationSuccess: true,
          restoreProCyteCalibrationSuccess: true,
          laserCyteCalibrationDataPresent: true,
          proCyteCalibrationDataPresent: true,
          restoreContentDatabaseName: "jackalope",
        },
        expectations: {
          patient: "success",
          settings: "failure",
          content: "absent",
          calibration: "success",
          failureMessage: "success",
        },
      },
      // Content DB failure (jackalope)
      {
        restoreDto: {
          restorePatientDataSuccess: true,
          restoreSettingsDataSuccess: true,
          restoreContentDataSuccess: false,
          restoreLaserCyteCalibrationSuccess: true,
          restoreProCyteCalibrationSuccess: true,
          laserCyteCalibrationDataPresent: true,
          proCyteCalibrationDataPresent: true,
          restoreContentDatabaseName: "jackalope",
        },
        expectations: {
          patient: "success",
          settings: "success",
          content: "failure",
          calibration: "success",
          failureMessage: "success",
        },
      },
      // All DB failure
      {
        restoreDto: {
          restorePatientDataSuccess: false,
          restoreSettingsDataSuccess: false,
          restoreContentDataSuccess: false,
          restoreLaserCyteCalibrationSuccess: true,
          restoreProCyteCalibrationSuccess: true,
          laserCyteCalibrationDataPresent: true,
          proCyteCalibrationDataPresent: true,
          restoreContentDatabaseName: "jackalope",
        },
        expectations: {
          patient: "failure",
          settings: "failure",
          content: "failure",
          calibration: "success",
          failureMessage: "success",
        },
      },
      // Only show content failure if content DB was present
      {
        restoreDto: {
          restorePatientDataSuccess: true,
          restoreSettingsDataSuccess: true,
          restoreContentDataSuccess: false,
          restoreLaserCyteCalibrationSuccess: true,
          restoreProCyteCalibrationSuccess: true,
          laserCyteCalibrationDataPresent: true,
          proCyteCalibrationDataPresent: true,
          restoreContentDatabaseName: undefined,
        },
        expectations: {
          patient: "success",
          settings: "success",
          content: "absent",
          calibration: "success",
          failureMessage: "absent",
        },
      },
      // Only show content success if content DB was present
      {
        restoreDto: {
          restorePatientDataSuccess: true,
          restoreSettingsDataSuccess: true,
          restoreContentDataSuccess: true,
          restoreLaserCyteCalibrationSuccess: true,
          restoreProCyteCalibrationSuccess: true,
          laserCyteCalibrationDataPresent: true,
          proCyteCalibrationDataPresent: true,
          restoreContentDatabaseName: undefined,
        },
        expectations: {
          patient: "success",
          settings: "success",
          content: "absent",
          calibration: "success",
          failureMessage: "absent",
        },
      },
      // Calibration message absent with no hema instruments
      {
        restoreDto: {
          restorePatientDataSuccess: true,
          restoreSettingsDataSuccess: true,
          restoreContentDataSuccess: true,
          restoreLaserCyteCalibrationSuccess: false,
          restoreProCyteCalibrationSuccess: true,
          laserCyteCalibrationDataPresent: true,
          proCyteCalibrationDataPresent: true,
          restoreContentDatabaseName: undefined,
        },
        expectations: {
          patient: "success",
          settings: "success",
          content: "absent",
          calibration: "absent",
          failureMessage: "absent",
        },
      },
      // Calibration message absent with no hema instruments
      {
        restoreDto: {
          restorePatientDataSuccess: true,
          restoreSettingsDataSuccess: true,
          restoreContentDataSuccess: true,
          restoreLaserCyteCalibrationSuccess: true,
          restoreProCyteCalibrationSuccess: false,
          laserCyteCalibrationDataPresent: true,
          proCyteCalibrationDataPresent: true,
          restoreContentDatabaseName: undefined,
        },
        expectations: {
          patient: "success",
          settings: "success",
          content: "absent",
          calibration: "absent",
          failureMessage: "absent",
        },
      },
    ];

    it.each(cases)("%p", async ({ restoreDto, expectations }) => {
      await checkRestoreCase(
        { ...restoreDto, mode: ModeEnum.ALL },
        expectations
      );
    });
  });

  describe("restore mode PATIENT", () => {
    const cases: {
      restoreDto: Partial<RestoreDto>;
      expectations: ExpectedMessages;
    }[] = [
      // Patient DB restored successfully
      {
        restoreDto: {
          restorePatientDataSuccess: true,
        },
        expectations: {
          patient: "success",
          settings: "absent",
          content: "absent",
          calibration: "absent",
          failureMessage: "absent",
        },
      },
      // Patient DB restored unsuccessfully
      {
        restoreDto: {
          restorePatientDataSuccess: false,
        },
        expectations: {
          patient: "failure",
          settings: "absent",
          content: "absent",
          calibration: "absent",
          failureMessage: "failure",
        },
      },
      // Other type ignored
      {
        restoreDto: {
          restorePatientDataSuccess: true,
          restoreSettingsDataSuccess: false,
        },
        expectations: {
          patient: "success",
          settings: "absent",
          content: "absent",
          calibration: "absent",
          failureMessage: "absent",
        },
      },
    ];

    it.each(cases)("%p", async ({ restoreDto, expectations }) => {
      await checkRestoreCase(
        { ...restoreDto, mode: ModeEnum.PATIENT },
        expectations
      );
    });
  });

  describe("restore mode SETTINGS", () => {
    const cases: {
      restoreDto: Partial<RestoreDto>;
      expectations: ExpectedMessages;
    }[] = [
      // Settings DB restored successfully
      {
        restoreDto: {
          restoreSettingsDataSuccess: true,
        },
        expectations: {
          patient: "absent",
          settings: "success",
          content: "absent",
          calibration: "absent",
          failureMessage: "absent",
        },
      },
      // Settings DB restored unsuccessfully
      {
        restoreDto: {
          restoreSettingsDataSuccess: false,
        },
        expectations: {
          patient: "absent",
          settings: "failure",
          content: "absent",
          calibration: "absent",
          failureMessage: "failure",
        },
      },
      // Other type ignored
      {
        restoreDto: {
          restorePatientDataSuccess: true,
          restoreSettingsDataSuccess: true,
        },
        expectations: {
          patient: "absent",
          settings: "success",
          content: "absent",
          calibration: "absent",
          failureMessage: "absent",
        },
      },
    ];

    it.each(cases)("%p", async ({ restoreDto, expectations }) => {
      await checkRestoreCase(
        { ...restoreDto, mode: ModeEnum.SETTINGS },
        expectations
      );
    });
  });

  async function checkRestoreCase(
    restoreDto: RestoreDto,
    expectations: ExpectedMessages
  ) {
    mockRestoreDto({
      ...restoreDto,
      restorePerformed: true,
    });
    // Render test bed with hook
    const { getByTestId, getByText, queryByText } = render(<TestBed />);
    // Wait for the restore modal to appear
    const modal = await waitFor(() => getByTestId("global-info-modal"));
    expect(modal).toBeVisible();
    for (const messageType of Object.keys(
      expectations
    ) as (keyof ExpectedMessages)[]) {
      // Get the expected presence for the message type (success, failure or absent)
      const expectation = expectations[messageType];
      // If we're not expecting the message type to be displayed
      if (expectation === "absent") {
        // Check that both the success and failure text for this message type are not displayed
        const successMessage = getExpectedTextContent(messageType, "success");
        if (successMessage != null) {
          expect(await queryByText(successMessage)).not.toBeInTheDocument();
        }
        const failureMessage = getExpectedTextContent(messageType, "failure");
        if (failureMessage != null) {
          expect(await queryByText(failureMessage)).not.toBeInTheDocument();
        }
      } else {
        // Check that the message text for the given type with given presence is displayed on screen
        const expectedText = getExpectedTextContent(
          messageType,
          expectations[messageType]
        );
        if (expectedText != null) {
          expect(await getByText(expectedText)).toBeVisible();
        }
      }
    }
  }

  it("only shows calibration failure message if a hematology analyzer is available", async () => {
    const restoreDto: RestoreDto = {
      restorePatientDataSuccess: true,
      restoreSettingsDataSuccess: true,
      restoreContentDataSuccess: true,
      restoreLaserCyteCalibrationSuccess: false,
      restoreProCyteCalibrationSuccess: true,
      laserCyteCalibrationDataPresent: true,
      proCyteCalibrationDataPresent: true,
      restoreContentDatabaseName: undefined,
    };
    mockRestoreDto({
      ...restoreDto,
      mode: ModeEnum.ALL,
      restorePerformed: true,
    });
    mockInstruments([
      randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      }),
    ]);

    const { getByTestId, getByText } = render(<TestBed />);
    await waitFor(() => getByTestId("global-info-modal"));
    expect(
      await getByText(getExpectedTextContent("calibration", "failure")!)
    ).toBeVisible();
  });
});

function getExpectedTextContent(
  type: keyof ExpectedMessages,
  presence: Presence
) {
  switch (type) {
    case "patient":
      switch (presence) {
        case "success":
          return "Patient data was restored successfully.";
        case "failure":
          return "Error restoring patient data.";
      }
      return undefined;
    case "settings":
      switch (presence) {
        case "success":
          return "User settings were restored successfully.";
        case "failure":
          return "Error restoring user settings data.";
      }
      return undefined;
    case "content":
      switch (presence) {
        case "failure":
          return "Error restoring image data.";
      }
      return undefined;
    case "calibration":
      switch (presence) {
        case "success":
          return "Hematology calibration data was restored successfully.";
        case "failure":
          return "Error restoring hematology calibration data.";
      }
      return undefined;
    case "failureMessage":
      switch (presence) {
        case "success":
          return "If a full restore is needed, please try again.";
      }
      return undefined;
  }
}

function mockRestoreDto(restoreDto: RestoreDto) {
  server.use(
    rest.get("**/api/boot/getBootItems", (req, res, context) =>
      res(context.json({ restoreDto }))
    )
  );
}

function mockInstruments(instrumentStatuses: InstrumentStatusDto[]) {
  server.use(
    rest.get("**/api/device/status", (req, res, context) =>
      res(context.json(instrumentStatuses))
    )
  );
}

function TestBed() {
  return (
    <GlobalModalProvider interModalDelayMillis={100}>
      <InnerTestBed />
    </GlobalModalProvider>
  );
}

function InnerTestBed() {
  useRestoreStatusNotifier();
  return <div />;
}
