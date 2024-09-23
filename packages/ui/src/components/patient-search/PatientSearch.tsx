import { CSSProperties, ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import { Input, Select, SpotText } from "@viewpoint/spot-react";
import { PatientDto } from "@viewpoint/api";
import { Theme } from "../../utils/StyleConstants";
import { InputAware } from "../InputAware";
import { PatientSearchResult } from "./PatientSearchResult";
import { useTranslation } from "react-i18next";
import { useHeaderTitle, usePrevious } from "../../utils/hooks/hooks";
import { FixedSizeList } from "react-window";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { MaskedInput } from "../input/MaskedInput";
import { ResultsRangeOptionsValues } from "../../api/PatientApi";

const PatientSearchRoot = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  flex: 4;
  margin: 8px 0;
`;
const InputRow = styled.div`
  display: flex;
  gap: 20px;
  margin: 0 3px 15px 3px;
`;
const InputWrapper = styled.div`
  flex: 1;

  > input {
    margin-top: 4px;
  }
`;

const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 3px;
  padding-right: 2px;
  flex: 1;
  border: ${(p) => p.theme.borders?.lightPrimary};
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
`;

const NoMatchingResults = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export interface PatientWithRunDate extends PatientDto {
  lastRunDate?: number;
}

export interface PatientSearchProps {
  results: PatientWithRunDate[];
  onPatientNameChange?: (name: string) => void;
  onClientLastNameChange?: (name: string) => void;
  onClientIdChange?: (id: string) => void;
  onSelectedResultsRangeChange?: (
    selectedResultsRange?: ResultsRangeOptionsValues
  ) => void;

  onPatientSelected?: (selected?: PatientWithRunDate) => void;
  selectedPatientId?: number;

  patientName?: string | null;
  clientLastName?: string | null;
  clientId?: string | null;
  selectedResultsRange?: ResultsRangeOptionsValues;

  rangeDisabled?: boolean;

  includeTimeFrameFilter?: boolean;

  showPlaceholder?: boolean;
  placeholderContent?: ReactNode;
}

const inlineStyle: CSSProperties = {
  overflowY: "overlay",
} as unknown as CSSProperties;

export function PatientSearch(props: PatientSearchProps) {
  const { t } = useTranslation();

  const resultsRangeOptions: Record<
    string,
    { label: string; value: ResultsRangeOptionsValues }
  > = {
    [ResultsRangeOptionsValues.SEVEN]: {
      label: t("searchPatient.lastSevenDays"),
      value: ResultsRangeOptionsValues.SEVEN,
    },
    [ResultsRangeOptionsValues.THIRTY]: {
      label: t("searchPatient.lastThirtyDays"),
      value: ResultsRangeOptionsValues.THIRTY,
    },
  };

  const { results, onPatientSelected, selectedPatientId } = props;
  useEffect(() => {
    // Reset user selection when selected patient is no longer available
    if (
      selectedPatientId != null &&
      !results.some((res) => res.id === selectedPatientId)
    ) {
      onPatientSelected?.(undefined);
    }
  }, [onPatientSelected, results, selectedPatientId]);

  return (
    <PatientSearchRoot>
      <InputRow>
        <InputWrapper>
          <SpotText level="secondary">
            {t("searchPatient.patientName")}
          </SpotText>
          <InputAware>
            <Input
              type="search"
              data-testid="patient-name-input"
              autoFocus={true}
              maxLength={255}
              onChange={(ev) => {
                props.onPatientNameChange?.(ev.target.value);
              }}
              value={props.patientName ?? ""}
            />
          </InputAware>
        </InputWrapper>
        <InputWrapper>
          <SpotText level="secondary">{t("searchPatient.lastName")}</SpotText>
          <InputAware>
            <Input
              type="search"
              data-testid="last-name-input"
              maxLength={255}
              onChange={(ev) => {
                props.onClientLastNameChange?.(ev.target.value);
              }}
              value={props.clientLastName ?? ""}
            />
          </InputAware>
        </InputWrapper>
        <InputWrapper>
          <SpotText level="secondary">{t("searchPatient.clientId")}</SpotText>
          <InputAware>
            <MaskedInput
              type="search"
              mask={/^[a-zA-Z0-9, .'-]+$/}
              data-testid="client-id-input"
              maxLength={255}
              onAccept={(clientId) => {
                props.onClientIdChange?.(clientId);
              }}
              value={props.clientId ?? ""}
            />
          </InputAware>
        </InputWrapper>
        {props.includeTimeFrameFilter && (
          <InputWrapper>
            <SpotText level="secondary">
              {t("searchPatient.mostRecentResults")}
            </SpotText>
            <Select
              data-testid="select-results-range"
              value={
                props.selectedResultsRange ? props.selectedResultsRange : ""
              }
              onChange={(ev) =>
                props.onSelectedResultsRangeChange?.(
                  ev.currentTarget.value as ResultsRangeOptionsValues
                )
              }
              disabled={props.rangeDisabled}
            >
              <Select.Option key={""} value="">
                {t("assayTypeModal.selectOne")}
              </Select.Option>
              {Object.entries(resultsRangeOptions).map(
                ([_, { label, value }]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                )
              )}
            </Select>
          </InputWrapper>
        )}
      </InputRow>

      <SearchResults data-testid="patient-search-results">
        {(() => {
          if (props.showPlaceholder || props.results.length === 0) {
            return (
              props.placeholderContent ?? (
                <NoMatchingResults>
                  <SpotText level="h3">{t("general.noResults")}</SpotText>
                </NoMatchingResults>
              )
            );
          } else {
            return (
              <AutoSizer>
                {/* Casting args explicitly due to https://github.com/bvaughn/react-virtualized-auto-sizer/issues/63 */}
                {({ height, width }: Size) => (
                  <FixedSizeList
                    itemCount={props.results.length}
                    height={height}
                    width={width}
                    itemSize={45}
                    className="windowed-list"
                    style={inlineStyle}
                  >
                    {({ index: i, style }) => {
                      const result = props.results[i];
                      return (
                        <PatientSearchResult
                          style={style}
                          patient={result}
                          runDate={result.lastRunDate}
                          // workaround: mousedown instead of click
                          // reason: click doesn't fire on element due to geometry changes caused by click
                          onMouseDown={() => {
                            const matchingPatient = props.results[i];
                            if (
                              matchingPatient.id === props.selectedPatientId
                            ) {
                              props.onPatientSelected?.(undefined);
                            } else {
                              props.onPatientSelected?.(matchingPatient);
                            }
                          }}
                          selected={
                            props.selectedPatientId != null &&
                            props.selectedPatientId === props.results[i]?.id
                          }
                          asSearch={props.includeTimeFrameFilter}
                        />
                      );
                    }}
                  </FixedSizeList>
                )}
              </AutoSizer>
            );
          }
        })()}
      </SearchResults>
    </PatientSearchRoot>
  );
}
