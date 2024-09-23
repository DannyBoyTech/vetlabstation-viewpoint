import { describe, expect, it, vi } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import { ManualUAResultEntry } from "./ManualUAResultEntry";
import { TestId as SummaryTestId } from "./ManualUAResultSummary";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { server } from "../../../../test-utils/mock-server";
import {
  AdditionalAssays,
  ChemistryResult,
  ChemistryTypes,
  Clarity,
  CollectionMethod,
  Color,
  ManualUAAssays,
  PHValues,
} from "@viewpoint/api";
import {
  BloodImages,
  ChemistryResultDisplayConfigs,
  getClarityImagePath,
  getCollectionMethodImagePath,
} from "./MUAStyleConstants";
import { TestId as PhysicalTestId } from "./ManualUAPhysicalPage";
import { TestId as ChemistryTestId } from "./ManualUAChemistryPage";
import { LightTheme } from "../../../utils/StyleConstants";
import {
  ManualUAPages,
  TestId as ResultEntryTestId,
} from "./common-components";
import { TestId as GlobalKeyboardTestId } from "../../keyboard/GlobalKeyboard";

const AllAssays: ManualUAAssays[] = [
  ...Object.values(AdditionalAssays),
  ...Object.values(ChemistryTypes),
];

describe("paginating", () => {
  it("paginates between manual UA result pages", async () => {
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        availableAssays={AllAssays}
      />
    );
    const backButton = await screen.findByTestId(ResultEntryTestId.BackButton);
    const nextButton = await screen.findByTestId(ResultEntryTestId.NextButton);

    // First page is physical entries
    await verifyOnPage(ManualUAPages.Physical);
    expect(backButton).toBeEnabled();
    expect(backButton).toHaveTextContent("Close");
    expect(nextButton).toBeEnabled();
    expect(nextButton).toHaveTextContent("Next");

    // Click next
    await userEvent.click(nextButton);

    // Second page is chemistries
    await verifyOnPage(ManualUAPages.Chemistries);
    expect(backButton).toBeEnabled();
    expect(backButton).toHaveTextContent("Back");
    expect(nextButton).toBeEnabled();
    expect(nextButton).toHaveTextContent("Next");

    // Click next
    await userEvent.click(nextButton);

    // Third page is summary
    await verifyOnPage(ManualUAPages.Summary);
    expect(backButton).toBeEnabled();
    expect(backButton).toHaveTextContent("Back");
    expect(nextButton).toBeDisabled();
    expect(nextButton).toHaveTextContent("Save");

    // Click back
    await userEvent.click(backButton);

    // Back to the chemistries page
    await verifyOnPage(ManualUAPages.Chemistries);
  });
});

