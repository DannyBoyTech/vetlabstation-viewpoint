import {
  InstrumentType,
  LabRequestRecordDto,
  ServiceCategory,
  SettingTypeEnum,
  UriSedImageDto,
  PimsConnectionType,
  PimsTransmissionType,
} from "@viewpoint/api";
import { randomInstrumentRun, randomLabRequest } from "@viewpoint/test-utils";

beforeEach(() => {
  cy.intercept({ pathname: "**/device/status" }, []);
});

describe("image viewer", () => {
  it("displays sedivue images marked for record by the instrument on the results page", () => {
    cy.fixture("sedivue-images/metadata.json").then(
      (images: UriSedImageDto[]) => {
        const labRequest = setupResultsPage(images);

        cy.visit(`/labRequest/${labRequest.id}`);
        cy.wait("@getImageData");

        // Verify thumbnails are displayed for the instrument marked images only
        images.forEach((imageData) => {
          cy.getByTestId(
            `results-page-image-thumbnail-${imageData.imageUuid}`
          ).should(
            imageData.markedForPermanentRecordByInstrument
              ? "be.visible"
              : "not.exist"
          );
        });
      }
    );
  });

  it("displays summary view for the sedivue images", () => {
    cy.fixture("sedivue-images/metadata.json").then(
      (images: UriSedImageDto[]) => {
        const labRequest = setupResultsPage(images);

        cy.visit(`/labRequest/${labRequest.id}`);
        cy.wait("@getImageData");

        const instrumentMarkedImages = images.filter(
          (id) => id.markedForPermanentRecordByInstrument
        );
        const userMarkedImages = images.filter(
          (id) => id.markedForPermanentRecordByUser
        );
        const theRest = images.filter(
          (id) =>
            !id.markedForPermanentRecordByInstrument &&
            !id.markedForPermanentRecordByUser
        );

        // Open the image viewer modal
        cy.getByTestId(
          `results-page-image-thumbnail-${instrumentMarkedImages[0].imageUuid}`
        ).click();

        cy.getByTestId("image-viewer-modal").should("be.visible");

        // First three images on top should be instrument selected
        instrumentMarkedImages.forEach((id) =>
          cy
            .getByTestId(`image-viewer-summary-image-preview-${id.imageUuid}`)
            .should("be.visible")
            .getByTestId(
              `image-viewer-summary-marked-for-record-${id.imageUuid}`
            )
            .should("not.exist")
        );
        // Next one should be marked by user
        userMarkedImages.forEach((id) =>
          cy
            .getByTestId(`image-viewer-summary-image-preview-${id.imageUuid}`)
            .should("be.visible")
            .getByTestId(
              `image-viewer-summary-marked-for-record-${id.imageUuid}`
            )
            .should("be.visible")
        );

        // 2 of the rest should be visible, the rest should not
        theRest
          .slice(0, 2)
          .forEach((id) =>
            cy
              .getByTestId(`image-viewer-summary-image-preview-${id.imageUuid}`)
              .should("be.visible")
              .getByTestId(
                `image-viewer-summary-marked-for-record-${id.imageUuid}`
              )
              .should("not.exist")
          );
        theRest
          .slice(2)
          .forEach((id) =>
            cy
              .getByTestId(`image-viewer-summary-image-preview-${id.imageUuid}`)
              .should("not.exist")
          );

        // Page over, the rest should now be visible
        cy.getByTestId("paginator-next-button").should("be.enabled").click();
        theRest
          .slice(2)
          .forEach((id) =>
            cy
              .getByTestId(`image-viewer-summary-image-preview-${id.imageUuid}`)
              .should("be.visible")
          );
      }
    );
  });

  it("allows user to mark an image for permanent record", () => {
    cy.fixture("sedivue-images/metadata.json").then(
      (images: UriSedImageDto[]) => {
        const labRequest = setupResultsPage(images);

        // Set up intercept for saving selection status
        cy.intercept(
          `**/instrumentRun/${
            labRequest.instrumentRunDtos[0]!.id
          }/userImageSelectionStatus`,
          ""
        ).as("updateSelections");

        cy.visit(`/labRequest/${labRequest.id}`);
        cy.wait("@getImageData");

        const userMarkedImages = images.filter(
          (id) => id.markedForPermanentRecordByUser
        );
        const theRest = images.filter(
          (id) =>
            !id.markedForPermanentRecordByInstrument &&
            !id.markedForPermanentRecordByUser
        );

        // Open the image viewer modal
        cy.getByTestIdContains(`results-page-image-thumbnail`).first().click();

        const nonSelectedImage = theRest[0];
        const selectedImage = userMarkedImages[0];

        // Deselect the marker for the first user-selected image
        cy.getByTestId(
          `image-viewer-summary-marked-for-record-${selectedImage.imageUuid}`
        )
          .should("be.visible")
          .click();

        // Verify the non-selected image is not marked
        cy.getByTestId(
          `image-viewer-summary-marked-for-record-${nonSelectedImage.imageUuid}`
        ).should("not.exist");

        // Select the marker for the first non-selected image
        cy.getByTestId(
          `image-viewer-summary-add-to-record-${nonSelectedImage.imageUuid}`
        ).click();

        // Verify it's marked now
        cy.getByTestId(
          `image-viewer-summary-marked-for-record-${nonSelectedImage.imageUuid}`
        ).should("be.visible");

        // Close the modal to save the selection
        cy.getByTestId("image-viewer-modal")
          .find(".spot-modal__header-cancel-button-icon")
          .eq(0)
          .click();

        cy.wait("@updateSelections")
          .its(`request.body`)
          .should((body) => expect(body[selectedImage.imageUuid]).to.eq(false))
          .should((body) =>
            expect(body[nonSelectedImage.imageUuid]).to.eq(true)
          );
      }
    );
  });

  it("indicates number of images saved to record, not to exceed 6", () => {
    cy.fixture("sedivue-images/metadata.json").then(
      (images: UriSedImageDto[]) => {
        const labRequest = setupResultsPage(images);

        // Set up intercept for saving selection status
        cy.intercept(
          `**/instrumentRun/${
            labRequest.instrumentRunDtos[0]!.id
          }/userImageSelectionStatus`,
          ""
        ).as("updateSelections");

        cy.visit(`/labRequest/${labRequest.id}`);
        cy.wait("@getImageData");

        const theRest = images.filter(
          (id) =>
            !id.markedForPermanentRecordByInstrument &&
            !id.markedForPermanentRecordByUser
        );

        // Open the image viewer modal
        cy.getByTestIdContains(`results-page-image-thumbnail`).first().click();

        // Should be 4 total (3 from image, one from user)
        cy.getByTestId("image-viewer-modal").contains("4 images in record");

        // Select one more
        cy.getByTestId(
          `image-viewer-summary-add-to-record-${theRest[0].imageUuid}`
        ).click();

        // Should be 5 total now (3 from image, 2 from user)
        cy.getByTestId("image-viewer-modal").contains("5 images in record");

        // Select one more
        cy.getByTestId(
          `image-viewer-summary-add-to-record-${theRest[1].imageUuid}`
        ).click();

        // Maxed out
        cy.getByTestId("image-viewer-modal").contains(
          "Maximum number of images selected"
        );

        // Go to the next page and try to select a 7th image, should not be able to
        cy.getByTestId("paginator-next-button").should("be.enabled").click();
        // Select one more
        cy.getByTestId(
          `image-viewer-summary-add-to-record-${theRest[2].imageUuid}`
        ).click();
        // It should still be unselected
        // Verify it's marked now
        cy.getByTestId(
          `image-viewer-summary-marked-for-record-${theRest[2].imageUuid}`
        ).should("not.exist");
      }
    );
  });
});

