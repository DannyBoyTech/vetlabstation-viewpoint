import { SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { CommonTransComponents } from "../../utils/i18n-utils";
import type { ResultsEntryContentProps } from "../result-entry/snap/SNAPResultsEntry";
import { SNAPColumn } from "./SNAPColumn";
import { SnapResultTypeEnum } from "@viewpoint/api";
import { SNAPSpotPicker } from "./SNAPSpotPicker";
import SNAPHeartwormReference from "../../assets/snap/snap_heartworm_reference.svg";

const Root = styled.div`
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 50px;
  padding: 24px 12px;
`;

const InstructionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 50px;
`;

const HeartwormReferenceImage = styled.img`
  flex: none;
  width: 264px;
`;

const Columns = styled.div`
  display: flex;
  gap: 5px;
  justify-content: space-between;
`;

type SNAPColumnSelectionComponent = (
  props: ResultsEntryContentProps
) => JSX.Element;

const DEVICE_COMPONENT_MAPPING: Record<number, SNAPColumnSelectionComponent> = {
  1: HeartwormSelection,
  8: HeartwormSelection,
} as const;

export function SNAPColumnSelection(props: ResultsEntryContentProps) {
  const Component = DEVICE_COMPONENT_MAPPING[props.snapDeviceId];
  return Component && <Component {...props} />;
}

function HeartwormSelection(props: ResultsEntryContentProps) {
  const { t } = useTranslation();

  const handleClick = (typeClicked: SnapResultTypeEnum) => {
    const nextSelectedResult =
      typeClicked === props.selectedResult ? undefined : typeClicked;
    props.onResultChanged(nextSelectedResult);
  };

  return (
    <Root>
      <InstructionSection>
        <SpotText level="paragraph">
          <Trans
            i18nKey="resultsEntry.snap.resultsPage.heartwormInstructions"
            components={CommonTransComponents}
          />
        </SpotText>
        <HeartwormReferenceImage src={SNAPHeartwormReference} />
      </InstructionSection>
      <Columns>
        <SNAPColumn
          label={
            <SpotText level={"paragraph"}>
              {t("resultsEntry.snap.results.negative")}
            </SpotText>
          }
          image={
            <SNAPSpotPicker
              onDotClicked={() => {}}
              dots={[
                {
                  control: true,
                  position: "TopCenter",
                  selected: true,
                  dotId: "1",
                  filledColor: "#255e7f",
                },
              ]}
            />
          }
          onClick={() => handleClick(SnapResultTypeEnum.HEARTWORM_NEGATIVE)}
          selected={
            props.selectedResult === SnapResultTypeEnum.HEARTWORM_NEGATIVE
          }
        />
        <SNAPColumn
          abnormal={true}
          label={
            <>
              <SpotText level={"paragraph"}>
                {t("resultsEntry.snap.results.positive")}
              </SpotText>
              <SpotText level={"paragraph"}>
                {t("resultsEntry.snap.results.qualifiedLowAntigen")}
              </SpotText>
            </>
          }
          image={
            <SNAPSpotPicker
              onDotClicked={() => {}}
              dots={[
                {
                  control: true,
                  position: "TopCenter",
                  selected: true,
                  dotId: "1",
                  filledColor: "#255e7f",
                },
                {
                  control: true,
                  position: "MiddleRight",
                  selected: true,
                  dotId: "3",
                  filledColor: "#9db4cc",
                },
              ]}
            />
          }
          onClick={() =>
            handleClick(SnapResultTypeEnum.HEARTWORM_WEAK_POSITIVE)
          }
          selected={
            props.selectedResult === SnapResultTypeEnum.HEARTWORM_WEAK_POSITIVE
          }
        />
        <SNAPColumn
          abnormal={true}
          label={
            <>
              <SpotText level={"paragraph"}>
                {t("resultsEntry.snap.results.positive")}
              </SpotText>
              <SpotText level={"paragraph"}>
                {t("resultsEntry.snap.results.qualifiedHighAntigen")}
              </SpotText>
            </>
          }
          image={
            <SNAPSpotPicker
              onDotClicked={() => {}}
              dots={[
                {
                  control: true,
                  position: "TopCenter",
                  selected: true,
                  dotId: "1",
                  filledColor: "#255e7f",
                },
                {
                  control: true,
                  position: "MiddleLeft",
                  selected: true,
                  dotId: "2",
                  filledColor: "#9db4cc",
                },
                {
                  control: true,
                  position: "MiddleRight",
                  selected: true,
                  dotId: "3",
                  filledColor: "#255e7f",
                },
              ]}
            />
          }
          onClick={() =>
            handleClick(SnapResultTypeEnum.HEARTWORM_STRONG_POSITIVE)
          }
          selected={
            props.selectedResult ===
            SnapResultTypeEnum.HEARTWORM_STRONG_POSITIVE
          }
        />
      </Columns>
    </Root>
  );
}