describe("physical attributes page", () => {
  it("allows user to select collection method", async () => {
    const onUpdated = vi.fn();
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    // Verify we are on the physical page
    await verifyOnPage(ManualUAPages.Physical);

    // Open the collection method dropdown
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.DropDownHeader(AdditionalAssays.CollectionMethod)
      )
    );
    // Select one of the options
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.AssayItem(CollectionMethod.Cystocentesis)
      )
    );
    expect(onUpdated).toHaveBeenLastCalledWith(
      { collectionMethod: CollectionMethod.Cystocentesis },
      true
    );

    // Deselect it by clicking it again
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.AssayItem(CollectionMethod.Cystocentesis)
      )
    );
    expect(onUpdated).toHaveBeenLastCalledWith(
      { collectionMethod: undefined },
      false
    );
  });

  it("allows user to select color", async () => {
    const onUpdated = vi.fn();
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    // Verify we are on the physical page
    await verifyOnPage(ManualUAPages.Physical);

    // Open the color dropdown
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.DropDownHeader(AdditionalAssays.Color)
      )
    );
    // Select one of the options
    await userEvent.click(
      await screen.findByTestId(PhysicalTestId.AssayItem(Color.PaleYellow))
    );
    expect(onUpdated).toHaveBeenLastCalledWith(
      { color: Color.PaleYellow },
      true
    );

    // Deselect it by clicking it again
    await userEvent.click(
      await screen.findByTestId(PhysicalTestId.AssayItem(Color.PaleYellow))
    );
    expect(onUpdated).toHaveBeenLastCalledWith({ color: undefined }, false);
  });

  it("allows user to select clarity", async () => {
    const onUpdated = vi.fn();
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    // Verify we are on the physical page
    await verifyOnPage(ManualUAPages.Physical);

    // Open the color dropdown
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.DropDownHeader(AdditionalAssays.Clarity)
      )
    );
    // Select one of the options
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.AssayItem(Clarity.SlightlyCloudy)
      )
    );
    expect(onUpdated).toHaveBeenLastCalledWith(
      { clarity: Clarity.SlightlyCloudy },
      true
    );

    // Deselect it by clicking it again
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.AssayItem(Clarity.SlightlyCloudy)
      )
    );
    expect(onUpdated).toHaveBeenLastCalledWith({ clarity: undefined }, false);
  });

  it("allows user to enter specific gravity", async () => {
    const onUpdated = vi.fn();
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    // Verify we are on the physical page
    await verifyOnPage(ManualUAPages.Physical);

    // Enter one character -- specific gravity value should be set, but marked as not valid
    await userEvent.type(
      await screen.findByTestId(PhysicalTestId.SpecificGravityInput),
      "3"
    );
    expect(onUpdated).toHaveBeenLastCalledWith(
      { specificGravity: 1.03, sgValid: false },
      false
    );

    // Enter next character -- now it should invoke the callback with the full value (prepended with 1.0) and sgValid set to true
    await userEvent.type(
      await screen.findByTestId(PhysicalTestId.SpecificGravityInput),
      "4"
    );
    expect(onUpdated).toHaveBeenLastCalledWith(
      { specificGravity: 1.034, sgValid: true },
      true
    );
  });

  it("shows floating numpad keyboard when specific gravity input is focused", async () => {
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={vi.fn()}
        availableAssays={AllAssays}
      />
    );
    // Verify we are on the physical page
    await verifyOnPage(ManualUAPages.Physical);

    const sgInput = await screen.findByTestId(
      PhysicalTestId.SpecificGravityInput
    );
    await userEvent.click(sgInput);

    const kb = await screen.findByTestId(PhysicalTestId.SpecificGravityNumpad);
    expect(kb).toBeVisible();

    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.DropDownHeader(AdditionalAssays.Clarity)
      )
    );
    expect(kb).not.toBeVisible();
  });

  it("clears the specific gravity input when pressing the clear button", async () => {
    const onUpdated = vi.fn();
    const { container } = render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    // Verify we are on the physical page
    await verifyOnPage(ManualUAPages.Physical);

    await userEvent.type(
      await screen.findByTestId(PhysicalTestId.SpecificGravityInput),
      "34"
    );
    expect(onUpdated).toHaveBeenLastCalledWith(
      { specificGravity: 1.034, sgValid: true },
      true
    );

    // await screen.findByTestId(PhysicalTestId.SpecificGravityInput);
    await userEvent.click(
      await screen.findByTestId(PhysicalTestId.SpecificGravityInput)
    );
    const clearButton = container.getElementsByClassName("hg-button-clear")[0];
    expect(clearButton).toBeVisible();

    await userEvent.click(clearButton);
    expect(onUpdated).toHaveBeenLastCalledWith(
      { specificGravity: undefined },
      false
    );
  });

  it("sets the sgGreaterThan field when pressing the > button", async () => {
    const onUpdated = vi.fn();
    const { container } = render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    // Verify we are on the physical page
    await verifyOnPage(ManualUAPages.Physical);
    const sgInput = await screen.findByTestId(
      PhysicalTestId.SpecificGravityInput
    );
    await userEvent.click(sgInput);

    const gtButton = container.getElementsByClassName("hg-button-gt")[0];
    expect(gtButton).toBeVisible();

    await userEvent.click(gtButton);
    // Resets the sg value
    expect(onUpdated).toHaveBeenLastCalledWith(
      { specificGravity: undefined, sgGreaterThan: true },
      false
    );

    await userEvent.click(gtButton);
    expect(onUpdated).toHaveBeenLastCalledWith(
      { specificGravity: undefined, sgGreaterThan: false },
      false
    );
  });

  it("allows user to select ph", async () => {
    const onUpdated = vi.fn();
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    // Verify we are on the physical page
    await verifyOnPage(ManualUAPages.Physical);

    // Select one of the options
    await userEvent.click(
      await screen.findByTestId(PhysicalTestId.AssayItem(PHValues["6.5"]))
    );
    expect(onUpdated).toHaveBeenLastCalledWith({ ph: PHValues["6.5"] }, true);

    // Deselect it by clicking it again
    await userEvent.click(
      await screen.findByTestId(PhysicalTestId.AssayItem(PHValues["6.5"]))
    );
    expect(onUpdated).toHaveBeenLastCalledWith({ ph: undefined }, false);
  });

  it("auto-navigates to the next page when all options are provided", async () => {
    const onUpdated = vi.fn();
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    // Verify we are on the physical page
    await verifyOnPage(ManualUAPages.Physical);
    // Open the collection method dropdown
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.DropDownHeader(AdditionalAssays.CollectionMethod)
      )
    );
    // Select one of the options
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.AssayItem(CollectionMethod.Catheterization)
      )
    );

    // Open the color dropdown
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.DropDownHeader(AdditionalAssays.Color)
      )
    );
    // Select one of the options
    await userEvent.click(
      await screen.findByTestId(PhysicalTestId.AssayItem(Color.PaleYellow))
    );

    // Open the color dropdown
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.DropDownHeader(AdditionalAssays.Clarity)
      )
    );
    // Select one of the options
    await userEvent.click(
      await screen.findByTestId(
        PhysicalTestId.AssayItem(Clarity.SlightlyCloudy)
      )
    );

    // Enter specific gravity
    await userEvent.type(
      await screen.findByTestId(PhysicalTestId.SpecificGravityInput),
      "55"
    );

    // Select a PH option
    await userEvent.click(
      await screen.findByTestId(PhysicalTestId.AssayItem(PHValues["6.5"]))
    );

    expect(onUpdated).toHaveBeenLastCalledWith(
      {
        collectionMethod: CollectionMethod.Catheterization,
        color: Color.PaleYellow,
        clarity: Clarity.SlightlyCloudy,
        specificGravity: 1.055,
        ph: PHValues["6.5"],
        sgValid: true,
      },
      true
    );
  });
});

