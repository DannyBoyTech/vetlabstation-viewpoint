import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BarcodeValidationResult,
  InstrumentType,
  ProCyteDxFluidType,
} from "@viewpoint/api";
import { rest } from "msw";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { server } from "../../../../test-utils/mock-server";
import { render } from "../../../../test-utils/test-utils";
import { ProCyteDxLotEntryScreen, TestId } from "./ProCyteDxLotEntryScreen";
import {
  findByTestId,
  queryByTestId,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { unstable_useBlocker } from "react-router";
import { TestId as WizardTestId } from "../../../components/wizard/wizard-components";
import i18n from "i18next";

vi.mock("react-router", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  unstable_useBlocker: vi.fn(),
}));

describe("ProCyteDx lot entry screen", () => {
  beforeEach(() => {
    vi.mocked(unstable_useBlocker).mockReturnValue({
      state: "unblocked",
    } as any);
  });

  it("displays error if required search params are missing", async () => {
    // Rendering without initialEntries to provide search param values
    const { container } = render(
      <ProCyteDxLotEntryScreen
        instrumentStatus={randomInstrumentStatus({
          instrument: randomInstrumentDto({
            instrumentType: InstrumentType.ProCyteDx,
          }),
        })}
      />
    );
    // No input field visible
    expect(
      await queryByTestId(container, TestId.LotInput)
    ).not.toBeInTheDocument();
    // Generic error text displayed
    expect(container).toHaveTextContent(
      "Something went wrong. Please try again. If the error persists, contact IDEXX Support."
    );
  });

  it("does not enable continue button until correct number of characters are entered", async () => {
    const { container } = render(
      <ProCyteDxLotEntryScreen
        instrumentStatus={randomInstrumentStatus({
          instrument: randomInstrumentDto({
            instrumentType: InstrumentType.ProCyteDx,
          }),
        })}
      />,
      {
        initialRouteEntries: [
          `?fluidType=${
            ProCyteDxFluidType.REAGENT
          }&skipSufficientVolumeConfirmation=${false}`,
        ],
      }
    );
    expect(await findByTestId(container, TestId.ContinueButton)).toBeDisabled();

    await userEvent.type(
      await findByTestId(container, TestId.LotInput),
      new Array(22).fill("1").join("")
    );

    expect(await findByTestId(container, TestId.ContinueButton)).toBeEnabled();
  });

  it("handles network error from IVLS by displaying error to user", async () => {
    const { container } = render(
      <ProCyteDxLotEntryScreen
        instrumentStatus={randomInstrumentStatus({
          instrument: randomInstrumentDto({
            instrumentType: InstrumentType.ProCyteDx,
          }),
        })}
      />,
      {
        initialRouteEntries: [
          `?fluidType=${
            ProCyteDxFluidType.REAGENT
          }&skipSufficientVolumeConfirmation=${false}`,
        ],
      }
    );
    server.use(
      rest.put("**/proCyte/*/reagents/*/validate", (req, res, context) =>
        res(context.status(500))
      )
    );
    await userEvent.type(
      await findByTestId(container, TestId.LotInput),
      new Array(22).fill("1").join("")
    );
    await userEvent.click(await findByTestId(container, TestId.ContinueButton));

    const resultModal = await findByTestId(
      container,
      TestId.ResultModal(BarcodeValidationResult.UNKNOWN_ERROR)
    );
    expect(resultModal).toHaveTextContent(
      "Something went wrong. Please try again. If the error persists, contact IDEXX Support."
    );
  });

  it("asks user to confirm replacing reagent kit with sufficient volume before replacing", async () => {
    const container = await generateValidationResultModal(
      BarcodeValidationResult.SUFFICIENT_VOLUME,
      {
        fluidType: ProCyteDxFluidType.REAGENT,
        skipSufficientVolumeConfirmation: false,
      }
    );
    const resultModal = await findByTestId(
      container,
      TestId.ResultModal(BarcodeValidationResult.SUFFICIENT_VOLUME)
    );
    expect(resultModal).toBeVisible();
    await userEvent.click(await findByTestId(resultModal, "done-button"));
    await waitFor(async () => {
      expect(
        await screen.findByText(
          i18n.t(
            "instrumentScreens.proCyteDx.changeReagentWizard.kit.header"
          ) as string
        )
      ).toBeVisible();
    });
  });

  it("skips sufficient volume prompt when the 'skipSufficientVolumeConfirmation' query param is 'true'", async () => {
    const container = await generateValidationResultModal(
      BarcodeValidationResult.SUFFICIENT_VOLUME,
      {
        skipSufficientVolumeConfirmation: true,
      }
    );
    // Does not show the sufficient volume modal -- skips straight to the valid modal
    expect(
      await queryByTestId(
        container,
        TestId.ResultModal(BarcodeValidationResult.SUFFICIENT_VOLUME)
      )
    ).not.toBeInTheDocument();

    expect(
      await findByTestId(container, WizardTestId.PrimaryTitle)
    ).toBeVisible();
  });

  describe("result modals", () => {
    const cases = [
      {
        validationResult: BarcodeValidationResult.SUFFICIENT_VOLUME,
        canDismiss: false,
        canCancel: true,
        expectWizard: false,
      },
      {
        validationResult: BarcodeValidationResult.VALID,
        canDismiss: true,
        canCancel: true,
        expectWizard: true,
      },
      {
        validationResult: BarcodeValidationResult.REAGENT_EXPIRED,
        canDismiss: true,
        canCancel: false,
        expectWizard: false,
      },
      {
        validationResult: BarcodeValidationResult.MAX_REPLACEMENT_REACHED,
        canDismiss: true,
        canCancel: false,
        expectWizard: false,
      },
      {
        validationResult: BarcodeValidationResult.BARCODE_ERROR,
        canDismiss: true,
        canCancel: false,
        expectWizard: false,
      },
    ];
    it.each(cases)(
      "displays result modal for validation result $validationResult with dismissable: $canDismiss, cancellable: $canCancel",
      async ({ validationResult, canDismiss, canCancel, expectWizard }) => {
        const container = await generateValidationResultModal(
          validationResult,
          {
            fluidType: ProCyteDxFluidType.REAGENT,
            skipSufficientVolumeConfirmation: false,
          }
        );

        let modalTestId;
        let cancelButtonTestId;
        if (expectWizard) {
          modalTestId = WizardTestId.Modal;
          cancelButtonTestId = WizardTestId.BackButton;
        } else {
          modalTestId = TestId.ResultModal(validationResult);
          cancelButtonTestId = "later-button";
        }

        const resultModal = await findByTestId(container, modalTestId);

        // Cancel (aka "X" button) used to dismiss a modal
        const cancelButtons = resultModal.getElementsByClassName(
          "spot-modal__header-cancel-button"
        );
        if (canDismiss) {
          expect(cancelButtons.length).toEqual(1);
          expect(cancelButtons[0]).toBeVisible();
        } else {
          expect(cancelButtons.length).toEqual(0);
        }

        if (canCancel) {
          expect(
            await findByTestId(resultModal, cancelButtonTestId)
          ).toBeVisible();
        } else {
          expect(
            await queryByTestId(resultModal, cancelButtonTestId)
          ).not.toBeInTheDocument();
        }
      }
    );
  });
});

function mockValidate(response: BarcodeValidationResult) {
  server.use(
    rest.put("**/proCyte/*/reagents/*/validate", (req, res, context) =>
      res(context.json(response))
    )
  );
}

async function generateValidationResultModal(
  validationResult: BarcodeValidationResult,
  options?: {
    fluidType?: ProCyteDxFluidType;
    skipSufficientVolumeConfirmation?: boolean;
  }
) {
  const { container } = render(
    <ProCyteDxLotEntryScreen
      instrumentStatus={randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      })}
    />,
    {
      initialRouteEntries: [
        `?fluidType=${
          options?.fluidType ?? ProCyteDxFluidType.REAGENT
        }&skipSufficientVolumeConfirmation=${
          options?.skipSufficientVolumeConfirmation ?? false
        }`,
      ],
    }
  );
  mockValidate(validationResult);
  await userEvent.type(
    await findByTestId(container, TestId.LotInput),
    new Array(22).fill("1").join("")
  );
  await userEvent.click(await findByTestId(container, TestId.ContinueButton));

  return container;
}
