import { describe, expect, it, vi } from "vitest";
import {
  DilutionDisplayConfig,
  DilutionTypeEnum,
  InstrumentRunConfigurationDto,
  InstrumentStatusDto,
  InstrumentType,
  RunConfiguration,
  SampleTypeDto,
  SampleTypeEnum,
  SpeciesType,
  TestProtocolEnum,
} from "@viewpoint/api";
import { screen } from "@testing-library/react";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  RunConfigurationPanel,
  RunConfigurationProps,
} from "./RunConfigurations";
import { TestId as SampleTypeTestId } from "./SampleTypeConfiguration";
import { TestId as ToggleTestId } from "./RunConfigToggle";
import { render } from "../../../test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import { TestId as DilutionSelectorTestId } from "./dilution/DilutionSelector";
import i18n from "i18next";

const SAMPLE_TYPES: SampleTypeDto[] = [
  {
    id: 2,
    name: SampleTypeEnum.ABDOMINAL,
  },
  {
    id: 3,
    name: SampleTypeEnum.CSF,
  },
  {
    id: 1,
    name: SampleTypeEnum.URINE,
  },
  {
    id: 4,
    name: SampleTypeEnum.SYNOVIAL,
  },
  {
    id: 5,
    name: SampleTypeEnum.THORACIC,
  },
  {
    id: 6,
    name: SampleTypeEnum.CSF,
  },
];

