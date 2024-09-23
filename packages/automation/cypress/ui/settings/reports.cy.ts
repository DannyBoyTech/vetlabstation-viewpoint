const headerEnabled = {
  PRINT_LINES_FOR_LETTERHEAD: "3",
  PRINT_HEADER_LINE_2: "This is a header 2",
  PRINT_HEADER_LINE_1: "This is a header 1",
  PRINT_HEADER_LINE_3: "This is a header 3",
  PRINT_REPORT_HEADER_OPTION: "PrintHeader",
};

const headerDisabled = {
  PRINT_LINES_FOR_LETTERHEAD: "10",
  PRINT_HEADER_LINE_2: "This is a header 2",
  PRINT_HEADER_LINE_1: "This is a header 1",
  PRINT_HEADER_LINE_3: "This is a header 3",
  PRINT_REPORT_HEADER_OPTION: "LeaveHeaderSpace",
};

describe("Settings/Reports", () => {
  beforeEach(() => {
    cy.intercept({ pathname: "**/api/settings", method: "GET" }, {}).as(
      "get-settings"
    );
  });
  it("should allow navigation to Reports screen and show current settings ", () => {
    cy.visit("/settings/reports");
    cy.wait("@get-settings");
    cy.getByTestId("results-order-section").should("be.visible");
    cy.getByTestId("report-format-section").should("be.visible");
    cy.getByTestId("reports-hematology-section").should("be.visible");
    cy.getByTestId("out-of-range-section").should("be.visible");
    cy.getByTestId("reports-urinalysis-section").should("be.visible");
  });

  it("should allow navigation to Reports screen and modify settings ", () => {
    cy.visit("/settings/reports");
    cy.wait("@get-settings");
    cy.getByTestId("results-order-selection").select("Standard");
    cy.getByTestId("report-format-selection").select("Standard");
    cy.getByTestId("message-codes-selection").select("Short Text");
    cy.getByTestId("out-of-range-high").select("Blue");
    cy.getByTestId("out-of-range-low").select("Blue");
    cy.getByTestId("urinalysis-abnormal-color").select("Blue");
    //simulate toggling setting for English assay names, dot plot charts and Results based comments by intercepting update
    cy.getByTestId("header-left").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should allow navigation to the Edit Reports Header screen ", () => {
    cy.intercept(
      { pathname: "**/api/settings", method: "GET" },
      headerEnabled
    ).as("print-settings");
    cy.visit("/settings/reports");
    cy.wait("@print-settings");
    cy.getByTestId("edit-header-button").click();
    cy.containedWithinTestId("header-left", "Edit Report Header");
    cy.getByTestId("report-header-settings-print-header-toggle").should(
      "exist"
    );
    cy.containedWithinTestId("edit-header-main", "Print a header on reports");
    cy.containedWithinTestId("edit-header-main", "Line 1");
    cy.containedWithinTestId("edit-header-main", "Line 2");
    cy.containedWithinTestId("edit-header-main", "Line 3");
    cy.getByTestId("report-header-settings-line1-input").should(
      "have.value",
      "This is a header 1"
    );
    cy.getByTestId("report-header-settings-line2-input").should(
      "have.value",
      "This is a header 2"
    );
    cy.getByTestId("report-header-settings-line3-input").should(
      "have.value",
      "This is a header 3"
    );
    cy.getByTestId("edit-header-main-ok").should("be.visible");
    cy.getByTestId("edit-header-main-cancel").should("be.visible");
  });

  it("should allow navigation to the Edit Reports Header screen and modify settings ", () => {
    cy.intercept(
      { pathname: "**/api/settings", method: "GET" },
      headerEnabled
    ).as("print-settings");
    cy.visit("/settings/reports");
    cy.wait("@print-settings");
    cy.getByTestId("edit-header-button").click();
    //edit header line text
    cy.getByTestId("report-header-settings-line1-input").type(
      "Happy Pet Animal Clinic Test Report"
    );
    cy.intercept(
      "**/api/settings?setting=PRINT_HEADER_LINE_1&setting=PRINT_HEADER_LINE_2&setting=PRINT_HEADER_LINE_3&setting=PRINT_REPORT_HEADER_OPTION&setting=PRINT_LINES_FOR_LETTERHEAD",
      headerDisabled
    );
    cy.getByTestId("report-header-settings-print-header-toggle").click({
      force: true,
    });
    cy.containedWithinTestId("edit-header-main", "Blank lines for letterhead");
    //verify number of blank lines selected using intercept
    cy.getByTestId("report-header-settings-print-lines-dropdown").should(
      "have.value",
      "10"
    );
    cy.getByTestId("edit-header-main-ok").should("be.visible");
    cy.getByTestId("edit-header-main-cancel").should("be.visible");
  });
});
