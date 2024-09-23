import { describe, expect, it, vi } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import {
  DilutionSelector,
  DilutionSelectorProps,
  TestId,
} from "./DilutionSelector";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DilutionTypeEnum,
  InstrumentRunConfigurationDto,
  ValidDilutionType,
} from "@viewpoint/api";
import { useState } from "react";

function DilutionSelectorTestBed(
  props: Omit<DilutionSelectorProps, "dilutionType" | "totalParts">
) {
  const [config, setConfig] = useState<InstrumentRunConfigurationDto>({
    dilutionType: props.partsDiluentConfig.defaultType,
    dilution: 2,
  });

  return (
    <DilutionSelector
      dilutionType={config.dilutionType as ValidDilutionType}
      totalParts={config.dilution!}
      onDilutionChanged={(config) => {
        setConfig(config);
        props.onDilutionChanged(config);
      }}
      partsDiluentConfig={props.partsDiluentConfig}
      modifiable={props.modifiable}
    />
  );
}

describe("dilution selector", () => {
  it("can be modifiable", async () => {
    const onChange = vi.fn();
    render(
      <DilutionSelectorTestBed
        partsDiluentConfig={{
          [DilutionTypeEnum.MANUAL]: [1, 2, 3, 4, 5],
          defaultType: DilutionTypeEnum.MANUAL,
        }}
        modifiable
        onDilutionChanged={onChange}
      />
    );

    // Default starts at the lowest value -- 1 part diluent, 2 parts total
    const partsDiluent = await screen.findByTestId(TestId.PartsDiluentValue);
    const totalParts = await screen.findByTestId(TestId.TotalPartsValue);
    expect(partsDiluent).toHaveTextContent("1");
    expect(totalParts).toHaveTextContent("2");

    // Click the button to increment the parts diluent
    const addButton = await screen.findByTestId(TestId.AddButton);
    await userEvent.click(addButton);

    expect(partsDiluent).toHaveTextContent("2");
    expect(totalParts).toHaveTextContent("3");

    // Subtract
    const subtractButton = await screen.findByTestId(TestId.SubtractButton);
    await userEvent.click(subtractButton);
    expect(partsDiluent).toHaveTextContent("1");
    expect(totalParts).toHaveTextContent("2");

    expect(onChange).toHaveBeenCalledWith({
      dilutionType: DilutionTypeEnum.MANUAL,
      dilution: 3,
    });
    expect(onChange).toHaveBeenCalledWith({
      dilutionType: DilutionTypeEnum.MANUAL,
      dilution: 2,
    });
  });

  it("can be unmodifiable", async () => {
    render(
      <DilutionSelectorTestBed
        partsDiluentConfig={{
          [DilutionTypeEnum.MANUAL]: [1, 2, 3, 4, 5],
          defaultType: DilutionTypeEnum.MANUAL,
        }}
        modifiable={false}
        onDilutionChanged={vi.fn()}
      />
    );

    expect(
      await screen.queryByTestId(TestId.AddButton)
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(TestId.SubtractButton)
    ).not.toBeInTheDocument();
  });

  it("can use a different sequence of diluent values", async () => {
    render(
      <DilutionSelectorTestBed
        partsDiluentConfig={{
          [DilutionTypeEnum.MANUAL]: [1, 3, 5, 9],
          defaultType: DilutionTypeEnum.MANUAL,
        }}
        modifiable
        onDilutionChanged={vi.fn()}
      />
    );
    const partsDiluent = await screen.findByTestId(TestId.PartsDiluentValue);
    const totalParts = await screen.findByTestId(TestId.TotalPartsValue);
    const addButton = await screen.findByTestId(TestId.AddButton);

    // Default
    expect(partsDiluent).toHaveTextContent("1");
    expect(totalParts).toHaveTextContent("2");

    await userEvent.click(addButton);
    expect(partsDiluent).toHaveTextContent("3");
    expect(totalParts).toHaveTextContent("4");

    await userEvent.click(addButton);
    expect(partsDiluent).toHaveTextContent("5");
    expect(totalParts).toHaveTextContent("6");

    await userEvent.click(addButton);
    expect(partsDiluent).toHaveTextContent("9");
    expect(totalParts).toHaveTextContent("10");
  });

  it("removes subtract button when at the beginning of the diluent values", async () => {
    render(
      <DilutionSelectorTestBed
        partsDiluentConfig={{
          [DilutionTypeEnum.MANUAL]: [1, 2, 3, 4, 5],
          defaultType: DilutionTypeEnum.MANUAL,
        }}
        modifiable
        onDilutionChanged={vi.fn()}
      />
    );

    expect(
      await screen.queryByTestId(TestId.SubtractButton)
    ).not.toBeInTheDocument();
  });

  it("removes add button when at the end of the diluent values", async () => {
    render(
      <DilutionSelectorTestBed
        partsDiluentConfig={{
          [DilutionTypeEnum.MANUAL]: [1, 2, 3, 4, 5],
          defaultType: DilutionTypeEnum.MANUAL,
        }}
        modifiable
        onDilutionChanged={vi.fn()}
      />
    );
    const addButton = await screen.findByTestId(TestId.AddButton);
    await userEvent.click(addButton);
    await userEvent.click(addButton);
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    expect(addButton).not.toBeInTheDocument();
  });

  it("allows toggling between automated and manual dilution", async () => {
    const onChange = vi.fn();
    render(
      <DilutionSelectorTestBed
        partsDiluentConfig={{
          [DilutionTypeEnum.MANUAL]: [1, 2, 3, 4, 5],
          [DilutionTypeEnum.AUTOMATIC]: [1, 2, 3, 4, 5],
          defaultType: DilutionTypeEnum.AUTOMATIC,
        }}
        onDilutionChanged={onChange}
        modifiable
      />
    );
    // Change to manual
    await userEvent.click(await screen.findByTestId(TestId.ManualRadio));

    expect(onChange).toHaveBeenCalledWith({
      dilutionType: DilutionTypeEnum.MANUAL,
      dilution: 2,
    });

    // Verify selecting manual automatically unchecks automated
    expect(await screen.findByTestId(TestId.AutomatedRadio)).not.toBeChecked();
  });
});
