import {
  AdditionalAssays,
  Clarity,
  CollectionMethod,
  Color,
  ManualUAResults,
  PHValues,
} from "@viewpoint/api";
import { SpotText, ValidationError } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  ConstantColors,
  getClarityImagePath,
  getCollectionMethodImagePath,
  getColorImagePath,
  PHColors,
} from "./MUAStyleConstants";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import type { ManualUAEntryPageResults } from "./ManualUAResultEntry";
import { CustomizableDropdown } from "../../customizable-dropdown/CustomizableDropdown";
import { Theme } from "../../../utils/StyleConstants";
import { MaskedInput } from "../../input/MaskedInput";
import {
  Box,
  SelectableBox,
  TestId as ParentTestId,
} from "./common-components";
import { braidArray } from "../../../utils/general-utils";
import { SpotPopover } from "../../popover/Popover";
import { ClearableNumPad } from "../../keyboard/ClearableNumPad";
import { FloatingKeyboardContainer } from "../../keyboard/keyboard-components";

const PhysicalPageRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  height: 100%;
  overflow-y: auto;
  padding: 3px;
  flex: 1;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const BoxWrapper = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  ${(p: { theme: Theme; selected?: boolean }) =>
    p.selected ? `outline: ${p.theme.borders?.controlFocus};` : ""}
`;

const SgContainer = styled.div`
  .spot-popover::before {
    background-color: ${(p) => p.theme.colors?.background?.secondary};
  }
`;

export const TestId = {
  DropDownHeader: (type: string) => `mua-physical-dropdown-header-${type}`,
  AssayItem: (option: string | number) =>
    `mua-physical-dropdown-option-${option}`,
  SpecificGravityInput: `mua-physical-sg-input`,
  SpecificGravityNumpad: `mua-physical-sg-numpad`,
};

export interface ManualUAPhysicalPageProps {
  results: ManualUAEntryPageResults;
  onResultsChanged: (results: ManualUAResults) => void;
  onComplete: () => void;
  skipChemistries: boolean;
}

const BraidedCollectionMethods = braidArray(
  Object.values(CollectionMethod) as CollectionMethod[]
);
const BraidedColors = braidArray(Object.values(Color) as Color[]);
const BraidedClarity = braidArray(Object.values(Clarity) as Clarity[]);

export function ManualUAPhysicalPage(props: ManualUAPhysicalPageProps) {
  const { t } = useTranslation();

  const [collectionMethodExpanded, setCollectionMethodExpanded] =
    useState(false);
  const [colorExpanded, setColorExpanded] = useState(false);
  const [clarityExpanded, setClarityExpanded] = useState(false);
  const [userHasInteracted, setUserhasInteracted] = useState(false);
  const [sgEntry, setSgEntry] = useState(
    props.results.specificGravity?.toFixed(3) ?? ""
  );
  const [sgError, setSgError] = useState(false);
  const [sgFocused, setSgFocused] = useState(false);
  const sgRef = useRef<HTMLInputElement | null>(null);

  const handleResultChange = (results: Partial<ManualUAEntryPageResults>) => {
    setUserhasInteracted(true);
    props.onResultsChanged({ ...props.results, ...results });
  };

  useEffect(() => {
    const cleaned = sgEntry.replaceAll("_", "").replaceAll(">", "");
    if (cleaned !== `${props.results.specificGravity}`) {
      const isValid = cleaned.length === 5;
      const hasEntry = cleaned.length > 3;
      handleResultChange({
        // Only callback when the full SG amount is entered (5 total chars)
        specificGravity: hasEntry ? parseFloat(cleaned) : undefined,
        sgValid: hasEntry ? isValid : undefined,
      });
      if (isValid) {
        // Blur the input to close the keyboard, but wait a moment so that any previous clicks don't propagate through to close the side panel
        setTimeout(() => sgRef.current?.blur(), 100);
      }
    }
  }, [sgEntry]);

  useEffect(() => {
    if (
      userHasInteracted &&
      props.results.sgValid &&
      props.results.collectionMethod != null &&
      props.results.color != null &&
      props.results.clarity != null &&
      props.results.specificGravity != null &&
      (props.skipChemistries || props.results.ph != null)
    ) {
      // Slight delay before auto-advancing -- since the last action is usually to enter specific gravity
      // via the floating numpad, if we immediately advance and unmount the numpad, it can cause a mis touch to
      // hit the slideout's shade and attempt to close the slide out panel
      setTimeout(props.onComplete, 100);
    }
  }, [props.results]);

  return (
    <PhysicalPageRoot data-testid={ParentTestId.PhysicalPage}>
      <Section>
        <SpotText level="secondary" bold>
          {t("resultsEntry.manualUA.labels.physical")}
        </SpotText>

        <PhysicalDropDown
          expanded={collectionMethodExpanded}
          setExpanded={setCollectionMethodExpanded}
          assayValue={props.results.collectionMethod}
          assayLabel={t("assays.mua.Collec")}
          getValueLabel={(value) =>
            t(`resultsEntry.manualUA.collectionMethod.${value}`)
          }
          availableValues={BraidedCollectionMethods}
          boxBackgroundColor={ConstantColors.CollectionMethod}
          getBoxImageUrl={getCollectionMethodImagePath}
          headerTestId={TestId.DropDownHeader(
            AdditionalAssays.CollectionMethod
          )}
          onValueChanged={(collectionMethod) =>
            handleResultChange({
              ...props.results,
              collectionMethod,
            })
          }
        />

        <PhysicalDropDown
          expanded={colorExpanded}
          setExpanded={setColorExpanded}
          assayValue={props.results.color}
          assayLabel={t("assays.mua.Color")}
          getValueLabel={(value) => t(`resultsEntry.manualUA.color.${value}`)}
          availableValues={BraidedColors}
          boxBackgroundColor={"white"}
          getBoxImageUrl={getColorImagePath}
          onValueChanged={(color) =>
            handleResultChange({ ...props.results, color })
          }
          headerTestId={TestId.DropDownHeader(AdditionalAssays.Color)}
        />

        <PhysicalDropDown
          expanded={clarityExpanded}
          setExpanded={setClarityExpanded}
          assayValue={props.results.clarity}
          assayLabel={t("assays.mua.Clarity")}
          getValueLabel={(value) => t(`resultsEntry.manualUA.clarity.${value}`)}
          availableValues={BraidedClarity}
          boxBackgroundColor={"white"}
          getBoxImageUrl={getClarityImagePath}
          onValueChanged={(clarity) =>
            handleResultChange({ ...props.results, clarity })
          }
          headerTestId={TestId.DropDownHeader(AdditionalAssays.Clarity)}
        />
      </Section>

      <Section>
        <SpotText level="secondary" bold>
          {t("resultsEntry.manualUA.labels.specificGravity")}
        </SpotText>
        <SgContainer>
          <MaskedInput
            mask={props.results.sgGreaterThan ? "{>}{1.\\0}00" : "{1.\\0}00"}
            placeholder={props.results.sgGreaterThan ? ">1.0__" : "1.0__"}
            prefix={props.results.sgGreaterThan ? ">1.0" : "1.0"}
            value={sgEntry}
            onAccept={(value) => setSgEntry(value)}
            onValidationErrorChanged={(error) => setSgError(error)}
            error={sgError}
            style={{ height: "3.5em" }}
            inputRef={sgRef}
            onFocus={() => setSgFocused(true)}
            onBlur={() => setSgFocused(false)}
            data-testid={TestId.SpecificGravityInput}
          />
          {sgFocused && (
            <SpotPopover anchor={sgRef.current} popFrom="left" inset="none">
              <FloatingKeyboardContainer>
                <ClearableNumPad
                  data-testid={TestId.SpecificGravityNumpad}
                  onClearPressed={() => {
                    setSgEntry("");
                    handleResultChange({ sgGreaterThan: undefined });
                  }}
                  onGreaterThanPressed={() => {
                    setSgEntry("");
                    handleResultChange({
                      sgGreaterThan: !props.results.sgGreaterThan,
                    });
                  }}
                  greaterThanEnabled={!!props.results.sgGreaterThan}
                />
              </FloatingKeyboardContainer>
            </SpotPopover>
          )}
          {sgError && (
            <ValidationError>
              {t("validation.genericInputInvalid")}
            </ValidationError>
          )}
        </SgContainer>
      </Section>

      {!props.skipChemistries && (
        <Section>
          <SpotText level="secondary" bold>
            {t("assays.mua.mPH")}
          </SpotText>
          <PHGrid>
            {Object.values(PHValues)
              .sort()
              .map((ph) => (
                <Fragment key={ph}>
                  <SelectableBox
                    boxSize="3.5em"
                    selected={props.results.ph === ph}
                    backgroundColor={PHColors[ph]}
                    data-testid={TestId.AssayItem(ph)}
                    onClick={() =>
                      handleResultChange({
                        ...props.results,
                        ph: props.results.ph === ph ? undefined : ph,
                      })
                    }
                  ></SelectableBox>
                  <div
                    style={{
                      gridRow: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <SpotText level="secondary">{ph}</SpotText>
                  </div>
                </Fragment>
              ))}
          </PHGrid>
        </Section>
      )}
    </PhysicalPageRoot>
  );
}

const PHGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  justify-items: center;
  gap: 15px;
`;

const DropdownContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 10px;
`;

const DropdownHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 3.5em;
`;

interface PhysicalDropDownProps<T> {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  assayLabel: string;
  getValueLabel: (value: T) => string;
  availableValues: T[];
  boxBackgroundColor: string;
  onValueChanged: (value?: T) => void;
  assayValue?: T;
  getBoxImageUrl?: (value: T) => string | undefined;
  headerTestId?: string;
}

function PhysicalDropDown<T>(props: PhysicalDropDownProps<T>) {
  return (
    <CustomizableDropdown
      expanded={props.expanded}
      onExpandedChange={props.setExpanded}
      headerContent={
        <DropdownHeaderContent data-testid={props.headerTestId}>
          {typeof props.assayValue !== "undefined" && (
            <Box
              boxSize={"3.5em"}
              style={{ margin: "0px" }}
              backgroundColor={props.boxBackgroundColor}
              backgroundImageUrl={props.getBoxImageUrl?.(props.assayValue)}
            />
          )}
          <SpotText level={"secondary"} style={{ marginLeft: "10px" }}>
            {typeof props.assayValue !== "undefined"
              ? props.getValueLabel(props.assayValue)
              : props.assayLabel}
          </SpotText>
        </DropdownHeaderContent>
      }
    >
      <DropdownContainer>
        {props.availableValues.map((value, index) => (
          <BoxWrapper
            selected={props.assayValue === value}
            key={index}
            data-testid={TestId.AssayItem(`${value}`)}
            onClick={() => {
              props.onValueChanged(
                props.assayValue === value ? undefined : value
              );
              props.setExpanded(false);
            }}
          >
            <Box
              boxSize="3.5em"
              backgroundColor={props.boxBackgroundColor}
              backgroundImageUrl={props.getBoxImageUrl?.(value)}
            />
            <SpotText level="secondary">{props.getValueLabel(value)}</SpotText>
          </BoxWrapper>
        ))}
      </DropdownContainer>
    </CustomizableDropdown>
  );
}
