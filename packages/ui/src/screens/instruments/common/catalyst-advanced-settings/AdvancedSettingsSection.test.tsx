import { useEventListener } from "../../../../context/EventSourceContext";

vi.mock("../../../../context/EventSourceContext", async (orig) => ({
  ...((await orig()) as any),
  useEventListener: vi.fn(),
}));

const mockUpdateSettings = vi.fn();
vi.mock("../../../../api/InstrumentApi", () => ({
  useRequestInstrumentSettingsUpdateMutation: () => [mockUpdateSettings],
}));

import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../../../../test-utils/test-utils";
import { AdvancedSettingValueCell } from "./AdvancedSettingsSection";
import {
  EventIds,
  InstrumentSettingKey,
  InstrumentSettingResponseDto,
} from "@viewpoint/api";

describe("AdvancedSettingValueCell", () => {
  it("requests settings update on mount", () => {
    render(
      <AdvancedSettingValueCell
        settingKey={InstrumentSettingKey.CA_OFFSET_DATE}
        instrumentId={1}
      />
    );
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      instrumentId: 1,
      settingKey: InstrumentSettingKey.CA_OFFSET_DATE,
    });
  });

  it("listens to events and updates its value when changes occur", async () => {
    const onChange = vi.fn();
    render(
      <AdvancedSettingValueCell
        settingKey={InstrumentSettingKey.CA_OFFSET_DATE}
        instrumentId={1}
        onValueChanged={onChange}
      />
    );
    // Placeholder value should be displayed
    expect(await screen.findByText("Retrieving...")).toBeInTheDocument();

    // Get the callback passed to addEventListener
    expect(useEventListener).toHaveBeenCalledWith(
      EventIds.InstrumentSettingsUpdated,
      expect.anything()
    );
    const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];
    // Invoke it
    const payload: InstrumentSettingResponseDto = {
      setting: {
        settingKey: InstrumentSettingKey.CA_OFFSET_DATE,
        value: "12/12/2012",
      },
      instrumentId: 1,
      success: true,
    };

    await act(() =>
      eventCallback({ data: JSON.stringify(payload) } as MessageEvent)
    );

    // Should now display the value
    expect(await screen.findByText("12/12/2012")).toBeInTheDocument();
    // Verify the prop cb was called
    expect(onChange).toHaveBeenCalledWith("12/12/2012");
  });

  it("ignores events for different instruments", async () => {
    const onChange = vi.fn();
    render(
      <AdvancedSettingValueCell
        settingKey={InstrumentSettingKey.CA_OFFSET_DATE}
        instrumentId={1}
        onValueChanged={onChange}
      />
    );

    const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];
    const payload: InstrumentSettingResponseDto = {
      setting: {
        settingKey: InstrumentSettingKey.CA_OFFSET_DATE,
        value: "12/12/2012",
      },
      instrumentId: 2,
      success: true,
    };
    await act(() =>
      eventCallback({ data: JSON.stringify(payload) } as MessageEvent)
    );

    // Text not updated
    expect(await screen.findByText("Retrieving...")).toBeInTheDocument();
    // Prop cb not called
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores events for different settings", async () => {
    const onChange = vi.fn();
    render(
      <AdvancedSettingValueCell
        settingKey={InstrumentSettingKey.CA_OFFSET_DATE}
        instrumentId={1}
        onValueChanged={onChange}
      />
    );

    const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];
    const payload: InstrumentSettingResponseDto = {
      setting: {
        settingKey: InstrumentSettingKey.ALB_OFFSET,
        value: "12/12/2012",
      },
      instrumentId: 1,
      success: true,
    };

    await act(() =>
      eventCallback({ data: JSON.stringify(payload) } as MessageEvent)
    );

    // Text not updated
    expect(await screen.findByText("Retrieving...")).toBeInTheDocument();
    // Prop cb not called
    expect(onChange).not.toHaveBeenCalled();
  });
});
