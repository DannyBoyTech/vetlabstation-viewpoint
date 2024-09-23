import { beforeEach, describe, expect, vi } from "vitest";
import { useEventListener } from "../../context/EventSourceContext";
import { render } from "../../../test-utils/test-utils";
import { TestId, UsbCopyProgressDialog } from "./UsbCopyProgressDialog";
import { act, waitFor, within } from "@testing-library/react";
import faker from "faker";
import userEvent from "@testing-library/user-event";

vi.mock("../../context/EventSourceContext", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  useEventListener: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("USB Copy progress dialog", () => {
  it("renders progress bar based on percent complete in copy message", async () => {
    const copyId = faker.datatype.uuid();
    const { container } = render(
      <UsbCopyProgressDialog open={true} onCancel={vi.fn()} copyId={copyId} />
    );

    const progressBar = container.getElementsByClassName(
      "spot-progress-bar__value"
    )[0];
    expect(progressBar).toBeVisible();
    expect(progressBar).toHaveStyle("width: 0%");

    // Invoke callback with progress, verify progress bar is updated
    const callback = vi.mocked(useEventListener).mock.calls[0][1];
    expect(callback).toBeDefined();
    const data = { copyId, percentComplete: 50 };
    act(() =>
      callback({
        data: JSON.stringify(data),
      } as MessageEvent)
    );

    expect(progressBar).toHaveStyle("width: 50%");
  });

  it("invokes onComplete callback when percent complete is 100", async () => {
    const copyId = faker.datatype.uuid();
    const onComplete = vi.fn();
    render(
      <UsbCopyProgressDialog
        open={true}
        onCancel={vi.fn()}
        copyId={copyId}
        onComplete={onComplete}
      />
    );

    expect(onComplete).not.toHaveBeenCalled();

    const callback = vi.mocked(useEventListener).mock.calls[0][1];
    expect(callback).toBeDefined();
    const data = { copyId, percentComplete: 100 };
    act(() =>
      callback({
        data: JSON.stringify(data),
      } as MessageEvent)
    );

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it("shows an error if percent complete is a negative number, indicating copy error", async () => {
    const copyId = faker.datatype.uuid();
    const onCancel = vi.fn();
    const { findByTestId } = render(
      <UsbCopyProgressDialog open={true} onCancel={onCancel} copyId={copyId} />
    );

    const callback = vi.mocked(useEventListener).mock.calls[0][1];
    expect(callback).toBeDefined();
    const data = { copyId, percentComplete: -1 };
    act(() =>
      callback({
        data: JSON.stringify(data),
      } as MessageEvent)
    );

    const errorModal = await findByTestId(TestId.ErrorModal);
    expect(errorModal).toBeVisible();

    expect(onCancel).not.toHaveBeenCalled();
    await userEvent.click(
      await within(errorModal).findByRole("button", { name: "OK" })
    );
    expect(onCancel).toHaveBeenCalled();
  });
});