describe("detailed image view", () => {
  it("allows viewing of image info when info button is selected", () => {
    cy.fixture("sedivue-images/metadata.json").then(
      (images: UriSedImageDto[]) => {
        const labRequest = setupResultsPage(images);

        cy.visit(`/labRequest/${labRequest.id}`);
        cy.wait("@getImageData");

        // Open the image viewer modal
        cy.getByTestIdContains(`results-page-image-thumbnail`).first().click();

        const selectedImage = images.filter(
          (id) => id.markedForPermanentRecordByUser
        )[0];

        // Open detailed view
        cy.getByTestId(
          `image-viewer-summary-image-preview-${selectedImage.imageUuid}`
        ).click();

        // Verify the toolbar is present
        cy.getByTestId(`image-viewer-detailed-view-toolbar`).should(
          "be.visible"
        );

        // Open the info popover
        cy.getByTestId(`image-viewer-detailed-view-info-button`).click();

        cy.getByTestId("image-viewer-detailed-info-image-number").contains(
          selectedImage.index
        );

        cy.getByTestId("image-viewer-detailed-info-image-id").contains(
          selectedImage.referenceId
        );
      }
    );
  });

  it("allows adjusting zoom level", () => {
    cy.fixture("sedivue-images/metadata.json").then(
      (images: UriSedImageDto[]) => {
        const labRequest = setupResultsPage(images);

        cy.visit(`/labRequest/${labRequest.id}`);
        cy.wait("@getImageData");

        // Open the image viewer modal
        cy.getByTestIdContains(`results-page-image-thumbnail`).first().click();

        const selectedImage = images.filter(
          (id) => id.markedForPermanentRecordByUser
        )[0];

        // Open detailed view
        cy.getByTestId(
          `image-viewer-summary-image-preview-${selectedImage.imageUuid}`
        ).click();

        cy.getByTestId("image-viewer-detailed-view-top-bar").should(
          "be.visible"
        );

        // Default magnification is 100%
        cy.getByTestId("image-viewer-magnification-level").contains("100%");

        // Zoom out is disabled
        cy.getByTestId("image-viewer-detailed-zoom-out").should("be.disabled");

        // Zoom in up to 250%
        cy.getByTestId("image-viewer-detailed-zoom-in").click();
        cy.getByTestId("image-viewer-magnification-level").contains("150%");
        cy.getByTestId("image-viewer-detailed-zoom-in").click();
        cy.getByTestId("image-viewer-magnification-level").contains("200%");
        cy.getByTestId("image-viewer-detailed-zoom-in").click();
        cy.getByTestId("image-viewer-magnification-level").contains("250%");

        // Zoom in is disabled
        cy.getByTestId("image-viewer-detailed-zoom-in").should("be.disabled");

        // Zoom back out
        cy.getByTestId("image-viewer-detailed-zoom-out").click();
        cy.getByTestId("image-viewer-magnification-level").contains("200%");
        cy.getByTestId("image-viewer-detailed-zoom-out").click();
        cy.getByTestId("image-viewer-magnification-level").contains("150%");
        cy.getByTestId("image-viewer-detailed-zoom-out").click();
        cy.getByTestId("image-viewer-magnification-level").contains("100%");

        // Zoom out is disabled
        cy.getByTestId("image-viewer-detailed-zoom-out").should("be.disabled");
      }
    );
  });

  it("allows marking images for record", () => {
    cy.fixture("sedivue-images/metadata.json").then(
      (images: UriSedImageDto[]) => {
        const labRequest = setupResultsPage(images);
        cy.intercept(
          `**/instrumentRun/${
            labRequest.instrumentRunDtos[0]!.id
          }/userImageSelectionStatus`,
          ""
        ).as("updateSelections");

        cy.visit(`/labRequest/${labRequest.id}`);
        cy.wait("@getImageData");

        // Open the image viewer modal
        cy.getByTestIdContains(`results-page-image-thumbnail`).first().click();

        const selectedImage = images.filter(
          (id) =>
            !id.markedForPermanentRecordByUser &&
            !id.markedForPermanentRecordByInstrument
        )[0];

        // Open detailed view
        cy.getByTestId(
          `image-viewer-summary-image-preview-${selectedImage.imageUuid}`
        ).click();

        // Verify not marked for record
        cy.getByTestId(`image-viewer-detailed-marked-for-record`).should(
          "not.exist"
        );

        // Mark it
        cy.getByTestId(`image-viewer-detailed-add-to-record`).click();

        // Verify it's been marked
        cy.getByTestId(`image-viewer-detailed-marked-for-record`).should(
          "be.visible"
        );

        // Close modal and verify call to server
        cy.getByTestId("image-viewer-modal")
          .find(".spot-modal__header-cancel-button-icon")
          .eq(0)
          .click();

        cy.wait("@updateSelections")
          .its(`request.body.${selectedImage.imageUuid}`)
          .should("eq", true);
      }
    );
  });

  it("allows paging through images", () => {
    cy.fixture("sedivue-images/metadata.json").then(
      (images: UriSedImageDto[]) => {
        const labRequest = setupResultsPage(images);

        cy.visit(`/labRequest/${labRequest.id}`);
        cy.wait("@getImageData");

        // Open the image viewer modal
        cy.getByTestIdContains(`results-page-image-thumbnail`).first().click();

        const firstImage = images[0];
        const secondImage = images[1];

        // Open detailed view
        cy.getByTestId(
          `image-viewer-summary-image-preview-${firstImage.imageUuid}`
        ).click();

        // Open the info popover to verify which image we're on
        cy.getByTestId(`image-viewer-detailed-view-info-button`).click();
        cy.getByTestId("image-viewer-detailed-info-image-number").contains(
          firstImage.index
        );
        cy.getByTestId("image-viewer-detailed-info-image-id").contains(
          firstImage.referenceId
        );

        cy.getByTestId("paginator-back-button").should("be.disabled");

        // Click next to go to the next image
        cy.getByTestId("paginator-next-button").click();
        cy.getByTestId(`image-viewer-detailed-view-info-button`).click();
        cy.getByTestId("image-viewer-detailed-info-image-number").contains(
          secondImage.index
        );
        cy.getByTestId("image-viewer-detailed-info-image-id").contains(
          secondImage.referenceId
        );

        // Click back to go to the previous image
        cy.getByTestId("paginator-back-button").click();
        cy.getByTestId(`image-viewer-detailed-view-info-button`).click();
        cy.getByTestId("image-viewer-detailed-info-image-number").contains(
          firstImage.index
        );
        cy.getByTestId("image-viewer-detailed-info-image-id").contains(
          firstImage.referenceId
        );
      }
    );
  });

  it("allows printing and sending a detailed image view", () => {
    cy.intercept({ pathname: "**/labReportWithImageData*" }, "").as(
      "pdfReport"
    );
    cy.intercept({ pathname: "**/sendReportWithImage*" }, "").as("sendToPims");

    cy.fixture("sedivue-images/metadata.json").then(
      (images: UriSedImageDto[]) => {
        cy.intercept(
          { pathname: "**/api/settings", method: "GET" },
          {
            [SettingTypeEnum.PIMS_TRANSMIT_RESULTS]:
              PimsTransmissionType.TRANSMIT_RESULTS_AND_REPORT,
            [SettingTypeEnum.PIMS_CONNECTION_TYPE]: PimsConnectionType.NETWORK,
          }
        );
        cy.intercept("**/api/labRequest/**/sentToPims", "true");
        cy.intercept("**/api/labRequest/**/sentToPims", "true");
        const labRequest = setupResultsPage(images);

        cy.visit(`/labRequest/${labRequest.id}`);
        cy.wait("@getImageData");

        // Open the image viewer modal
        cy.getByTestIdContains(`results-page-image-thumbnail`).first().click();

        const firstImage = images[0];

        // Open detailed view
        cy.getByTestId(
          `image-viewer-summary-image-preview-${firstImage.imageUuid}`
        ).click();

        cy.getByTestId(`image-viewer-detailed-crop`).click();
        cy.getByTestId(`image-viewer-detailed-print`).click();
        cy.wait("@pdfReport");

        cy.getByTestId("print-modal").within((modal) => {
          cy.wrap(modal).find("iframe").should("be.visible");
          cy.wrap(modal).find('[data-testid="later-button"]').click();
        });

        cy.getByTestId("send-to-pims-button").click();
        cy.wait("@pdfReport");

        cy.getByTestId("resend-modal").within((modal) => {
          cy.wrap(modal).find("iframe").should("be.visible");
          cy.wrap(modal).find('[data-testid="done-button"]').click();
        });

        cy.wait("@sendToPims");
      }
    );
  });
});

