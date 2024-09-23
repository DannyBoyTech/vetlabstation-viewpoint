import {
  VcpConfigurationDto,
  VcpActivationResult,
  VcpActivationRequestDto,
} from "@viewpoint/api";
import faker from "faker";
import { interceptGlobalRequests } from "../../util/default-intercepts";

describe("VetConnect PLUS settings", () => {
  beforeEach(() => {
    interceptGlobalRequests();
  });

  describe("disconnected customers", () => {
    beforeEach(() => {
      const disconnectedConfig: VcpConfigurationDto = {
        dxPortalEnabled: false,
        vcpActivated: false,
      };
      cy.intercept("**/api/vcp/configuration", disconnectedConfig);
      cy.visit("settings/vet_connect_plus");
    });

    it("allows users to connect to VC+ if they are not currently connected", () => {
      const credentials: VcpActivationRequestDto = {
        username: faker.datatype.uuid(),
        password: faker.datatype.uuid(),
      };
      cy.intercept(
        "**/api/vcp/activate",
        JSON.stringify(VcpActivationResult.SUCCESS)
      ).as("activate");
      // Click "connect" button
      cy.getByTestId("vcp-settings-connect-button").click();
      // verify URL
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}/settings/vet_connect_plus/activate`
      );
      // next button is disabled until un/pw have text entered
      cy.getByTestId("vcp-activation-next-button").as("nextButton");
      cy.get("@nextButton").should("be.disabled");
      cy.getByTestId("vcp-activation-un-input").type(credentials.username);
      cy.get("@nextButton").should("be.disabled");
      cy.getByTestId("vcp-activation-pw-input").type(credentials.password);
      // activate
      cy.get("@nextButton").should("be.enabled").click();

      // verify request body
      cy.wait("@activate")
        .its("request.body")
        .should("deep.equal", credentials);
      // verify we're back on the regular VC+ settings screen
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}/settings/vet_connect_plus`
      );
    });

    it("notifies user when entering an incorrect username/password", () => {
      cy.intercept(
        "**/api/vcp/activate",
        JSON.stringify(VcpActivationResult.INVALID_USER_PASSWORD)
      ).as("activate");

      cy.visit("settings/vet_connect_plus/activate");
      cy.getByTestId("vcp-activation-un-input").type(faker.datatype.uuid());
      cy.getByTestId("vcp-activation-pw-input").type(faker.datatype.uuid());
      cy.getByTestId("vcp-activation-next-button").click();

      cy.getByTestId(
        `vcp-activation-error-modal-${VcpActivationResult.INVALID_USER_PASSWORD}`
      )
        .as("errorModal")
        .should("be.visible")
        .getByTestId("done-button")
        .click();

      cy.wait("@activate");

      cy.get("@errorModal").should("not.exist");
    });

    it("notifies user when VC+ is not reachable", () => {
      cy.intercept(
        "**/api/vcp/activate",
        JSON.stringify(VcpActivationResult.NOT_REACHABLE)
      ).as("activate");

      cy.visit("settings/vet_connect_plus/activate");
      cy.getByTestId("vcp-activation-un-input").type(faker.datatype.uuid());
      cy.getByTestId("vcp-activation-pw-input").type(faker.datatype.uuid());
      cy.getByTestId("vcp-activation-next-button").click();

      cy.getByTestId(
        `vcp-activation-error-modal-${VcpActivationResult.NOT_REACHABLE}`
      )
        .as("errorModal")
        .should("be.visible")
        .getByTestId("done-button")
        .click();

      cy.wait("@activate");

      cy.get("@errorModal").should("not.exist");
    });

    it("notifies user when an unexpected error occurs", () => {
      cy.intercept("**/api/vcp/activate", { statusCode: 500 }).as("activate");

      cy.visit("settings/vet_connect_plus/activate");
      cy.getByTestId("vcp-activation-un-input").type(faker.datatype.uuid());
      cy.getByTestId("vcp-activation-pw-input").type(faker.datatype.uuid());
      cy.getByTestId("vcp-activation-next-button").click();

      cy.getByTestId(`vcp-activation-error-modal-unknown`)
        .as("errorModal")
        .should("be.visible")
        .getByTestId("done-button")
        .click();

      cy.wait("@activate");

      cy.get("@errorModal").should("not.exist");
    });
  });

  describe("connected customers", () => {
    beforeEach(() => {
      const connectedConfig: VcpConfigurationDto = {
        dxPortalEnabled: true,
        vcpActivated: true,
      };
      cy.intercept("**/api/vcp/configuration", connectedConfig).as("config");
      cy.visit("settings/vet_connect_plus");
    });

    it("allows users to disconnect from VC+ if they are already connected", () => {
      cy.intercept("**/api/vcp/deactivate").as("deactivate");
      cy.wait("@config");

      cy.intercept("**/api/vcp/configuration", {
        dxPortalEnabled: false,
        vcpActivated: false,
      });
      cy.getByTestId("vcp-settings-disconnect-button")
        .as("disconnectBtn")
        .click();

      cy.containedWithinTestId("modal", "Disconnect VetConnect PLUS");
      cy.containedWithinTestId(
        "modal",
        "Are you sure you want to disconnect your IDEXX VetConnect PLUS account from the IDEXX VetLab Station?"
      );
      cy.containedWithinTestId("modal", "Stay Connected");
      cy.containedWithinTestId("modal", "Disconnect");
      cy.getByTestId("vcp-confirm-disconnect")
        .as("confirmDisconnectBtn")
        .click();

      cy.wait("@deactivate");
      cy.get("@disconnectBtn").should("not.exist");
      cy.getByTestId("vcp-settings-connect-button").should("be.visible");
    });

    it("allows user to test the connection", () => {
      cy.intercept("**/api/vcp/connection/test", "true").as("testConnection");
      cy.getByTestId("vcp-settings-test-connection-button")
        .as("testConnectionBtn")
        .click();

      cy.wait("@testConnection");

      cy.getByTestId("vcp-settings-test-connection-modal-success")
        .should("be.visible")
        .getByTestId("done-button")
        .click();

      cy.intercept("**/api/vcp/connection/test", "false").as("testConnection");
      cy.get("@testConnectionBtn").click();

      cy.getByTestId("vcp-settings-test-connection-modal-failure")
        .should("be.visible")
        .getByTestId("done-button")
        .click();
    });
  });
});
