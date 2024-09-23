import { interceptRequestsForHomeScreen } from "./../util/default-intercepts";

const messages = [
  {
    category: "IDEXX VetLab UA",
    dateFirstViewed: "2023-08-24T10:25:11.778-05:00",
    dateLastViewed: "2023-08-24T11:27:25.467-05:00",
    dateReceived: "2023-08-24T08:02:43.076-05:00",
    guid: "NTF-06-29284-00",
    notificationId: 1,
    printCount: 0,
    printFile: "ccl-06-29284-00 NTF.pdf",
    rootDirectory: "C:\\IDEXX\\LabStation\\messages\\NTF-06-29284-00",
    subject: "Avoid errors with easy daily maintenance",
    unread: true,
    version: 1,
    viewCount: 2,
    viewFile: "English UA notification.htm",
    viewFileEncoding: "UTF-8",
  },
  {
    category: "SediVue Dx",
    dateFirstViewed: "2023-08-24T08:07:27.657-05:00",
    dateLastViewed: "2023-08-24T11:27:33.839-05:00",
    dateReceived: "2023-08-24T08:03:13.039-05:00",
    guid: "NTF-06-0017221-00",
    languageCode: "en",
    notificationId: 2,
    printCount: 0,
    printFile:
      "en\\ccl-06-0017221-00 Urinalysis Interpretive Comments Feature Notification.pdf",
    rootDirectory: "C:\\IDEXX\\LabStation\\messages\\NTF-06-0017221-00",
    subject: "Update: Urinalysis interpretive comments",
    unread: true,
    version: 3,
    viewCount: 5,
    viewFile:
      "en\\ccl-06-0017221-00 Urinalysis Interpretive Comments Feature Notification.pdf",
    viewFileEncoding: "Cp1252",
  },
  {
    category: "VetConnect PLUS",
    dateFirstViewed: "2023-08-24T09:08:15.787-05:00",
    dateLastViewed: "2023-08-24T11:27:38.333-05:00",
    dateReceived: "2023-08-24T09:08:13.359-05:00",
    guid: "NTF-06-0002152-00",
    languageCode: "en",
    notificationId: 3,
    printCount: 0,
    printFile:
      "en\\ccl-06-0002152-00 VetConnectPLUS Activation notification United Kingdom.pdf",
    rootDirectory: "C:\\IDEXX\\LabStation\\messages\\NTF-06-0002152-00",
    subject: "Finish Your Activation Today!",
    unread: true,
    version: 2,
    viewCount: 4,
    viewFile: "en\\UK VetConnect PLUS notification.htm",
    viewFileEncoding: "UTF-8",
  },
  {
    category: "Catalyst One (2.13)",
    dateFirstViewed: "2023-08-24T10:26:11.489-05:00",
    dateLastViewed: "2023-08-24T10:26:11.489-05:00",
    dateReceived: "2023-08-22T18:12:34.599-05:00",
    guid: "NTF-06-0003978-35",
    languageCode: "en",
    notificationId: 4,
    printCount: 0,
    printFile:
      "en\\ccl-06-0003978-35 CatOne SmartService upgrade notification_EN.pdf",
    rootDirectory: "C:\\IDEXX\\LabStation\\messages\\NTF-06-0003978-35",
    subject: "Upgrade Software",
    unread: false,
    version: 3,
    viewCount: 1,
    viewFile:
      "en\\ccl-06-0003978-35 CatOne SmartService upgrade notification_EN.pdf",
    viewFileEncoding: "Cp1252",
  },
];

const messageCount = { unreadCount: 3, totalCount: 3 };

describe("message center", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept("POST", "**/api/notifications/4/unread").as("unreadRequest");
    cy.intercept("DELETE", "**/api/notifications/4").as("deleteRequest");
  });

  it("should allow navigation to the message center and show received messages", () => {
    cy.intercept("**/api/notifications/counts", messageCount);
    cy.intercept("**/api/notifications", messages);
    cy.visit("/");
    //Assert presence of message icon
    cy.getByTestId("messages-icon").should("be.visible");
    cy.getByTestId("messages-icon").as("indicator").click();
    cy.containedWithinTestId("header-left", "Message Center");
    cy.containedWithinTestId("message-center", "Messages");
    cy.containedWithinTestId("message-center", "Category");
    cy.containedWithinTestId("message-center", "Subject");
    cy.containedWithinTestId("message-center", "Received");
    cy.get('[role="cell"]').eq(0).should("contain.text", "VetConnect PLUS");
    cy.get('[role="cell"]')
      .eq(1)
      .should("contain.text", "Finish Your Activation Today!");
    cy.get('[role="cell"]').eq(2).should("contain.text", "8/24/23");
    cy.get('[role="cell"]').eq(3).should("contain.text", "SediVue Dx");
    cy.get('[role="cell"]')
      .eq(4)
      .should("contain.text", "Update: Urinalysis interpretive comments");
    cy.get('[role="cell"]').eq(5).should("contain.text", "8/24/23");
    cy.get('[role="cell"]').eq(6).should("contain.text", "IDEXX VetLab UA");
    cy.get('[role="cell"]')
      .eq(7)
      .should("contain.text", "Avoid errors with easy daily maintenance");
    cy.get('[role="cell"]').eq(8).should("contain.text", "8/24/23");
  });

  it("should allow a user to view received messages", () => {
    cy.intercept("**/api/notifications/counts", messageCount);
    cy.intercept("**/api/notifications", messages);
    cy.visit("/messages");
    cy.getByTestId("view-button").should("be.visible");
    cy.getByTestId("mark-unread-button").should("be.visible");
    cy.getByTestId("delete-button").should("be.visible");
    cy.getByTestId("back-button").should("be.visible");
    //verify button behaviors after an unread message selection
    cy.contains("VetConnect PLUS").click();
    cy.getByTestId("view-button").should("be.enabled");
    cy.getByTestId("delete-button").should("be.enabled");
    cy.getByTestId("mark-unread-button").should("not.be.enabled");
    cy.getByTestId("view-button").as("view").click();
    cy.contains("Print").should("be.visible");
    cy.contains("Cancel").should("be.visible");
    cy.contains("Cancel").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/messages`);
  });

  it("should allow a user to mark a message as unread", () => {
    cy.intercept("**/api/notifications/counts", messageCount);
    cy.intercept("**/api/notifications", messages);
    cy.visit("/messages");
    cy.contains("Catalyst One").click();
    //verify button behavior after a previously viewed message is selected
    cy.getByTestId("mark-unread-button").should("be.enabled");
    cy.getByTestId("mark-unread-button").as("markUnread").click();
    cy.wait("@unreadRequest");
  });

  it("should allow user to delete a message", () => {
    cy.intercept("**/api/notifications/counts", messageCount);
    cy.intercept("**/api/notifications", messages);
    cy.visit("/");
    cy.getByTestId("messages-icon").as("indicator").click();
    cy.contains("Catalyst One").click();
    cy.getByTestId("delete-button").as("delete").click();
    cy.containedWithinTestId("confirm-message-delete", "Delete Message");
    cy.containedWithinTestId(
      "confirm-message-delete",
      "Are you sure you want to delete this message?"
    );
    cy.containedWithinTestId("confirm-message-delete", "Cancel");
    cy.containedWithinTestId("confirm-message-delete", "Delete");
    cy.getByTestId("done-button").as("delete").click();
    cy.wait("@deleteRequest");
    cy.contains("Back").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