describe("chemistry page", () => {
  const AllResults: [ChemistryResult, ChemistryTypes][] = Object.keys(
    ChemistryResultDisplayConfigs
  )
    .map((chem) =>
      Object.keys(ChemistryResultDisplayConfigs[chem as ChemistryTypes]).map(
        (result) => [result, chem]
      )
    )
    .flat() as [ChemistryResult, ChemistryTypes][];

  it.each(AllResults)(
    "allows user to select the %s result for %s",
    async (result, type) => {
      const onUpdated = vi.fn();
      render(
        <ManualUAResultEntry
          skipChemistries={false}
          editableRunId={1}
          onDone={vi.fn()}
          onResultsUpdated={onUpdated}
          availableAssays={AllAssays}
        />
      );
      await goToPage(ManualUAPages.Chemistries);
      // Find a result box for this chemistry
      const resultBox = await screen.findByTestId(
        ChemistryTestId.ChemistryResultBox(type, result)
      );
      expect(resultBox).toBeVisible();
      await userEvent.click(resultBox);
      expect(resultBox).toHaveStyle(
        `outline: ${LightTheme.borders?.controlFocus}`
      );

      expect(onUpdated).toHaveBeenLastCalledWith(
        {
          chemistries: {
            [type]: result,
          },
        },
        true
      );

      // Unselect it
      await userEvent.click(resultBox);
      expect(resultBox).not.toHaveStyle(
        `outline: ${LightTheme.borders?.controlFocus}`
      );
      expect(onUpdated).toHaveBeenLastCalledWith({ chemistries: {} }, false);
    }
  );

  it("removes mBLD result if user selects an mHGB result", async () => {
    const onUpdated = vi.fn();
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    await goToPage(ManualUAPages.Chemistries);
    // Select a blood result
    const bloodPlusOneBox = await screen.findByTestId(
      ChemistryTestId.ChemistryResultBox(
        ChemistryTypes.BLD,
        ChemistryResult.PlusOne
      )
    );
    await userEvent.click(bloodPlusOneBox);
    expect(bloodPlusOneBox).toHaveStyle(
      `outline: ${LightTheme.borders?.controlFocus}`
    );

    expect(onUpdated).toHaveBeenLastCalledWith(
      {
        chemistries: {
          [ChemistryTypes.BLD]: ChemistryResult.PlusOne,
          [ChemistryTypes.HGB]: undefined,
        },
      },
      true
    );

    // Select an hgb result
    const hgbPlusOneBox = await screen.findByTestId(
      ChemistryTestId.ChemistryResultBox(
        ChemistryTypes.HGB,
        ChemistryResult.PlusOne
      )
    );
    await userEvent.click(hgbPlusOneBox);
    expect(bloodPlusOneBox).not.toHaveStyle(
      `outline: ${LightTheme.borders?.controlFocus}`
    );
    expect(hgbPlusOneBox).toHaveStyle(
      `outline: ${LightTheme.borders?.controlFocus}`
    );

    expect(onUpdated).toHaveBeenLastCalledWith(
      {
        chemistries: {
          [ChemistryTypes.BLD]: undefined,
          [ChemistryTypes.HGB]: ChemistryResult.PlusOne,
        },
      },
      true
    );

    // Select a bld result again, hgb should be removed

    const bloodPlusTwoBox = await screen.findByTestId(
      ChemistryTestId.ChemistryResultBox(
        ChemistryTypes.BLD,
        ChemistryResult.PlusTwo
      )
    );
    await userEvent.click(bloodPlusTwoBox);
    expect(bloodPlusTwoBox).toHaveStyle(
      `outline: ${LightTheme.borders?.controlFocus}`
    );
    expect(bloodPlusOneBox).not.toHaveStyle(
      `outline: ${LightTheme.borders?.controlFocus}`
    );
    expect(hgbPlusOneBox).not.toHaveStyle(
      `outline: ${LightTheme.borders?.controlFocus}`
    );

    expect(onUpdated).toHaveBeenLastCalledWith(
      {
        chemistries: {
          [ChemistryTypes.BLD]: ChemistryResult.PlusTwo,
          [ChemistryTypes.HGB]: undefined,
        },
      },
      true
    );
  });

  it("can set all results to negative/normal", async () => {
    const onUpdated = vi.fn();
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        onResultsUpdated={onUpdated}
        availableAssays={AllAssays}
      />
    );
    await goToPage(ManualUAPages.Chemistries);
    const setAllButton = await screen.findByTestId(
      ChemistryTestId.SetAllNegativeNormal
    );
    await userEvent.click(setAllButton);

    expect(onUpdated).toHaveBeenLastCalledWith(
      {
        chemistries: {
          [ChemistryTypes.BLD]: ChemistryResult.Negative,
          [ChemistryTypes.BIL]: ChemistryResult.Negative,
          [ChemistryTypes.UBG]: ChemistryResult.Normal,
          [ChemistryTypes.KET]: ChemistryResult.Negative,
          [ChemistryTypes.GLU]: ChemistryResult.Negative,
          [ChemistryTypes.PRO]: ChemistryResult.Negative,
          [ChemistryTypes.LEU]: ChemistryResult.Negative,
        },
      },
      true
    );

    // Auto-advances to next screen
    await verifyOnPage(ManualUAPages.Summary);
  });
});

