import { useNavigate } from "react-router-dom";
import { describe, vi } from "vitest";
import { SnapReportsScreen, TestId } from "./SnapReportsScreen";
import { render } from "../../../../test-utils/test-utils";
import { waitFor } from "@testing-library/react";
import { GlobalModalProvider } from "../../../components/global-modals/GlobalModals";
import userEvent from "@testing-library/user-event";
import {
  fetchSnapLogReport,
  fetchSnapSummaryReport,
} from "../../../api/ReportApi";

vi.mock("react-router-dom", async (actualImport) => {
  const origModule = (await actualImport()) as object;
  return {
    ...origModule,
    useNavigate: vi.fn(),
  };
});

vi.mock("../../../api/ReportApi", async (actualImport) => {
  const origModule = (await actualImport()) as object;
  return {
    ...origModule,
    fetchSnapLogReport: vi.fn(),
    fetchSnapSummaryReport: vi.fn(),
  };
});

function renderUI() {
  return render(
    <GlobalModalProvider>
      <SnapReportsScreen />
    </GlobalModalProvider>
  );
}

describe("SnapReportsScreen", () => {
  const nav = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockImplementation(() => nav);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial render", () => {
    it("should display a 'SNAP Log Report' heading", async () => {
      const container = renderUI();

      const elem = container.getByTestId(TestId.PageTitle);

      expect(elem).toHaveTextContent(/^SNAP Log Report$/);
    });

    it("should display an unchecked 'Last Month' radio option", () => {
      const container = renderUI();

      const elem = container.getByRole("radio", {
        checked: false,
        name: "Last Month",
      });

      expect(elem).toBeVisible();
    });

    it("should display an unchecked 'This Month' radio option", () => {
      const container = renderUI();

      const elem = container.getByRole("radio", {
        checked: false,
        name: "This Month",
      });

      expect(elem).toBeVisible();
    });

    it("should display an unchecked 'Last Week' radio option", () => {
      const container = renderUI();

      const elem = container.getByRole("radio", {
        checked: false,
        name: "Last Week",
      });

      expect(elem).toBeVisible();
    });

    it("should display an unchecked 'This Week' radio option", () => {
      const container = renderUI();

      const elem = container.getByRole("radio", {
        checked: false,
        name: "This Week",
      });

      expect(elem).toBeVisible();
    });

    it("should display an unchecked 'Year to Date' radio option", () => {
      const container = renderUI();

      const elem = container.getByRole("radio", {
        checked: false,
        name: "Year to Date",
      });

      expect(elem).toBeVisible();
    });

    it("should display an unchecked 'Custom Date Range' radio option", () => {
      const container = renderUI();

      const elem = container.getByRole("radio", {
        checked: false,
        name: "Custom Date Range",
      });

      expect(elem).toBeVisible();
    });

    it("should display a disabled 'Print Log' button", () => {
      const container = renderUI();

      const elem = container.getByRole("button", {
        name: "Print Log",
      });

      expect(elem).toBeVisible();
    });

    it("should display a disabled 'Print Summary' button", () => {
      const container = renderUI();

      const elem = container.getByRole("button", {
        name: "Print Summary",
      });

      expect(elem).toBeVisible();
    });

    it("should display an enabled 'Back' button", () => {
      const container = renderUI();

      const elem = container.getByRole("button", {
        name: "Back",
      });

      expect(elem).toBeVisible();
    });

    it("should not show any 'Selected dates'", () => {
      const container = renderUI();

      const selectedDates = container.queryByTestId(TestId.SelectedDates);

      expect(selectedDates).not.toBeInTheDocument();
    });

    it("should not show date picker", () => {
      const container = renderUI();

      const elem = container.queryByTestId(TestId.DateRangePicker);

      expect(elem).not.toBeInTheDocument();
    });
  });

  it("should display date picker when 'Custom Date Range' is selected", async () => {
    const container = renderUI();

    const customDateRange = container.getByRole("radio", {
      name: "Custom Date Range",
    });

    expect(customDateRange).toBeVisible();
    expect(customDateRange).toBeEnabled();

    const dateRangePicker = container.queryByTestId(TestId.DateRangePicker);

    expect(dateRangePicker).not.toBeInTheDocument();

    await userEvent.click(customDateRange);

    await waitFor(async () => {
      const picker = container.getByTestId(TestId.DateRangePicker);
      expect(picker).toBeInTheDocument();
      expect(picker).toBeEnabled();
    });
  });

  it("should display 'Selected Dates' when a (non-custom) selection is made", async () => {
    vi.setSystemTime("2024-01-16T06:00:00");
    const user = userEvent.setup(); // to unblock promise resolution

    const container = renderUI();

    const thisWeek = container.getByRole("radio", {
      checked: false,
      name: "This Week",
    });

    expect(thisWeek).toBeVisible();

    const selectedDates = container.queryByTestId(TestId.SelectedDates);

    expect(selectedDates).not.toBeInTheDocument();

    await user.click(thisWeek);

    await waitFor(() => {
      const selectedDates = container.getByTestId(TestId.SelectedDates);
      expect(selectedDates).toHaveTextContent("Jan 14, 2024 - Jan 16, 2024");
    });
  });

  it("should enable the 'Print Log' and 'Print Summary' when a (non-custom) selection is made", async () => {
    const container = renderUI();

    const thisWeek = container.getByRole("radio", {
      checked: false,
      name: "This Week",
    });

    const printLogButton = container.getByRole("button", { name: "Print Log" });
    expect(printLogButton).toBeDisabled();

    const printSummaryButton = container.getByRole("button", {
      name: "Print Summary",
    });
    expect(printSummaryButton).toBeDisabled();

    await userEvent.click(thisWeek);

    await waitFor(() => {
      const printLogButton = container.getByRole("button", {
        name: "Print Log",
      });
      expect(printLogButton).toBeEnabled();

      const printSummaryButton = container.getByRole("button", {
        name: "Print Summary",
      });
      expect(printSummaryButton).toBeEnabled();
    });
  });

  describe("print log button", () => {
    it("should request snap log report pdf and show print preview on click", async () => {
      vi.mocked(fetchSnapLogReport).mockImplementation(
        async () => new Blob(["g;alkdfsj"])
      );

      const container = renderUI();

      const thisWeek = container.getByRole("radio", {
        checked: false,
        name: "This Week",
      });

      await userEvent.click(thisWeek);

      await waitFor(async () => {
        const printLogButton = container.getByRole("button", {
          name: "Print Log",
        });
        expect(printLogButton).toBeEnabled();
      });

      const printLogButton = container.getByRole("button", {
        name: "Print Log",
      });
      await userEvent.click(printLogButton);

      expect(fetchSnapLogReport).toHaveBeenCalledTimes(1);

      const printPreview = container.getByTestId(TestId.PrintPreview);
      expect(printPreview).toBeVisible();
    });
  });

  describe("print summary button", () => {
    it("should request snap summary report pdf and show print preview on click ", async () => {
      vi.mocked(fetchSnapSummaryReport).mockImplementation(
        async () => new Blob(["g;alkdfsj"])
      );

      const container = renderUI();

      const thisWeek = container.getByRole("radio", {
        checked: false,
        name: "This Month",
      });

      await userEvent.click(thisWeek);

      await waitFor(async () => {
        const printSummaryButton = container.getByRole("button", {
          name: "Print Summary",
        });
        expect(printSummaryButton).toBeEnabled();
      });

      const printSummaryButton = container.getByRole("button", {
        name: "Print Summary",
      });
      await userEvent.click(printSummaryButton);

      expect(fetchSnapSummaryReport).toHaveBeenCalledTimes(1);

      const printPreview = container.getByTestId(TestId.PrintPreview);
      expect(printPreview).toBeVisible();
    });
  });
});