describe("RunConfigurations", () => {
  describe("sample type", () => {
    it("renders sample types for instruments that support sample type configuration and honors the default", async () => {
      const { instrument }: InstrumentStatusDto = randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.SediVueDx,
          supportedRunConfigurations: [RunConfiguration.SAMPLE_TYPE],
        }),
      });

      const configCb = vi.fn();
      render(
        <RunConfigurationPanel
          instrument={instrument}
          sampleTypes={SAMPLE_TYPES}
          runRequest={{
            instrumentId: 1,
            runQueueId: 1,
            instrumentRunConfigurations: [{ sampleTypeId: 1 }],
          }}
          onConfigurationChanged={configCb}
          speciesType={SpeciesType.Canine}
        />
      );

      // Verify sample type select is rendered
      const sampleTypeSelect: HTMLSelectElement = await screen.findByTestId(
        SampleTypeTestId.SampleTypeSelect
      );
      expect(sampleTypeSelect).toBeInTheDocument();
      // Verify default value is "Urine" (marked as default above)
      expect(sampleTypeSelect.value).to.eq("1");

      // Change the selection, verify CB is invoked with the new selection's ID
      await userEvent.selectOptions(sampleTypeSelect, "Synovial");
      expect(configCb).toHaveBeenCalledWith(1, [
        {
          sampleTypeId: 4,
        },
      ]);
    });

    it("does not render sample type selection if the instrument does not support it", async () => {
      const { instrument }: InstrumentStatusDto = randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.CatalystDx,
          supportedRunConfigurations: [],
        }),
      });

      render(
        <RunConfigurationPanel
          instrument={instrument}
          runRequest={{
            instrumentId: 1,
            runQueueId: 1,
            instrumentRunConfigurations: [],
          }}
          sampleTypes={SAMPLE_TYPES}
          speciesType={SpeciesType.Canine}
        />
      );

      // Verify sample type select is rendered
      const sampleTypeSelect = await screen.queryByTestId(
        SampleTypeTestId.SampleTypeSelect
      );
      expect(sampleTypeSelect).not.toBeInTheDocument();
    });

    it("resets sample type selection if the user has selected one but then the list of types changes and does not include their selection", async () => {
      const { instrument }: InstrumentStatusDto = randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.SediVueDx,
          supportedRunConfigurations: [RunConfiguration.SAMPLE_TYPE],
        }),
      });

      const configCb = vi.fn();

      // Choose Synovial
      const component = render(
        <RunConfigurationPanel
          instrument={instrument}
          sampleTypes={SAMPLE_TYPES}
          runRequest={{
            instrumentId: 1,
            runQueueId: 1,
            instrumentRunConfigurations: [
              {
                sampleTypeId: 4,
              },
            ],
          }}
          onConfigurationChanged={configCb}
          speciesType={SpeciesType.Canine}
        />
      );

      // Update the list and remove Synovial
      configCb.mockReset();
      component.rerender(
        <RunConfigurationPanel
          instrument={instrument}
          runRequest={{
            instrumentId: 1,
            runQueueId: 1,
            instrumentRunConfigurations: [
              {
                sampleTypeId: 4,
              },
            ],
          }}
          sampleTypes={SAMPLE_TYPES.slice(0, 2)}
          onConfigurationChanged={configCb}
          speciesType={SpeciesType.Canine}
        />
      );
      // Verify CB was called and sampleTypeId reset to undefined
      expect(configCb).toHaveBeenCalledWith(1, [
        {
          sampleTypeId: undefined,
        },
      ]);
    });

    it("retains user selection if the sample type list changes but the user's selection is still valid", async () => {
      const { instrument }: InstrumentStatusDto = randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.SediVueDx,
          supportedRunConfigurations: [RunConfiguration.SAMPLE_TYPE],
        }),
      });

      const configCb = vi.fn();
      const component = render(
        <RunConfigurationPanel
          instrument={instrument}
          runRequest={{
            instrumentId: 1,
            runQueueId: 1,
            instrumentRunConfigurations: [],
          }}
          sampleTypes={SAMPLE_TYPES}
          onConfigurationChanged={configCb}
          speciesType={SpeciesType.Canine}
        />
      );

      // Choose CSF
      const sampleTypeSelect = await screen.findByTestId(
        SampleTypeTestId.SampleTypeSelect
      );
      await userEvent.selectOptions(sampleTypeSelect, "CSF");
      expect(configCb).toHaveBeenCalledWith(1, [
        {
          sampleTypeId: 3,
        },
      ]);

      // Update the list and remove Synovial, keep CSF
      configCb.mockReset();
      component.rerender(
        <RunConfigurationPanel
          instrument={instrument}
          runRequest={{
            instrumentId: 1,
            runQueueId: 1,
            instrumentRunConfigurations: [],
          }}
          sampleTypes={SAMPLE_TYPES}
          onConfigurationChanged={configCb}
          speciesType={SpeciesType.Canine}
        />
      );
      // Verify it was not reset
      expect(configCb).not.toHaveBeenCalled();
    });
  });

  describe("catalyst one run configuration", () => {
    const { instrument }: InstrumentStatusDto = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
        supportedRunConfigurations: [
          RunConfiguration.DILUTION,
          RunConfiguration.UPC,
        ],
      }),
    });
    const defaultRunConfig: InstrumentRunConfigurationDto = {
      dilution: 1,
      dilutionType: DilutionTypeEnum.NOTDEFINED,
    };
    const dilutionDisplayConfig: DilutionDisplayConfig = {
      [DilutionTypeEnum.AUTOMATIC]: [1, 3, 5, 9],
      [DilutionTypeEnum.MANUAL]: new Array(10)
        .fill(1)
        .map((_v, index) => index + 1),
      [DilutionTypeEnum.UPCAUTOMATIC]: [20],
      defaultType: DilutionTypeEnum.AUTOMATIC,
    };

    it("allows user to select UPC", async () => {
      const configCb = vi.fn();

      // Render
      const defaultProps: RunConfigurationProps = {
        instrument,
        dilutionDisplayConfig,
        onConfigurationChanged: configCb,
        defaultRunConfiguration: defaultRunConfig,
        runRequest: {
          instrumentId: 1,
          runQueueId: 1,
          instrumentRunConfigurations: [{ ...defaultRunConfig }],
        },
        speciesType: SpeciesType.Canine,
      };
      const { rerender } = render(<RunConfigurationPanel {...defaultProps} />);
      // Click UPC
      await userEvent.click(
        await screen.findByTestId(
          ToggleTestId.ToggleLabel(RunConfiguration.UPC)
        )
      );
      expect(configCb).toHaveBeenCalledWith(1, [
        { dilution: 21, dilutionType: DilutionTypeEnum.UPCAUTOMATIC },
      ]);
      rerender(
        <RunConfigurationPanel
          {...defaultProps}
          runRequest={{
            instrumentId: 1,
            runQueueId: 1,
            instrumentRunConfigurations: [
              { dilution: 21, dilutionType: DilutionTypeEnum.UPCAUTOMATIC },
            ],
          }}
        />
      );
      // Verify hidden radio input for UPC is checked
      expect(
        await screen.findByTestId(
          ToggleTestId.ToggleInput(RunConfiguration.UPC)
        )
      ).toBeChecked();
      // Verify label indicates UPC is selected
      expect(await screen.findByText("UPC - 1:21")).toBeInTheDocument();
      // Verify user can't modify by using add/subtract buttons
      expect(
        await screen.queryByTestId(DilutionSelectorTestId.AddButton)
      ).not.toBeInTheDocument();
      expect(
        await screen.queryByTestId(DilutionSelectorTestId.SubtractButton)
      ).not.toBeInTheDocument();
      // Verify callback
      expect(configCb).toHaveBeenCalledWith(1, [
        {
          dilution: 21,
          dilutionType: DilutionTypeEnum.UPCAUTOMATIC,
        },
      ]);
    });

    it("allows user to deselect their last selection", async () => {
      const configCb = vi.fn();

      // Render
      const defaultProps: RunConfigurationProps = {
        instrument,
        dilutionDisplayConfig,
        onConfigurationChanged: configCb,
        defaultRunConfiguration: defaultRunConfig,
        runRequest: {
          instrumentId: 1,
          runQueueId: 1,
          instrumentRunConfigurations: [{ ...defaultRunConfig }],
        },
        speciesType: SpeciesType.Canine,
      };
      const { rerender } = render(<RunConfigurationPanel {...defaultProps} />);
      // Click UPC
      await userEvent.click(
        await screen.findByTestId(
          ToggleTestId.ToggleLabel(RunConfiguration.UPC)
        )
      );
      expect(configCb).toHaveBeenCalledWith(1, [
        { dilution: 21, dilutionType: DilutionTypeEnum.UPCAUTOMATIC },
      ]);
      rerender(
        <RunConfigurationPanel
          {...defaultProps}
          runRequest={{
            instrumentId: 1,
            runQueueId: 1,
            instrumentRunConfigurations: [
              { dilution: 21, dilutionType: DilutionTypeEnum.UPCAUTOMATIC },
            ],
          }}
        />
      );
      // Verify hidden radio input for UPC is checked
      expect(
        await screen.findByTestId(
          ToggleTestId.ToggleInput(RunConfiguration.UPC)
        )
      ).toBeChecked();

      // Deselect UPC
      await userEvent.click(
        await screen.findByTestId(
          ToggleTestId.ToggleLabel(RunConfiguration.UPC)
        )
      );
      expect(configCb).toHaveBeenLastCalledWith(1, [{ ...defaultRunConfig }]);
      rerender(<RunConfigurationPanel {...defaultProps} />);
      // Verify both hidden radio inputs are unchecked
      expect(
        await screen.findByTestId(
          ToggleTestId.ToggleInput(RunConfiguration.DILUTION)
        )
      ).not.toBeChecked();
      expect(
        await screen.findByTestId(
          ToggleTestId.ToggleInput(RunConfiguration.UPC)
        )
      ).not.toBeChecked();
      // Verify dilution panel is gone
      expect(
        await screen.queryByTestId(DilutionSelectorTestId.Root)
      ).not.toBeInTheDocument();
    });
  });

  describe("sedivue run configs", () => {
    const { instrument }: InstrumentStatusDto = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
        supportedRunConfigurations: [
          RunConfiguration.DILUTION,
          RunConfiguration.BACTERIA_REFLEX,
          RunConfiguration.SAMPLE_TYPE,
        ],
      }),
    });
    const sampleTypes: SampleTypeDto[] = [
      {
        id: 1,
        name: SampleTypeEnum.URINE,
      },
      {
        id: 2,
        name: SampleTypeEnum.SYNOVIAL,
      },
    ];
    const defaultRunConfig: InstrumentRunConfigurationDto = {
      sampleTypeId: sampleTypes[0].id,
      testProtocol: TestProtocolEnum.FULLANALYSIS,
      dilution: 1,
      dilutionType: DilutionTypeEnum.NOTDEFINED,
    };
    const dilutionDisplayConfig: DilutionDisplayConfig = {
      [DilutionTypeEnum.MANUAL]: new Array(20)
        .fill(1)
        .map((_v, index) => index + 1),
      defaultType: DilutionTypeEnum.MANUAL,
    };

    it("allows user to select dilution but only allows manual", async () => {
      const configCb = vi.fn();

      // Render
      render(
        <RunConfigurationPanel
          instrument={instrument}
          onConfigurationChanged={configCb}
          sampleTypes={sampleTypes}
          defaultRunConfiguration={defaultRunConfig}
          runRequest={{
            instrumentId: 1,
            runQueueId: 1,
            instrumentRunConfigurations: [{ ...defaultRunConfig }],
          }}
          dilutionDisplayConfig={dilutionDisplayConfig}
          speciesType={SpeciesType.Canine}
        />
      );

      // Click dilution
      await userEvent.click(
        await screen.findByTestId(
          ToggleTestId.ToggleLabel(RunConfiguration.DILUTION)
        )
      );
      expect(
        await screen.findByTestId(DilutionSelectorTestId.AddButton)
      ).toBeInTheDocument();
      expect(
        await screen.queryByTestId(DilutionSelectorTestId.ManualRadio)
      ).not.toBeInTheDocument();
      expect(
        await screen.queryByTestId(DilutionSelectorTestId.AutomatedRadio)
      ).not.toBeInTheDocument();

      await userEvent.click(
        await screen.findByRole("button", { name: "Save" })
      );

      expect(configCb).toHaveBeenCalledWith(1, [
        {
          ...defaultRunConfig,
          dilution: 2,
          dilutionType: DilutionTypeEnum.MANUAL,
        },
      ]);
    });

    describe("validated fluid types", () => {
      const CASES = [
        {
          speciesType: SpeciesType.Canine,
          sampleType: SampleTypeEnum.URINE,
          warningShown: false,
        },
        {
          speciesType: SpeciesType.Feline,
          sampleType: SampleTypeEnum.URINE,
          warningShown: false,
        },
        {
          speciesType: SpeciesType.Canine,
          sampleType: SampleTypeEnum.SYNOVIAL,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Feline,
          sampleType: SampleTypeEnum.THORACIC,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Pig,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Tortoise,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Snake,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Lizard,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Ferret,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Goat,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Sheep,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Llama,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Dolphin,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Monkey,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Rat,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Rabbit,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Bovine,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Alpaca,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.SeaTurtle,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Gerbil,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.GuineaPig,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.MiniPig,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Camel,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Hamster,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
        {
          speciesType: SpeciesType.Other,
          sampleType: SampleTypeEnum.URINE,
          warningShown: true,
        },
      ];

      it.each(CASES)(
        "sets fluid warning visible: $warningShown for species $speciesType and sample $sampleType",
        async ({ speciesType, sampleType, warningShown }) => {
          const configCb = vi.fn();
          // Render
          render(
            <RunConfigurationPanel
              instrument={instrument}
              onConfigurationChanged={configCb}
              defaultRunConfiguration={defaultRunConfig}
              runRequest={{
                instrumentId: 1,
                runQueueId: 1,
                instrumentRunConfigurations: [
                  {
                    sampleTypeId: SAMPLE_TYPES.find(
                      (st) => st.name === sampleType
                    )?.id,
                  },
                ],
              }}
              sampleTypes={sampleTypes}
              dilutionDisplayConfig={dilutionDisplayConfig}
              speciesType={speciesType}
            />
          );
          if (warningShown) {
            expect(
              await screen.findByText(
                "Fluid type has not been validated. For research purposes only."
              )
            ).toBeVisible();
          } else {
            expect(
              await screen.queryByText(
                "Fluid type has not been validated. For research purposes only."
              )
            ).not.toBeInTheDocument();
          }
        }
      );
    });

    describe("bacteria reflex", () => {
      const CASES = [
        {
          speciesType: SpeciesType.Canine,
          sampleType: SampleTypeEnum.URINE,
          visible: true,
        },
        {
          speciesType: SpeciesType.Feline,
          sampleType: SampleTypeEnum.URINE,
          visible: true,
        },
        {
          speciesType: SpeciesType.Canine,
          sampleType: SampleTypeEnum.SYNOVIAL,
          visible: false,
        },
        {
          speciesType: SpeciesType.Feline,
          sampleType: SampleTypeEnum.SYNOVIAL,
          visible: false,
        },
        {
          speciesType: SpeciesType.Pig,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Tortoise,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Snake,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Lizard,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Ferret,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Goat,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Sheep,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Llama,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Dolphin,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Monkey,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Rat,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Rabbit,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Bovine,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Alpaca,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.SeaTurtle,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Gerbil,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.GuineaPig,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.MiniPig,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Camel,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Hamster,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
        {
          speciesType: SpeciesType.Other,
          sampleType: SampleTypeEnum.URINE,
          visible: false,
        },
      ];

      it.each(CASES)(
        "shows bacteria reflex: $visible when species is $speciesType and sample type is $sampleType",
        async ({ speciesType, sampleType, visible }) => {
          const configCb = vi.fn();
          // Render
          render(
            <RunConfigurationPanel
              instrument={instrument}
              onConfigurationChanged={configCb}
              defaultRunConfiguration={defaultRunConfig}
              sampleTypes={sampleTypes}
              runRequest={{
                instrumentId: 1,
                runQueueId: 1,
                instrumentRunConfigurations: [
                  {
                    sampleTypeId: SAMPLE_TYPES.find(
                      (st) => st.name === sampleType
                    )?.id,
                  },
                ],
              }}
              dilutionDisplayConfig={dilutionDisplayConfig}
              speciesType={speciesType}
            />
          );
          if (visible) {
            expect(
              await screen.findByTestId(
                ToggleTestId.ToggleLabel(RunConfiguration.BACTERIA_REFLEX)
              )
            ).toBeVisible();

            // Click bacteria reflex
            await userEvent.click(
              await screen.findByTestId(
                ToggleTestId.ToggleLabel(RunConfiguration.BACTERIA_REFLEX)
              )
            );

            // Verify the bacteria reflex instructions are displayed
            expect(
              await screen.findByText(
                i18n.t(
                  "orderFulfillment.runConfig.BACTERIA_REFLEX.toggle"
                ) as string
              )
            ).toBeInTheDocument();

            expect(configCb).toHaveBeenCalledWith(1, [
              {
                dilution: 1,
                dilutionType: DilutionTypeEnum.NOTDEFINED,
                sampleTypeId: 1,
                testProtocol: TestProtocolEnum.BACTERIALREFLEX,
              },
            ]);
          } else {
            expect(
              await screen.queryByTestId(
                ToggleTestId.ToggleLabel(RunConfiguration.BACTERIA_REFLEX)
              )
            ).not.toBeInTheDocument();
          }
        }
      );

      it("resets test protocol if user is on bacteria reflex but changes sample type", async () => {
        const configCb = vi.fn();

        // Render with urine selected
        render(
          <RunConfigurationPanel
            instrument={instrument}
            onConfigurationChanged={configCb}
            sampleTypes={sampleTypes}
            defaultRunConfiguration={defaultRunConfig}
            runRequest={{
              instrumentId: 1,
              runQueueId: 1,
              instrumentRunConfigurations: [{ ...defaultRunConfig }],
            }}
            dilutionDisplayConfig={dilutionDisplayConfig}
            speciesType={SpeciesType.Canine}
          />
        );

        // Click confirm bacteria
        await userEvent.click(
          await screen.findByTestId(
            ToggleTestId.ToggleLabel(RunConfiguration.BACTERIA_REFLEX)
          )
        );

        // Verify the CB
        expect(configCb).toHaveBeenCalledWith(1, [
          {
            dilution: 1,
            dilutionType: DilutionTypeEnum.NOTDEFINED,
            sampleTypeId: 1,
            testProtocol: TestProtocolEnum.BACTERIALREFLEX,
          },
        ]);

        // Change sample type
        const sampleTypeSelect: HTMLSelectElement = await screen.findByTestId(
          SampleTypeTestId.SampleTypeSelect
        );
        await userEvent.selectOptions(sampleTypeSelect, "2");

        // Verify it was reset to full analysis
        expect(configCb).toHaveBeenCalledWith(1, [
          {
            sampleTypeId: 2,
            dilution: 1,
            dilutionType: DilutionTypeEnum.NOTDEFINED,
            testProtocol: TestProtocolEnum.FULLANALYSIS,
          },
        ]);
      });
    });
  });

  // it("allows multiple instances of the run configuration panel", async () => {
  //   const { instrument }: InstrumentStatusDto = randomInstrumentStatus({
  //     instrument: randomInstrumentDto({
  //       instrumentType: InstrumentType.SediVueDx,
  //       supportedRunConfigurations: [RunConfiguration.SAMPLE_TYPE],
  //     }),
  //   });
  //
  //   const configCb = vi.fn();
  //   render(
  //     <RunConfigurationPanel
  //       instrument={instrument}
  //       runRequest={[
  //         {
  //           instrumentId: 1,
  //           runQueueId: 1,
  //           instrumentRunConfigurations: [],
  //         },
  //         {
  //           instrumentId: 1,
  //           runQueueId: 2,
  //           instrumentRunConfigurations: [],
  //         },
  //         {
  //           instrumentId: 1,
  //           runQueueId: 3,
  //           instrumentRunConfigurations: [],
  //         },
  //       ]}
  //       sampleTypes={SAMPLE_TYPES}
  //       onConfigurationChanged={configCb}
  //       speciesType={SpeciesType.Canine}
  //     />
  //   );
  //
  //   const tabOne = await screen.findByTestId(RunConfigTestId.Tab(0));
  //   const tabTwo = await screen.findByTestId(RunConfigTestId.Tab(1));
  //   const tabThree = await screen.findByTestId(RunConfigTestId.Tab(2));
  //   const sampleTypeSelect = await screen.findByTestId(
  //     SampleTypeTestId.SampleTypeSelect
  //   );
  //   expect(tabOne).toBeInTheDocument();
  //   expect(tabTwo).toBeInTheDocument();
  //   expect(tabThree).toBeInTheDocument();
  //
  //   // Select different values for tab 1 and 3, leave 2 as default (urine)
  //   await userEvent.click(tabOne);
  //   await userEvent.selectOptions(sampleTypeSelect, "CSF");
  //
  //   await userEvent.click(tabThree);
  //   await userEvent.selectOptions(sampleTypeSelect, "Synovial");
  //
  //   expect(configCb).toHaveBeenCalledWith(1, [{ sampleTypeId: 3 }]);
  //   expect(configCb).toHaveBeenCalledWith(3, [{ sampleTypeId: 4 }]);
  // });
});
