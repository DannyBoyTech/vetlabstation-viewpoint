import { beforeEach, describe, expect, vi } from "vitest";
import { render } from "../../../../../test-utils/test-utils";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { BarcodeType, InstrumentStatus, InstrumentType } from "@viewpoint/api";
import { InVueDxLotEntryScreen, TestId } from "./InVueDxLotEntryScreen";
import userEvent from "@testing-library/user-event";
import { TestId as LotEntryTestId } from "../../common/LotEntry";
import { server } from "../../../../../test-utils/mock-server";
import { rest } from "msw";

describe("inVue Dx lot entry", () => {
  beforeEach(() => {
    server.use(
      rest.get("**/api/theia/barcodes/types", (req, res, ctx) => {
        return res(
          ctx.json([BarcodeType.BLOOD, BarcodeType.EAR_SWAB, BarcodeType.FNA])
        );
      })
    );
  });

  it("requests user to confirm before navigating when barcode has been entered", async () => {
    const status = randomInstrumentStatus({
      connected: true,
      instrumentStatus: InstrumentStatus.Ready,
      instrument: randomInstrumentDto({ instrumentType: InstrumentType.Theia }),
    });

    const { findByTestId } = render(
      <InVueDxLotEntryScreen instrument={status} />
    );

    const cancelButton = await findByTestId(TestId.CancelButton);
    const nextButton = await findByTestId(TestId.NextButton);
    const barcodeInput = await findByTestId(TestId.LotEntryInput);
    const bloodRadio = await findByTestId(
      LotEntryTestId.ConsumableTypeRadio(BarcodeType.BLOOD)
    );

    await userEvent.click(cancelButton);

    await userEvent.type(barcodeInput, "12345");
    await userEvent.click(cancelButton);

    expect(await findByTestId(TestId.CancelConfirmationModal)).toBeVisible();
  });

  it("does not show confirm modal when navigating after successful confirmation", async () => {
    server.use(
      rest.put("**/api/instrument/*/barcode", (req, res, ctx) => {
        return res(ctx.json({ isValid: true }));
      })
    );
    const status = randomInstrumentStatus({
      connected: true,
      instrumentStatus: InstrumentStatus.Ready,
      instrument: randomInstrumentDto({ instrumentType: InstrumentType.Theia }),
    });

    const { findByTestId, queryByTestId } = render(
      <InVueDxLotEntryScreen instrument={status} />
    );

    const nextButton = await findByTestId(TestId.NextButton);
    const barcodeInput = await findByTestId(TestId.LotEntryInput);
    const bloodRadio = await findByTestId(
      LotEntryTestId.ConsumableTypeRadio(BarcodeType.BLOOD)
    );

    await userEvent.click(bloodRadio);
    await userEvent.type(barcodeInput, "12345");
    await userEvent.click(nextButton);

    expect(
      queryByTestId(TestId.CancelConfirmationModal)
    ).not.toBeInTheDocument();
  });
});
