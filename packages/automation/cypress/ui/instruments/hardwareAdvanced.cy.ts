const pingResult = "true";
const router = {
  "@class": "com.idexx.labstation.core.dto.IvlsRouterDto",
  routerType: "BUFFALO_WIRELESS",
  modelName: "WZR-600DHP",
  smartServiceModelName: "Buffalo WZR-600DHP",
  ipAddress: "10.11.185.33",
  localIpAddress: "192.168.222.1",
  defaultLocalIpAddress: "192.168.222.1",
  gateway: "10.11.185.1",
  primaryDnsServer: "208.67.222.222",
  subnetMask: "255.255.255.0",
  wanIpChoice: "DYNAMIC",
  wanIpChoices: ["DYNAMIC", "STATIC"],
  wireless: true,
  wirelessEnabled: false,
  wirelessPassphrase: "ThisIsAWirelessPassPhrase",
};

describe("system hardware advanced", () => {
  it("should allow navigation to System Hardware Advanced screen and show network data", () => {
    cy.intercept("**/api/device/status", []);
    cy.intercept("**/api/router", router);
    cy.visit("/system");
    cy.getByTestId("advanced-link").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/system/advanced`);
    cy.containedWithinTestId("system-advanced-main", "WAN IP");
    cy.containedWithinTestId("system-advanced-main", "IP Address");
    cy.containedWithinTestId("system-advanced-main", "Subnet Mask");
    cy.containedWithinTestId("system-advanced-main", "Default Gateway");
    cy.containedWithinTestId("system-advanced-main", "DNS Server");
    cy.containedWithinTestId("system-advanced-main", "Local IP Address");
    cy.containedWithinTestId("system-advanced-main", "Network Access Test");
    cy.containedWithinTestId("system-advanced-main", "Network IP Address");
    cy.containedWithinTestId("system-advanced-main", "Apply IDEXX Defaults");
    cy.containedWithinTestId("system-advanced-main", "Edit");
    cy.containedWithinTestId("system-advanced-main", "Ping");
    cy.containedWithinTestId("system-advanced-main", "Router Configuration");
    cy.get(".keypad").should("be.visible");
    cy.getByTestId("wireless-settings-button").should("be.visible");
    cy.getByTestId("sys-adv-right-back-button").should("be.visible");
    cy.getByTestId("sys-adv-right-back-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/system`);
  });

  it("should allow navigation to System Hardware Advanced and edit the Router Configuration", () => {
    cy.intercept("**/api/router", router);
    cy.visit("/system/advanced");
    cy.getByTestId("edit-router-config").click();
    cy.getByTestId("wan-ip-select").select("Obtain IP Automatically");
    cy.getByTestId("wan-ip-select").select("Static IP Address");
    cy.getByTestId("apply-idexx-defaults").should("be.enabled");
    cy.getByTestId("apply-router-config-edit").should("be.enabled");
    cy.getByTestId("cancel-router-config-edit").click();
    //capture cancel scenario
    cy.containedWithinTestId("confirm-modal", "Discard Changes");
    cy.containedWithinTestId(
      "confirm-modal",
      "Are you sure you want to exit without saving?"
    );
    cy.getByTestId("later-button").click();
    //ping test
    cy.getByTestId("ping-ip-address").children().eq(0).type("192");
    cy.getByTestId("ping-ip-address").children().eq(1).type("168");
    cy.getByTestId("ping-ip-address").children().eq(2).type("222");
    cy.getByTestId("ping-ip-address").children().eq(3).type("3");
    cy.intercept("POST", "**/api/system/ping", pingResult);
    cy.getByTestId("ping-ip-button").click();
    cy.containedWithinTestId("global-info-modal", "Network Access Test");
    cy.containedWithinTestId(
      "global-info-modal",
      "Ping 192.168.222.3 ... Succeeded."
    );
    cy.getByTestId("done-button").click();
    cy.getByTestId("global-info-modal").should("not.exist");
  });
});
