import { describe } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import { ProCyteOneLotEntryScreen, TestId } from "./ProCyteOneLotEntryScreen";
import { TestId as LotEntryTestId } from "../common/LotEntry";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  BarcodeType,
  BarcodeValidationReason,
  BarcodeValidationResponseDto,
  InstrumentStatus,
  InstrumentType,
} from "@viewpoint/api";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SmartQCLabel from "../../../assets/lot-entry/pco/Acadia_SmartQC_Label.png";
import ReagentLabel from "../../../assets/lot-entry/pco/Acadia_Reagent_Label.png";
import SheathLabel from "../../../assets/lot-entry/pco/Acadia_Sheath_Label.png";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";

describe("procyte one lot entry screen", () => {
  it("disables next button until a consumable type is selected and text is entered for the barcode", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneLotEntryScreen instrument={instrument} />);

    expect(await screen.findByTestId(TestId.NextButton)).toBeDisabled();

    // Select a consumable type
    await userEvent.click(
      await screen.findByTestId(
        LotEntryTestId.ConsumableTypeRadio(BarcodeType.SMART_QC)
      )
    );

    // Still disabled
    expect(await screen.findByTestId(TestId.NextButton)).toBeDisabled();

    // Type in a lot number
    await userEvent.type(
      await screen.findByTestId(TestId.LotEntryInput),
      "12345"
    );

    // Enabled
    expect(await screen.findByTestId(TestId.NextButton)).toBeEnabled();
  });

  it("changes image based on selected consumable type", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneLotEntryScreen instrument={instrument} />);

    expect(await screen.findByTestId(TestId.NextButton)).toBeDisabled();

    // No type selected, no image displayed
    expect(
      await screen.queryByTestId(LotEntryTestId.labelImage)
    ).not.toBeInTheDocument();

    // Select SmartQC, verify image has SmartQC label
    await userEvent.click(
      await screen.findByTestId(
        LotEntryTestId.ConsumableTypeRadio(BarcodeType.SMART_QC)
      )
    );
    expect(
      await screen.findByTestId(LotEntryTestId.labelImage)
    ).toHaveAttribute("src", SmartQCLabel);

    // Select Reagent, verify image has Reagent label
    await userEvent.click(
      await screen.findByTestId(
        LotEntryTestId.ConsumableTypeRadio(BarcodeType.REAGENT)
      )
    );
    expect(
      await screen.findByTestId(LotEntryTestId.labelImage)
    ).toHaveAttribute("src", ReagentLabel);

    // Select Sheath, verify image has Sheath label
    await userEvent.click(
      await screen.findByTestId(
        LotEntryTestId.ConsumableTypeRadio(BarcodeType.SHEATH)
      )
    );
    expect(
      await screen.findByTestId(LotEntryTestId.labelImage)
    ).toHaveAttribute("src", SheathLabel);
  });

  it("auto-focuses on the lot entry input field", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneLotEntryScreen instrument={instrument} />);
    expect(await screen.findByTestId(TestId.LotEntryInput)).toHaveFocus();
  });

  it("shows error text if barcode validation fails", async () => {
    server.use(
      rest.put("*/api/instrument/*/barcode", (req, res, ctx) =>
        res(
          ctx.json({
            isValid: false,
            comment: BarcodeValidationReason.CHECKSUM_FAILURE,
          } as BarcodeValidationResponseDto)
        )
      )
    );
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneLotEntryScreen instrument={instrument} />);
    await userEvent.click(
      await screen.findByTestId(
        LotEntryTestId.ConsumableTypeRadio(BarcodeType.SMART_QC)
      )
    );
    await userEvent.type(
      await screen.findByTestId(TestId.LotEntryInput),
      "12345"
    );
    await userEvent.click(await screen.findByTestId(TestId.NextButton));

    expect(
      await screen.findByText(
        "The number entered was invalid. Please try again."
      )
    ).toBeInTheDocument();
  });

  it("navs to the home page on successful validation", async () => {
    server.use(
      rest.put("*/api/instrument/*/barcode", (req, res, ctx) =>
        res(
          ctx.json({
            isValid: true,
            comment: BarcodeValidationReason.VALID,
          } as BarcodeValidationResponseDto)
        )
      )
    );
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneLotEntryScreen instrument={instrument} />);
    await userEvent.click(
      await screen.findByTestId(
        LotEntryTestId.ConsumableTypeRadio(BarcodeType.SMART_QC)
      )
    );
    await userEvent.type(
      await screen.findByTestId(TestId.LotEntryInput),
      "12345"
    );
    await userEvent.click(await screen.findByTestId(TestId.NextButton));

    expect(location.pathname).toEqual("/");
  });
});