describe("summary page", () => {
  it("prevents submitting results until at least one valid result is entered", async () => {
    // Intercept network request
    const onSave = vi.fn();
    server.use(
      rest.post("*/1/results/mua", async (req, res, ctx) => {
        onSave(await req.json());
        return res(ctx.json({}));
      })
    );
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        availableAssays={AllAssays}
      />
    );
    await goToPage(ManualUAPages.Summary);
    const nextButton = await screen.findByTestId(ResultEntryTestId.NextButton);

    expect(nextButton).toBeDisabled();
    expect(nextButton.textContent).toEqual("Save");

    // Enter a comment
    await userEvent.type(
      await screen.findByTestId(SummaryTestId.CommentBox),
      "Here is a comment"
    );
    expect(nextButton).toBeEnabled();

    // Click to submit
    await userEvent.click(nextButton);
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        comment: "Here is a comment",
      })
    );
  });

  it.each([
    [ChemistryResult.PlusOne],
    [ChemistryResult.PlusTwo],
    [ChemistryResult.PlusThree],
    [ChemistryResult.PlusFour],
  ])("displays an image for assay mBLD with value %s", async (value) => {
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        initialResults={{ chemistries: { mBLD: value } }}
        availableAssays={AllAssays}
      />
    );
    await goToPage(ManualUAPages.Summary);

    const resultSummaryBox = await screen.findByTestId(
      SummaryTestId.ResultSummaryBox("mBLD")
    );
    expect(resultSummaryBox).toHaveStyle(
      `background-image: url(${BloodImages[value]})`
    );
  });

  it("does not include greater than symbol if sg is not indicated as greater than", async () => {
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        initialResults={{ specificGravity: 1.099, sgGreaterThan: false }}
        availableAssays={AllAssays}
      />
    );
    await goToPage(ManualUAPages.Summary);

    expect(await screen.findByText("1.099")).toBeInTheDocument();
  });

  it("includes greater than symbol if sg is indicated as greater than", async () => {
    render(
      <ManualUAResultEntry
        skipChemistries={false}
        editableRunId={1}
        onDone={vi.fn()}
        initialResults={{ specificGravity: 1.099, sgGreaterThan: true }}
        availableAssays={AllAssays}
      />
    );
    await goToPage(ManualUAPages.Summary);

    expect(await screen.findByText("> 1.099")).toBeInTheDocument();
  });

  it.each(Object.values(CollectionMethod))(
    "displays an image for collection method with value %s",
    async (collectionMethod) => {
      render(
        <ManualUAResultEntry
          skipChemistries={false}
          editableRunId={1}
          onDone={vi.fn()}
          initialResults={{ collectionMethod }}
          availableAssays={AllAssays}
        />
      );
      await goToPage(ManualUAPages.Summary);

      const resultSummaryBox = await screen.findByTestId(
        SummaryTestId.ResultSummaryBox(AdditionalAssays.CollectionMethod)
      );
      expect(resultSummaryBox).toHaveStyle(
        `background-image: url(${getCollectionMethodImagePath(
          collectionMethod
        )})`
      );
    }
  );

  it.each(Object.values(Clarity))(
    "displays an image for clarity with value %s",
    async (clarity) => {
      render(
        <ManualUAResultEntry
          skipChemistries={false}
          editableRunId={1}
          onDone={vi.fn()}
          initialResults={{ clarity }}
          availableAssays={AllAssays}
        />
      );
      await goToPage(ManualUAPages.Summary);

      const resultSummaryBox = await screen.findByTestId(
        SummaryTestId.ResultSummaryBox(AdditionalAssays.Clarity)
      );
      expect(resultSummaryBox).toHaveStyle(
        `background-image: url(${getClarityImagePath(clarity)})`
      );
    }
  );
});

