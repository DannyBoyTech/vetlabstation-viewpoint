import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import { Trans, useTranslation } from "react-i18next";
import { CommonTransComponents } from "../../utils/i18n-utils";
import { InlineText } from "../typography/InlineText";
import { SpotText } from "@viewpoint/spot-react";
import { SnapResultTypeEnum } from "@viewpoint/api";
import { SNAPSpotDefinition, SNAPSpotPicker } from "./SNAPSpotPicker";
import classNames from "classnames";

const RowSelectionRoot = styled.div`
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
`;
const ExampleContainer = styled.div`
  display: flex;
  padding: 12px;
  gap: 12px;
`;
const ExampleText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
`;
const ExampleImageContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  max-height: 100px;
`;
const SelectableBox = styled.div`
  flex: 2;
  display: flex;
  gap: 24px;
  outline: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  border-radius: 5px;
  padding: 12px;
  overflow: hidden;

  .result-text {
    color: ${(p: { theme: Theme }) => p.theme.colors?.text?.primary};
  }

  &.selected {
    outline: ${(p: { theme: Theme }) =>
      `3px solid ${p.theme.colors?.interactive?.primary}`};
    background: rgba(83, 169, 184, 0.07);
  }

  &.selected.abnormal {
    outline: ${(p: { theme: Theme }) =>
      `3px solid ${p.theme.colors?.feedback?.error}`};
    background: rgba(255, 151, 150, 0.07);

    .result-text {
      color: ${(p: { theme: Theme }) => p.theme.colors?.feedback?.error};
    }
  }
`;
const RowResultText = styled.div<{ flex: number }>`
  flex: ${(p) => p.flex};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const ReferenceImagesSection = styled.div`
  flex: 3;
  display: flex;
  gap: 12px;
  overflow: hidden;
  justify-content: flex-end;
`;

export interface SNAPRowSelectionRow {
  rowId: string;
  result: SnapResultTypeEnum;
  resultLabel: string;
  abnormal: boolean;
  resultDescription?: string;
  referenceImages: {
    dots: SNAPSpotDefinition[];
  }[];
}

export interface SNAPRowSelectionProps {
  rows: SNAPRowSelectionRow[];
  exampleImage: SNAPSpotDefinition[];
  exampleInstructions?: string;

  selectedRowId?: string;
  onRowSelected: (rowId?: string) => void;
}

export function SNAPRowSelection(props: SNAPRowSelectionProps) {
  const { t } = useTranslation();

  return (
    <RowSelectionRoot>
      <ExampleContainer>
        <ExampleText>
          <SpotText level="tertiary">
            <Trans
              i18nKey={
                (props.exampleInstructions as any) ??
                "resultsEntry.snap.labels.select"
              }
              components={{ ...CommonTransComponents }}
            />
          </SpotText>
        </ExampleText>
        <ExampleImageContainer>
          <SNAPSpotPicker onDotClicked={() => {}} dots={props.exampleImage} />
        </ExampleImageContainer>
      </ExampleContainer>
      {props.rows.map((row) => (
        <SelectableBox
          onClick={() =>
            props.onRowSelected(
              props.selectedRowId === row.rowId ? undefined : row.rowId
            )
          }
          key={row.result}
          className={classNames({
            selected: row.rowId === props.selectedRowId,
            abnormal: row.abnormal,
          })}
        >
          {/*Give a little extra space to the result text when there's only one image*/}
          <RowResultText flex={row.referenceImages.length === 1 ? 4 : 2}>
            <SpotText level="secondary" bold className="result-text">
              {t(row.resultLabel as any)}
            </SpotText>
            {row.resultDescription != null && (
              <InlineText level={"tertiary"}>
                <Trans
                  i18nKey={row.resultDescription as any}
                  components={{
                    ...CommonTransComponents,
                    strong: <InlineText level="secondary" bold />,
                  }}
                />
              </InlineText>
            )}
          </RowResultText>
          <ReferenceImagesSection>
            {row.referenceImages.map((images, index) => (
              <SNAPSpotPicker
                key={index}
                onDotClicked={() => {}}
                dots={images.dots}
              />
            ))}
          </ReferenceImagesSection>
        </SelectableBox>
      ))}
    </RowSelectionRoot>
  );
}