const setupResultsPage = (images: UriSedImageDto[]) => {
  const labRequest = randomLabRequest({
    id: 10,
    instrumentRunDtos: [
      randomInstrumentRun({
        id: 100,
        instrumentType: InstrumentType.SediVueDx,
        serviceCategory: ServiceCategory.Urinalysis,
      }),
    ],
  });

  cy.intercept({ pathname: "**/api/labRequest/10" }, labRequest).as(
    "fetchLabRequest"
  );
  cy.intercept({ pathname: "**/labRequestRecords" }, [
    {
      labRequestId: labRequest.id,
      labRequestDate: labRequest.requestDate,
      deviceUsageMap: {},
    },
  ] as LabRequestRecordDto[]);
  cy.intercept({ pathname: "**/instrumentRun/100/images" }, images).as(
    "getImageData"
  );

  // Don't really care about which image is displayed
  cy.intercept("**/sedivue-images/images/thumbnail/**", {
    fixture: `sedivue-images/images/thumbnail/${images[0].index
      .toString()
      .padStart(2, "0")}-${images[0].imageUuid.toUpperCase()}.png`,
  });

  cy.intercept("**/sedivue-images/images/**", {
    fixture: `sedivue-images/images/${images[0].index
      .toString()
      .padStart(2, "0")}-${images[0].imageUuid.toUpperCase()}.png`,
  });

  return labRequest;
};
