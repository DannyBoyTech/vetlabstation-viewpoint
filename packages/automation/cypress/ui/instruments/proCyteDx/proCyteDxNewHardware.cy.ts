import {
  interceptGlobalRequests,
  interceptRequestsForHomeScreen,
} from "../../../util/default-intercepts";
import {
  randomAlertDto,
  randomDetailedInstrumentStatus,
  randomInstrumentAlertDto,
  randomInstrumentDto,
  randomInstrumentStatus,
  randomRemovableDriveDto,
} from "@viewpoint/test-utils";
import {
  HealthCode,
  InstallationStatus,
  InstrumentStatus,
  InstrumentType,
  ProCyteDxAlerts,
} from "@viewpoint/api";

describe("procyte dx new hardware config", () => {
  const proCyte = randomInstrumentDto({
    instrumentType: InstrumentType.ProCyteDx,
  });
  beforeEach(() => {
    interceptGlobalRequests();
    interceptRequestsForHomeScreen();
    cy.intercept("GET", "**/api/device/status", [
      randomInstrumentStatus({
        instrument: proCyte,
        instrumentStatus: InstrumentStatus.Alert,
      }),
    ]);
    cy.intercept("GET", "**/api/instruments/alerts", [
      randomInstrumentAlertDto({
        instrumentId: proCyte.id,
        alerts: [
          randomAlertDto({
            name: ProCyteDxAlerts.NEW_HARDWARE_DETECTED,
          }),
        ],
      }),
    ]);
  });

  it("allows user to navigate to workflow via alerted icon", () => {
    cy.visit("/");
    cy.getByTestId("displayed-instruments").contains("ProCyte Dx").click();
    cy.getByTestId("alert-title").contains("New hardware detected.");
    cy.getByTestId("alert-modal-content")
      .get("button")
      .contains("Configure")
      .click();
    cy.url().should("contain", `/instruments/${proCyte.id}/newHardware`);
  });

  describe("installs", () => {
    beforeEach(() => {
      // Detailed status is used to determine enabledness of Finish button when
      // response is "MAIN_UNIT_ON"
      const detailedProCyteStatus = randomDetailedInstrumentStatus({
        instrument: proCyte,
        status: HealthCode.HALT,
      });
      cy.intercept("**/api/instruments/*/status", detailedProCyteStatus);
      cy.visit(`instruments/${proCyte.id}/newHardware`);
      cy.get("button").contains("Next").as("nextButton");
      cy.get("button").contains("Cancel").as("cancelButton");
    });
    describe("usb install", () => {
      const validDrive = randomRemovableDriveDto();
      const invalidDrive = randomRemovableDriveDto();

      beforeEach(() => {
        // Workflow starts by checking for local files -- to initiate USB workflow,
        // IVLS has to respond that no local files are found
        interceptLocalVerifyResponse(InstallationStatus.FILES_NOT_FOUND);

        cy.intercept("GET", "**/api/usb/drives", [validDrive, invalidDrive]);
        cy.intercept(
          {
            pathname: "**/api/proCyte/installation/instrument/*/verifyUsb",
            query: { driveId: validDrive.id },
          },
          JSON.stringify(InstallationStatus.FILES_FOUND)
        );
        cy.intercept(
          {
            pathname: "**/api/proCyte/installation/instrument/*/verifyUsb",
            query: { driveId: invalidDrive.id },
          },
          JSON.stringify(InstallationStatus.FILES_NOT_FOUND)
        );
      });

      it("allows user to run through configuring the procyte dx via USB", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // Go through "insert USB" prompt
        cy.getByTestId("done-button").click();
        // Choose the valid USB drive
        cy.getByTestId(
          `usb-selection-drive-list-item-${validDrive.id}`
        ).click();
        // Proceed
        cy.getByTestId("usb-selection-modal-next").click();
        // Return success
        interceptUsbInstallResponse(InstallationStatus.SUCCESS);
        cy.getByTestId("done-button").click();
        // Verify "success" toast
        cy.get(".spot-toast")
          .contains("Configuration successful.")
          .should("be.visible");
      });

      it("notifies user if there are no valid calibration files on the USB", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // Go through "insert USB" prompt
        cy.getByTestId("done-button").click();
        // Choose the invalid USB drive
        cy.getByTestId(
          `usb-selection-drive-list-item-${invalidDrive.id}`
        ).click();
        // Proceed
        cy.getByTestId("usb-selection-modal-next").click();
        cy.contains("No Calibration Files Found").should("be.visible");
        // Click OK to go back to the selection page
        cy.getByTestId("done-button").click();
        cy.getByTestId(
          `usb-selection-drive-list-item-${invalidDrive.id}`
        ).click();
        // Proceed
        cy.getByTestId("usb-selection-modal-next").click();
        // Cancel to close
        cy.getByTestId("later-button").click();
        cy.findByTestId("confirm-modal").should("not.exist");
      });

      it("notifies user to turn off the main unit", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // Go through "insert USB" prompt
        cy.getByTestId("done-button").click();
        // Choose the valid USB drive
        cy.getByTestId(
          `usb-selection-drive-list-item-${validDrive.id}`
        ).click();
        // Proceed
        cy.getByTestId("usb-selection-modal-next").click();
        // Return MAIN_UNIT_ON
        interceptUsbInstallResponse(InstallationStatus.MAIN_UNIT_ON);
        cy.getByTestId("done-button").click();
        // Verify "turn off main unit" modal visible
        cy.getByTestId("confirm-modal")
          .contains("Use the power switch to power off the analyzer.")
          .should("be.visible");
        // Return success
        interceptUsbInstallResponse(InstallationStatus.SUCCESS);
        cy.getByTestId("done-button").should("be.enabled").click();
        // Verify "success" toast
        cy.get(".spot-toast")
          .contains("Configuration successful.")
          .should("be.visible");
      });

      it("disables finish button for MAIN_UNIT_ON response until health code is HALT", () => {
        // Return HALT health code
        const detailedProCyteStatus = randomDetailedInstrumentStatus({
          instrument: proCyte,
          status: HealthCode.READY,
        });
        cy.intercept("**/api/instruments/*/status", detailedProCyteStatus);
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // Go through "insert USB" prompt
        cy.getByTestId("done-button").click();
        // Choose the valid USB drive
        cy.getByTestId(
          `usb-selection-drive-list-item-${validDrive.id}`
        ).click();
        // Proceed
        cy.getByTestId("usb-selection-modal-next").click();
        // Return MAIN_UNIT_ON
        interceptUsbInstallResponse(InstallationStatus.MAIN_UNIT_ON);
        cy.getByTestId("done-button").click();
        cy.getByTestId("done-button").should("be.disabled");
      });

      it("will attempt to reinstall if there is an error transmitting the system cal file", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // Go through "insert USB" prompt
        cy.getByTestId("done-button").click();
        // Choose the valid USB drive
        cy.getByTestId(
          `usb-selection-drive-list-item-${validDrive.id}`
        ).click();
        // Proceed
        cy.getByTestId("usb-selection-modal-next").click();
        interceptUsbInstallResponse(
          InstallationStatus.TRANSMISSION_ERROR_SYSTEM_CAL
        );
        cy.getByTestId("done-button").click();
        cy.getByTestId("confirm-modal")
          .contains("A transmission error occurred.")
          .should("be.visible");
        interceptUsbInstallResponse(InstallationStatus.SUCCESS);
        cy.getByTestId("done-button").click();
        cy.get(".spot-toast")
          .contains("Configuration successful.")
          .should("be.visible");
      });

      it("will attempt to retransmit the serial number if there is an issue sending it to the IPU", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // Go through "insert USB" prompt
        cy.getByTestId("done-button").click();
        // Choose the valid USB drive
        cy.getByTestId(
          `usb-selection-drive-list-item-${validDrive.id}`
        ).click();
        // Proceed
        cy.getByTestId("usb-selection-modal-next").click();
        interceptUsbInstallResponse(
          InstallationStatus.TRANSMISSION_ERROR_SERIAL_NUMBER
        );
        cy.getByTestId("done-button").click();
        interceptUsbTransmitResponse(InstallationStatus.SUCCESS);
        cy.getByTestId("done-button").click();
        cy.get(".spot-toast")
          .contains("Configuration successful.")
          .should("be.visible");
      });

      it("will show a generic error message for an unhandled response", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // Go through "insert USB" prompt
        cy.getByTestId("done-button").click();
        // Choose the valid USB drive
        cy.getByTestId(
          `usb-selection-drive-list-item-${validDrive.id}`
        ).click();
        // Proceed
        cy.getByTestId("usb-selection-modal-next").click();
        // INCORRECT_FORMAT is not applicable to USB so is not mapped
        interceptUsbInstallResponse(InstallationStatus.INCORRECT_FORMAT);
        cy.getByTestId("done-button").click();
        cy.getByTestId("confirm-modal").contains("Something went wrong.");
      });
    });

    describe("local install", () => {
      beforeEach(() => {
        interceptLocalVerifyResponse(InstallationStatus.FILES_FOUND);
      });
      it("allows user to run through configuring the procyte dx via local cal file", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // Files found modal
        cy.getByTestId("confirm-modal").contains("Configuration files found.");
        interceptLocalInstallResponse(InstallationStatus.SUCCESS);
        cy.getByTestId("done-button").click();
        // Success
        cy.get(".spot-toast")
          .contains("Configuration successful.")
          .should("be.visible");
      });

      it("notifies user to turn off the main unit", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // // Return MAIN_UNIT_ON
        interceptLocalInstallResponse(InstallationStatus.MAIN_UNIT_ON);
        cy.getByTestId("done-button").click();
        cy.getByTestId("confirm-modal")
          .contains("Use the power switch to power off the analyzer.")
          .should("be.visible");
        // Return success
        interceptLocalInstallResponse(InstallationStatus.SUCCESS);
        cy.getByTestId("done-button").should("be.enabled").click();
        // Verify "success" toast
        cy.get(".spot-toast")
          .contains("Configuration successful.")
          .should("be.visible");
      });

      it("disables finish button for MAIN_UNIT_ON response until health code is HALT", () => {
        // Return HALT health code
        const detailedProCyteStatus = randomDetailedInstrumentStatus({
          instrument: proCyte,
          status: HealthCode.READY,
        });
        cy.intercept("**/api/instruments/*/status", detailedProCyteStatus);
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // Return MAIN_UNIT_ON
        interceptLocalInstallResponse(InstallationStatus.MAIN_UNIT_ON);
        cy.getByTestId("done-button").click();
        cy.getByTestId("done-button").should("be.disabled");
      });

      it("will attempt to reinstall if there is an error transmitting the system cal file", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        interceptLocalInstallResponse(
          InstallationStatus.TRANSMISSION_ERROR_SYSTEM_CAL
        );
        cy.getByTestId("done-button").click();
        cy.getByTestId("confirm-modal")
          .contains("A transmission error occurred.")
          .should("be.visible");
        interceptLocalInstallResponse(InstallationStatus.SUCCESS);
        cy.getByTestId("done-button").click();
        cy.get(".spot-toast")
          .contains("Configuration successful.")
          .should("be.visible");
      });

      it("will attempt to retransmit the serial number if there is an issue sending it to the IPU", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        interceptLocalInstallResponse(
          InstallationStatus.TRANSMISSION_ERROR_SERIAL_NUMBER
        );
        cy.getByTestId("done-button").click();
        interceptLocalTransmitResponse(InstallationStatus.SUCCESS);
        cy.getByTestId("done-button").click();
        cy.get(".spot-toast")
          .contains("Configuration successful.")
          .should("be.visible");
      });

      it("will show a generic error message for an unhandled response", () => {
        cy.get("input").type("A12345");
        cy.get("@nextButton").click();
        // INCORRECT_FORMAT is not applicable to local so is not mapped
        interceptLocalInstallResponse(InstallationStatus.INCORRECT_FORMAT);
        cy.getByTestId("done-button").click();
        cy.getByTestId("confirm-modal").contains("Something went wrong.");
      });
    });
  });
});

function interceptUsbInstallResponse(response: InstallationStatus) {
  cy.intercept(
    {
      pathname: "**/api/proCyte/installation/instrument/*/installFromUsb",
    },
    JSON.stringify(response)
  );
}

function interceptUsbTransmitResponse(response: InstallationStatus) {
  cy.intercept(
    {
      pathname:
        "**/api/proCyte/installation/instrument/*/transmitSerialNumberFromUsb",
    },
    JSON.stringify(response)
  );
}

function interceptLocalVerifyResponse(response: InstallationStatus) {
  cy.intercept(
    {
      method: "GET",
      pathname: "**/api/proCyte/installation/instrument/*/verifyLocal",
    },
    JSON.stringify(response)
  );
}

function interceptLocalInstallResponse(response: InstallationStatus) {
  cy.intercept(
    {
      pathname: "**/api/proCyte/installation/instrument/*/installFromLocal",
    },
    JSON.stringify(response)
  );
}

function interceptLocalTransmitResponse(response: InstallationStatus) {
  cy.intercept(
    {
      pathname:
        "**/api/proCyte/installation/instrument/*/transmitSerialNumberFromLocal",
    },
    JSON.stringify(response)
  );
}
