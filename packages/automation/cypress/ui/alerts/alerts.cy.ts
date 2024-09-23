import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";
import {
  randomAlertDto,
  randomInstrumentAlertDto,
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { viteAsset } from "../../util/general-utils";
import {
  InstrumentAlertDto,
  InstrumentStatus,
  InstrumentType,
} from "@viewpoint/api";

describe("header alert indicators", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });

  it("shows alerted instrument icon for instruments with alerts", () => {
    const alerts = Array.from({ length: 3 }).map(randomInstrumentAlertDto);
    const instrumentTypes = [
      InstrumentType.CatalystOne,
      InstrumentType.ProCyteOne,
      InstrumentType.SediVueDx,
    ];
    const instruments = alerts.map((alert, index) =>
      randomInstrumentStatus({
        instrumentStatus: InstrumentStatus.Alert,
        connected: true,
        instrument: randomInstrumentDto({
          displayOrder: index,
          id: alert.instrumentId,
          instrumentType: instrumentTypes[index],
        }),
      })
    );
    cy.intercept("**/api/instruments/alerts", alerts);
    cy.intercept("**/api/device/status", instruments);

    cy.visit("/");

    // 3 alerted instrument pills visible in the header
    cy.getByTestId("alerted-instrument-pill")
      .as("pills")
      .its("length")
      .should("eq", 3);

    cy.get("@pills")
      .its(0)
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("CatOne.png"));

    cy.get("@pills")
      .its(1)
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("AcadiaDx.png"));

    cy.get("@pills")
      .its(2)
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("SediVueDx.png"));
  });

  it("shows an additional alerts pill when >4 alerted instruments are present", () => {
    // 4 alerted instruments
    const alerts = Array.from({ length: 4 }).map(randomInstrumentAlertDto);
    const instruments = alerts.map((alert, index) =>
      randomInstrumentStatus({
        instrumentStatus: InstrumentStatus.Alert,
        connected: true,
        instrument: randomInstrumentDto({
          displayOrder: index,
          id: alert.instrumentId,
        }),
      })
    );

    cy.intercept("**/api/instruments/alerts", alerts);
    cy.intercept("**/api/device/status", instruments);

    cy.visit("/");
    // 4 alerted instrument pills
    cy.getByTestId("alerted-instrument-pill")
      .as("pills")
      .its("length")
      .should("eq", 4);

    // Add a fifth alerted instrument
    const updatedAlerts = [...alerts, randomInstrumentAlertDto()];
    const updatedInstruments = updatedAlerts.map((alert, index) =>
      randomInstrumentStatus({
        instrumentStatus: InstrumentStatus.Alert,
        connected: true,
        instrument: randomInstrumentDto({
          displayOrder: index,
          id: alert.instrumentId,
        }),
      })
    );

    cy.intercept("**/api/instruments/alerts", updatedAlerts);
    cy.intercept("**/api/device/status", updatedInstruments);

    cy.visit("/");
    // Still only 4 alerted instrument pills
    cy.get("@pills").its("length").should("eq", 4);

    // The last one should not have an image and should have the ... additional indicator
    cy.get("@pills").last().should("not.have.attr", "src").contains("...");
  });

  it("navigates to instrument page and shows alert modal and content when alerted instrument icon is clicked", () => {
    const instrumentStatus = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Alert,
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
      }),
    });
    const alertList: InstrumentAlertDto[] = [
      {
        instrumentId: instrumentStatus.instrument.id,
        alerts: [
          randomAlertDto(),
          randomAlertDto({
            args: { "default-text": "This is the default alert text." },
          }),
          randomAlertDto({ uniqueId: "CAMERA_ERROR", name: "CAMERA_ERROR" }),
        ],
      },
    ];
    cy.intercept("**/api/instruments/alerts", alertList);
    cy.intercept("**/api/device/status", [instrumentStatus]);

    cy.visit("/");
    cy.contains("SediVue Dx").click();
    cy.getByTestId("alert-modal-content").as("modal").should("be.visible");
    //assert alert modal presence and number of expected messages

    cy.get(".spot-modal__secondary-title")
      .contains("Alert | SediVue Dx")
      .should("be.visible");

    // First alert uses default unmapped alert text
    cy.get('.spot-paging__button:contains("1")').should("be.visible");
    cy.get(".spot-modal__copy").contains(
      "The instrument has reported an alert. Please see the instrument for more information."
    );
    cy.get(".spot-modal__title").should("be.empty");
    // Second alert shows alert-provided default text
    cy.get('.spot-paging__button:contains("2")').should("be.visible").click();
    cy.get(".spot-modal__copy").contains("This is the default alert text.");
    cy.get(".spot-modal__title").should("be.empty");
    // Last alert is mapped
    cy.get('.spot-paging__button:contains("3")').should("be.visible").click();
    cy.get(".spot-modal__copy").contains(
      "Camera error. Please contact IDEXX Support."
    );
    cy.get(".spot-modal__title")
      .should("not.be.empty")
      .contains("Camera Error");

    // Assert navigation to instruments page
    cy.url().should("contain", `instruments/${instrumentStatus.instrument.id}`);
  });

  describe("alert count labels", () => {
    const instrumentStatus = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
      }),
      instrumentStatus: InstrumentStatus.Alert,
      connected: true,
    });

    beforeEach(() => {
      cy.intercept("**/api/device/status", [instrumentStatus]);
    });

    const cases = [
      [2, "2"],
      [8, "8"],
      [9, "9+"],
      [12, "9+"],
    ] as const;

    cases.forEach(([count, label]) => {
      it(`shows alerts count label ${label} when insturment has ${count} alerts`, () => {
        const alerts = [
          randomInstrumentAlertDto({
            instrumentId: instrumentStatus.instrument.id,
            alerts: Array.from({ length: count }).map(randomAlertDto),
          }),
        ];
        cy.intercept("**/api/instruments/alerts", alerts);

        cy.visit("/");
        cy.getByTestId("alerted-instrument-pill").contains(label);
      });
    });
  });
});
