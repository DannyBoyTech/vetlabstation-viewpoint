import { useEventListener } from "../../../../context/EventSourceContext";

vi.mock("../../../../context/EventSourceContext", async (orig) => ({
  ...((await orig()) as any),
  useEventListener: vi.fn(),
}));

const mockUpdateSettings = vi.fn();
vi.mock("../../../../api/InstrumentApi", () => ({
  useRequestInstrumentSettingsUpdateMutation: () => [mockUpdateSettings],
}));

import { beforeEach, describe, expect, vi } from "vitest";
import {
  EventIds,
  InstrumentSettingKey,
  InstrumentSettingResponseDto,
} from "@viewpoint/api";
import { act, screen } from "@testing-library/react";
import { render } from "../../../../../test-utils/test-utils";
import { LightTheme } from "../../../../utils/StyleConstants";
import { TestId, UpdateStatus } from "./UpdateSettingsModal";

describe("UpdateStatus", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("updates status to green checkmark when message status is successful", async () => {
    const onResponse = vi.fn();
    render(
      <UpdateStatus
        requestSubmitted={true}
        settingKey={InstrumentSettingKey.ALB_OFFSET}
        instrumentId={1}
        onResponse={onResponse}
      />
    );

    expect(
      await screen.getByTestId(TestId.UpdateStatusPlaceholder)
    ).toHaveTextContent("Waiting");
    expect(
      await screen.queryByTestId(TestId.UpdateStatusIcon)
    ).not.toBeInTheDocument();

    expect(useEventListener).toHaveBeenCalledWith(
      EventIds.InstrumentSettingsUpdated,
      expect.anything()
    );
    const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];

    const payload: InstrumentSettingResponseDto = {
      setting: {
        settingKey: InstrumentSettingKey.ALB_OFFSET,
        value: 1.234,
      },
      instrumentId: 1,
      success: true,
    };

    await act(() =>
      eventCallback({ data: JSON.stringify(payload) } as MessageEvent)
    );

    const statusIcon = await screen.getByTestId(TestId.UpdateStatusIcon);
    expect(statusIcon).toHaveClass("icon-checkmark");
    expect(statusIcon).toHaveStyle(
      `fill: ${LightTheme.colors?.feedback?.success}`
    );
    expect(onResponse).toHaveBeenCalledTimes(1);
  });

  it("updates status to red x when update is not successful", async () => {
    const onResponse = vi.fn();
    render(
      <UpdateStatus
        requestSubmitted={true}
        settingKey={InstrumentSettingKey.ALB_OFFSET}
        instrumentId={1}
        onResponse={onResponse}
      />
    );
    const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];

    const payload: InstrumentSettingResponseDto = {
      setting: {
        settingKey: InstrumentSettingKey.ALB_OFFSET,
        value: 1.234,
      },
      instrumentId: 1,
      success: false,
      error: "Ruh roh",
    };

    await act(() =>
      eventCallback({ data: JSON.stringify(payload) } as MessageEvent)
    );

    const statusIcon = await screen.getByTestId(TestId.UpdateStatusIcon);
    expect(statusIcon).toHaveClass("icon-cancel");
    expect(statusIcon).toHaveStyle(
      `fill: ${LightTheme.colors?.feedback?.error}`
    );
    expect(await screen.getByTestId(TestId.UpdateStatusText)).toHaveTextContent(
      "Ruh roh"
    );
    expect(onResponse).toHaveBeenCalledTimes(1);
  });

  it("ignores updates for different instruments", async () => {
    const onResponse = vi.fn();
    render(
      <UpdateStatus
        requestSubmitted={true}
        settingKey={InstrumentSettingKey.ALB_OFFSET}
        instrumentId={1}
        onResponse={onResponse}
      />
    );
    const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];

    const payload: InstrumentSettingResponseDto = {
      setting: {
        settingKey: InstrumentSettingKey.ALB_OFFSET,
        value: 1.234,
      },
      instrumentId: 2,
      success: true,
    };

    await act(() =>
      eventCallback({ data: JSON.stringify(payload) } as MessageEvent)
    );

    expect(
      await screen.getByTestId(TestId.UpdateStatusPlaceholder)
    ).toHaveTextContent("Waiting");
    expect(
      await screen.queryByTestId(TestId.UpdateStatusIcon)
    ).not.toBeInTheDocument();
    expect(onResponse).not.toHaveBeenCalled();
  });

  it("ignores updates for different setting types", async () => {
    const onResponse = vi.fn();
    render(
      <UpdateStatus
        requestSubmitted={true}
        settingKey={InstrumentSettingKey.CA_OFFSET}
        instrumentId={1}
        onResponse={onResponse}
      />
    );
    const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];

    const payload: InstrumentSettingResponseDto = {
      setting: {
        settingKey: InstrumentSettingKey.ALB_OFFSET,
        value: 1.234,
      },
      instrumentId: 1,
      success: true,
    };

    await act(() =>
      eventCallback({ data: JSON.stringify(payload) } as MessageEvent)
    );

    expect(
      await screen.getByTestId(TestId.UpdateStatusPlaceholder)
    ).toHaveTextContent("Waiting");
    expect(
      await screen.queryByTestId(TestId.UpdateStatusIcon)
    ).not.toBeInTheDocument();
    expect(onResponse).not.toHaveBeenCalled();
  });

  it("ignores updates until a request has been submitted", async () => {
    const onResponse = vi.fn();
    const { rerender } = render(
      <UpdateStatus
        requestSubmitted={false}
        settingKey={InstrumentSettingKey.ALB_OFFSET}
        instrumentId={1}
        onResponse={onResponse}
      />
    );
    let eventCallback = vi.mocked(useEventListener).mock.calls[0][1];

    const payload: InstrumentSettingResponseDto = {
      setting: {
        settingKey: InstrumentSettingKey.ALB_OFFSET,
        value: 1.234,
      },
      instrumentId: 1,
      success: true,
    };

    // Callback with a payload that matches what the component is looking for
    await act(() =>
      eventCallback({ data: JSON.stringify(payload) } as MessageEvent)
    );

    // No updates
    expect(
      await screen.getByTestId(TestId.UpdateStatusPlaceholder)
    ).toHaveTextContent("Waiting");
    expect(
      await screen.queryByTestId(TestId.UpdateStatusIcon)
    ).not.toBeInTheDocument();
    expect(onResponse).not.toHaveBeenCalled();

    vi.resetAllMocks();

    // Re-render with requestSubmitted === true
    rerender(
      <UpdateStatus
        requestSubmitted={true}
        settingKey={InstrumentSettingKey.ALB_OFFSET}
        instrumentId={1}
        onResponse={onResponse}
      />
    );
    // Resend the event
    eventCallback = vi.mocked(useEventListener).mock.calls[0][1];
    await act(() =>
      eventCallback({ data: JSON.stringify(payload) } as MessageEvent)
    );
    expect(await screen.getByTestId(TestId.UpdateStatusIcon)).toHaveClass(
      "icon-checkmark"
    );
  });
});
