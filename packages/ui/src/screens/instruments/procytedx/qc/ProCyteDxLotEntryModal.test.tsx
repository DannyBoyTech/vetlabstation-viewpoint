import { describe, expect, it } from "vitest";
import {
  BarcodeStatusEnum,
  CrimsonQcBarcodeResponseDto,
  CrimsonQcBarcodeValidateResponseDto,
  CurrentBarcodeStatusEnum,
  InstrumentStatus,
  InstrumentType,
} from "@viewpoint/api";
import { server } from "../../../../../test-utils/mock-server";
import { rest } from "msw";
import { render } from "../../../../../test-utils/test-utils";
import { ProCyteDxLotEntryModal, TestId } from "./ProCyteDxLotEntryModal";
import { TestId as ContentTestId } from "./ProCyteDxQcLotEntryContent";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ProCyte Dx Lot entry modal", () => {
  describe("next button", () => {
    it("enables the next button when exactly 1 level (3 barcodes) is accepted", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      // Mock the response to include 3 barcodes, 1 level accepted
      mockBarcodeResponse({
        barcodes: [
          randomBarcode({ sequenceNumber: 1 }),
          randomBarcode({ sequenceNumber: 2 }),
          randomBarcode({ sequenceNumber: 3 }),
        ],
        levelTwoComplete: false,
        levelOneComplete: true,
        currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEACCEPTED,
      });
      // Next button is initially disabled
      expect(await screen.findByTestId("done-button")).toBeDisabled();

      // Enter input to trigger validation request
      const input = await screen.findByTestId(ContentTestId.BarcodeInput);
      await userEvent.type(
        input,
        new Array(26)
          .fill(0)
          .map(() => 1)
          .join("")
      );

      await waitFor(async () =>
        expect(await screen.findByTestId("done-button")).toBeEnabled()
      );
    });

    it("enables the next button when exactly 2 levels (6 barcodes) are accepted", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      mockBarcodeResponse({
        barcodes: [
          randomBarcode({ sequenceNumber: 1 }),
          randomBarcode({ sequenceNumber: 2 }),
          randomBarcode({ sequenceNumber: 3 }),
          randomBarcode({ sequenceNumber: 4 }),
          randomBarcode({ sequenceNumber: 5 }),
          randomBarcode({ sequenceNumber: 6 }),
        ],
        levelTwoComplete: true,
        levelOneComplete: true,
        currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEACCEPTED,
      });

      // Enter input to trigger validation request
      const input = await screen.findByTestId(ContentTestId.BarcodeInput);
      await userEvent.type(
        input,
        new Array(26)
          .fill(0)
          .map(() => 1)
          .join("")
      );

      // Next button is enabled
      await waitFor(async () =>
        expect(await screen.findByTestId("done-button")).toBeEnabled()
      );
    });

    it("disables the next button if 1 level is complete but another is partially entered", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      // Mock the response with level 1 complete first
      const firstResponse = {
        barcodes: [
          randomBarcode({ sequenceNumber: 1 }),
          randomBarcode({ sequenceNumber: 2 }),
          randomBarcode({ sequenceNumber: 3 }),
        ],
        levelTwoComplete: false,
        levelOneComplete: true,
        currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEACCEPTED,
      };
      mockBarcodeResponse(firstResponse);

      const barcode = new Array(26).fill(1).join("");

      // Enter input to trigger validation request
      const input = await screen.findByTestId(ContentTestId.BarcodeInput);
      await userEvent.type(input, barcode);

      // Next button is enabled since there are 3 valid barcodes and level 1 is marked complete
      await waitFor(async () =>
        expect(await screen.findByTestId("done-button")).toBeEnabled()
      );

      // Update the response to include 4 barcodes, still just 1 level complete
      const nextResponse: CrimsonQcBarcodeValidateResponseDto = {
        ...firstResponse,
        barcodes: firstResponse.barcodes.concat([
          randomBarcode({ sequenceNumber: 4 }),
        ]),
      };
      mockBarcodeResponse(nextResponse);
      await userEvent.clear(input);
      await userEvent.type(input, barcode);

      // Next button is now disabled since there are 4 valid barcodes but only level 1 is marked complete
      await waitFor(async () =>
        expect(await screen.findByTestId("done-button")).toBeDisabled()
      );
    });
  });

  describe("barcode validation", () => {
    it("clears the input field and marks the barcode complete when the user's input is accepted", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      // Mock the response to include the barcode the user has typed as an accepted barcode
      const barcode = new Array(26).fill(1).join("");
      mockBarcodeResponse({
        barcodes: [randomBarcode({ barcode, sequenceNumber: 3 })],
        currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEACCEPTED,
      });
      const barcodeInput: HTMLInputElement = await screen.findByTestId(
        ContentTestId.BarcodeInput
      );
      await userEvent.type(barcodeInput, barcode);

      // Input has been cleared since the input was accepted
      await waitFor(() => expect(barcodeInput.value).toEqual(""));
      // The correct barcode status indicates the bar code was accepted
      expect(
        await screen.findByTestId(ContentTestId.BarcodeStatus(3))
      ).toHaveTextContent("Bar code accepted");
    });

    it("indicates which barcode is likely up next", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      // The order of "next" indicators goes sequence 4, 5, 6, 1, 2, 3 (level 2 is more commonly used, so it's placed on top of level 1)
      expect(
        await screen.findByTestId(ContentTestId.BarcodeStatus(4))
      ).toHaveTextContent("Enter bar code");
      // Enter a barcode and have the server indicate sequence 4 was validated -- now barcode 5 (aka level 2, barcode 2) is indicated as the next one
      mockBarcodeResponse({
        barcodes: [randomBarcode({ sequenceNumber: 4 })],
        currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEACCEPTED,
      });
      const barcode = new Array(26).fill(1).join("");
      const barcodeInput = await screen.findByTestId(
        ContentTestId.BarcodeInput
      );
      await userEvent.type(barcodeInput, barcode);

      // Wait for sequence 4 to be accepted
      await waitFor(async () =>
        expect(
          await screen.findByTestId(ContentTestId.BarcodeStatus(4))
        ).toHaveTextContent("Bar code accepted")
      );
      // Now sequence 5 indicates it's up next
      expect(
        await screen.findByTestId(ContentTestId.BarcodeStatus(5))
      ).toHaveTextContent("Enter bar code");
    });

    it("displays error message when the currentBarcodeStatus is not BARCODE_ACCEPTED", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      // Error text is in DOM but hidden by default (it's in the dom so that it retains the space it takes to avoid moving the numpad underneath it)
      const errorText = await screen.findByTestId(ContentTestId.ErrorText);
      expect(errorText).not.toBeVisible();
      mockBarcodeResponse({
        currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEERROR,
      });

      await userEvent.type(
        await screen.findByTestId(ContentTestId.BarcodeInput),
        new Array(26).fill(1).join("")
      );
      await waitFor(() => expect(errorText).toBeVisible());
    });

    it("displays error message when there's a 200 response with no currentBarcodeStatus field", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      const errorText = await screen.findByTestId(ContentTestId.ErrorText);
      expect(errorText).not.toBeVisible();

      server.use(
        rest.put("**/proCyte/qc/barcodes/validate", (req, res, context) =>
          res(context.json([{ message: "There was an error!" }]))
        )
      );

      await userEvent.type(
        await screen.findByTestId(ContentTestId.BarcodeInput),
        new Array(26).fill(1).join("")
      );
      await waitFor(() => expect(errorText).toBeVisible());
    });

    it("displays error message on request error (non-200)", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      const errorText = await screen.findByTestId(ContentTestId.ErrorText);
      expect(errorText).not.toBeVisible();

      server.use(
        rest.put("**/proCyte/qc/barcodes/validate", (req, res, context) =>
          res(context.status(500))
        )
      );

      await userEvent.type(
        await screen.findByTestId(ContentTestId.BarcodeInput),
        new Array(26).fill(1).join("")
      );
      await waitFor(() => expect(errorText).toBeVisible());
    });

    it("removes error message once the user has changed the content in the input", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      // Error text is in DOM but hidden by default (it's in the dom so that it retains the space it takes to avoid moving the numpad underneath it)
      const errorText = await screen.findByTestId(ContentTestId.ErrorText);
      const input = await screen.findByTestId(ContentTestId.BarcodeInput);
      expect(errorText).not.toBeVisible();
      mockBarcodeResponse({
        currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEERROR,
      });

      await userEvent.type(input, new Array(26).fill(1).join(""));
      await waitFor(() => expect(errorText).toBeVisible());

      await userEvent.type(input, "{backspace}");
      expect(errorText).not.toBeVisible();
    });
  });

  describe("expired barcodes", () => {
    it("prompts the user to acknowledge when adding an expired barcode", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );

      // No confirm modal shown
      expect(
        await screen.queryByTestId(TestId.ExpiredLotConfirmModal)
      ).not.toBeInTheDocument();

      // Return an expired but accepted response
      mockBarcodeResponse({
        barcodes: [randomBarcode({ expired: true, sequenceNumber: 2 })],
        currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEACCEPTED,
      });

      // Enter input to trigger validation
      await userEvent.type(
        await screen.findByTestId(ContentTestId.BarcodeInput),
        new Array(26).fill(1).join("")
      );

      await waitFor(async () =>
        expect(
          await screen.findByTestId(TestId.ExpiredLotConfirmModal)
        ).toBeVisible()
      );

      // Acknowledge
      const expiredModal = await screen.findByTestId(
        TestId.ExpiredLotConfirmModal
      );
      await userEvent.click(
        await within(expiredModal).findByTestId("done-button")
      );
      // Verify the barcode is accepted on screen
      expect(
        await screen.findByTestId(ContentTestId.BarcodeStatus(2))
      ).toHaveTextContent("Bar code accepted");
    });

    it("does not display expired barcode as accepted if user does not acknowledge", async () => {
      render(
        <ProCyteDxLotEntryModal
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          instrumentStatus={instrumentStatus()}
        />
      );
      mockBarcodeResponse({
        barcodes: [randomBarcode({ expired: true })],
        currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEACCEPTED,
      });
      await userEvent.type(
        await screen.findByTestId(ContentTestId.BarcodeInput),
        new Array(26).fill(1).join("")
      );
      await waitFor(async () =>
        expect(
          await screen.findByTestId(TestId.ExpiredLotConfirmModal)
        ).toBeVisible()
      );

      // Don't acknowledge
      const expiredModal = await screen.findByTestId(
        TestId.ExpiredLotConfirmModal
      );
      await userEvent.click(
        await within(expiredModal).findByTestId("later-button")
      );
      // Verify the barcode is accepted on screen
      expect(
        await screen.findByTestId(ContentTestId.BarcodeStatus(2))
      ).not.toHaveTextContent("Bar code accepted");
    });
  });
});

const instrumentStatus = () =>
  randomInstrumentStatus({
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.ProCyteDx,
    }),
    connected: true,
    instrumentStatus: InstrumentStatus.Ready,
  });

function mockBarcodeResponse(
  response: Partial<CrimsonQcBarcodeValidateResponseDto>
) {
  const fullResponse: CrimsonQcBarcodeValidateResponseDto = {
    barcodes: [],
    currentBarcodeStatus: CurrentBarcodeStatusEnum.BARCODEERROR,
    levelOneComplete: false,
    levelTwoComplete: false,
    ...response,
  };
  server.use(
    rest.put("**/proCyte/qc/barcodes/validate", (req, res, context) =>
      res(context.json(fullResponse))
    )
  );
}

const randomBarcode = (
  barcode: Partial<CrimsonQcBarcodeResponseDto>
): CrimsonQcBarcodeResponseDto => ({
  barcode: "",
  sequenceNumber: 1,
  barcodeStatus: BarcodeStatusEnum.ACCEPTED,
  expired: false,
  ...barcode,
});
