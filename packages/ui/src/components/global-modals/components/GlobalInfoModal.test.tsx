import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, vi } from "vitest";
import { GlobalModalProvider } from "../GlobalModals";
import { useInfoModal } from "./GlobalInfoModal";

const InfoModalUsage = () => {
  const { addInfoModal } = useInfoModal();
  const [n, setN] = useState(0);

  return (
    <button
      id="modal-usage"
      onClick={() => {
        addInfoModal({
          header: `header: ${n}`,
          content: `content: ${n}`,
        });
        setN((n) => n + 1);
      }}
    >
      clickme
    </button>
  );
};

describe("useInfoModal", () => {
  it("should throw error if called outside of a InfoModalProvider", () => {
    expect(() => render(<InfoModalUsage />)).toThrowError();
  });

  it("should display modal when called", async () => {
    render(
      <GlobalModalProvider>
        <InfoModalUsage />
      </GlobalModalProvider>
    );

    const button = await screen.getByRole("button");

    let modal = await screen.queryByText("header: 0");

    expect(modal).not.toBeInTheDocument();

    await userEvent.click(button);

    modal = await screen.getByText("header: 0");

    expect(modal).toBeVisible();
  });

  it("should queue up modals until they are confirmed", async () => {
    render(
      <GlobalModalProvider>
        <InfoModalUsage />
      </GlobalModalProvider>
    );

    const addModalButton = await screen.getByRole("button");

    let modal = await screen.queryByText("header: 0");
    expect(modal).not.toBeInTheDocument();

    await userEvent.click(addModalButton);
    await userEvent.click(addModalButton);
    await userEvent.click(addModalButton);

    modal = await screen.getByText("header: 0");

    expect(modal).toBeVisible();

    const confirm = screen.getByText("OK");

    await userEvent.click(confirm);

    modal = await screen.queryByText("header: 0");
    expect(modal).not.toBeInTheDocument();

    modal = await screen.getByText("header: 1");
    expect(modal).toBeVisible();

    await userEvent.click(confirm);

    modal = await screen.queryByText("header: 1");
    expect(modal).not.toBeInTheDocument();

    modal = await screen.getByText("header: 2");
    expect(modal).toBeVisible();

    await userEvent.click(confirm);

    modal = await screen.queryByText("header: 2");
    expect(modal).not.toBeInTheDocument();
  });

  it("should display undismissable modals", async () => {
    render(
      <GlobalModalProvider>
        <InfoModalUsage />
      </GlobalModalProvider>
    );

    const addModalButton = await screen.getByRole("button");

    await userEvent.click(addModalButton);

    const modal = await screen.getByTestId("global-info-modal");

    const dismiss = modal.querySelector("button svg.icon-cancel");

    expect(dismiss).not.toBeInTheDocument();
  });
});

describe("useInfoModal", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should hide pending info modals for 'interModalDelayMillis' milliseconds", () => {
    render(
      <GlobalModalProvider interModalDelayMillis={500}>
        <InfoModalUsage />
      </GlobalModalProvider>
    );

    const addModalButton = screen.getByRole("button");

    expect(addModalButton).toBeVisible();

    act(() => addModalButton.click());
    act(() => addModalButton.click());

    let modal: HTMLElement | null = screen.getByTestId("global-info-modal");

    expect(modal).toHaveTextContent("header: 0");

    const confirm = within(modal).getByRole("button", { name: "OK" });

    expect(confirm).toBeVisible();

    act(() => confirm.click());

    modal = screen.queryByTestId("global-info-modal");

    expect(modal).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(499);
    });

    modal = screen.queryByTestId("global-info-modal");

    expect(modal).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    modal = screen.getByTestId("global-info-modal");

    expect(modal).toHaveTextContent("header: 1");
  });
});