async function goToPage(targetPage: ManualUAPages) {
  const pageOrder = Object.values(ManualUAPages) as ManualUAPages[];
  const currentPage = await whichPage();
  if (currentPage == null) {
    throw new Error("Could not locate current page");
  }
  const diff = pageOrder.indexOf(targetPage) - pageOrder.indexOf(currentPage);
  const targetButton =
    diff > 0 ? ResultEntryTestId.NextButton : ResultEntryTestId.BackButton;
  for (let i = 0; i < diff; i++) {
    await userEvent.click(await screen.findByTestId(targetButton));
  }
  await verifyOnPage(targetPage);
}

async function verifyOnPage(page: ManualUAPages) {
  switch (page) {
    case ManualUAPages.Physical:
      expect(
        await screen.findByTestId(ResultEntryTestId.PhysicalPage)
      ).toBeInTheDocument();
      expect(
        await screen.queryByTestId(ResultEntryTestId.ChemistriesPage)
      ).not.toBeInTheDocument();
      expect(
        await screen.queryByTestId(ResultEntryTestId.SummaryPage)
      ).not.toBeInTheDocument();
      break;
    case ManualUAPages.Chemistries:
      expect(
        await screen.queryByTestId(ResultEntryTestId.PhysicalPage)
      ).not.toBeInTheDocument();
      expect(
        await screen.findByTestId(ResultEntryTestId.ChemistriesPage)
      ).toBeInTheDocument();
      expect(
        await screen.queryByTestId(ResultEntryTestId.SummaryPage)
      ).not.toBeInTheDocument();
      break;
    case ManualUAPages.Summary:
      expect(
        await screen.queryByTestId(ResultEntryTestId.PhysicalPage)
      ).not.toBeInTheDocument();
      expect(
        await screen.queryByTestId(ResultEntryTestId.ChemistriesPage)
      ).not.toBeInTheDocument();
      expect(
        await screen.findByTestId(ResultEntryTestId.SummaryPage)
      ).toBeInTheDocument();
      break;
  }
}

async function whichPage(): Promise<ManualUAPages | undefined> {
  if ((await screen.queryByTestId(ResultEntryTestId.PhysicalPage)) != null) {
    return ManualUAPages.Physical;
  }
  if ((await screen.queryByTestId(ResultEntryTestId.ChemistriesPage)) != null) {
    return ManualUAPages.Chemistries;
  }
  if ((await screen.queryByTestId(ResultEntryTestId.SummaryPage)) != null) {
    return ManualUAPages.Summary;
  }
}
