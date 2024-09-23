import {
  BloodConfigWorkflowType,
  CbcValues,
  findHematologyInstruments,
  provideCbcValues,
  toHematologyConfig,
} from "./blood-common";
import React, { Fragment, useContext } from "react";
import { BloodRunModal } from "./BloodRunModal";
import { CbcValuesModal } from "./CbcValuesModal";
import { ImportPreviousResultsModal } from "./ImportPreviousResultsModal";
import { SelectHematologyInstrumentsModal } from "./SelectHematologyInstrumentsModal";
import {
  BloodRunConfigurationDto,
  ExecuteInstrumentRunDto,
  InstrumentDto,
  InstrumentRunConfigurationDto,
  InstrumentStatusDto,
  TheiaMatchingRunResultDto,
} from "@viewpoint/api";
import { BuildLabRequestContext } from "../../../../../screens/order-fulfillment/BuildLabRequestContext";

export interface BloodConfigWorkflowProperties {
  bloodConfigWorkflowType: BloodConfigWorkflowType;
  handleBloodConfigWorkflowTypeChange: (type: BloodConfigWorkflowType) => void;
  // loaded
  suggestions: TheiaMatchingRunResultDto[];
  // props
  currentConfig: InstrumentRunConfigurationDto;
  // context
  availableInstruments: InstrumentStatusDto[];
  instrumentRunDtos: ExecuteInstrumentRunDto[];
  // handlers
  handleAddInstrument: (instrument: InstrumentDto) => ExecuteInstrumentRunDto;
  handleRunConfigChange: (
    bloodRunConfiguration: BloodRunConfigurationDto | undefined
  ) => void;
  onClose: () => void;
}

export function BloodConfigWorkflow(props: BloodConfigWorkflowProperties) {
  const { patient, labRequest } = useContext(BuildLabRequestContext);
  // all PC instruments
  const hematologyInstruments = findHematologyInstruments(
    props.availableInstruments,
    props.instrumentRunDtos
  );

  const cbcValues: CbcValues | undefined = provideCbcValues(
    props.currentConfig
  );

  return (
    <Fragment>
      {props.bloodConfigWorkflowType == BloodConfigWorkflowType.INITIAL && (
        <BloodRunModal
          onClose={props.onClose}
          onConfirm={props.onClose}
          onEnterCbcValues={() => {
            props.handleBloodConfigWorkflowTypeChange(
              BloodConfigWorkflowType.CBC
            );
          }}
          importPreviousResultsEnabled={props.suggestions.length > 0}
          onImportPreviousResults={() => {
            props.handleBloodConfigWorkflowTypeChange(
              BloodConfigWorkflowType.HISTORICAL_RUN
            );
          }}
          selectHematologyInstrumentsEnabled={hematologyInstruments.length > 0}
          onSelectHematologyInstruments={() => {
            props.handleBloodConfigWorkflowTypeChange(
              BloodConfigWorkflowType.HEMATOLOGY_RUN
            );
          }}
        />
      )}

      {props.bloodConfigWorkflowType == BloodConfigWorkflowType.CBC && (
        <CbcValuesModal
          cbcValues={{
            wbcValue: cbcValues?.wbcValue,
            rbcValue: cbcValues?.rbcValue,
            hctValue: cbcValues?.hctValue,
          }}
          onClose={() => {
            props.handleBloodConfigWorkflowTypeChange(
              BloodConfigWorkflowType.INITIAL
            );
          }}
          onBack={() => {
            props.handleBloodConfigWorkflowTypeChange(
              BloodConfigWorkflowType.INITIAL
            );
          }}
          onCbcValuesSubmitted={(config) => {
            props.handleRunConfigChange(
              toHematologyConfig(config, undefined, undefined)
            );
            props.onClose();
          }}
        ></CbcValuesModal>
      )}
      {props.bloodConfigWorkflowType ==
        BloodConfigWorkflowType.HISTORICAL_RUN && (
        <ImportPreviousResultsModal
          suggestions={props.suggestions}
          patient={patient}
          onClose={() => {
            props.handleBloodConfigWorkflowTypeChange(
              BloodConfigWorkflowType.INITIAL
            );
          }}
          onBack={() => {
            props.handleBloodConfigWorkflowTypeChange(
              BloodConfigWorkflowType.INITIAL
            );
          }}
          onSuggestionSelected={(suggestion) => {
            props.handleRunConfigChange(
              toHematologyConfig(undefined, suggestion, undefined)
            );
            props.onClose();
          }}
        ></ImportPreviousResultsModal>
      )}
      {props.bloodConfigWorkflowType ==
        BloodConfigWorkflowType.HEMATOLOGY_RUN && (
        <SelectHematologyInstrumentsModal
          hematologyInstruments={hematologyInstruments}
          onClose={() => {
            props.handleBloodConfigWorkflowTypeChange(
              BloodConfigWorkflowType.INITIAL
            );
          }}
          onBack={() => {
            props.handleBloodConfigWorkflowTypeChange(
              BloodConfigWorkflowType.INITIAL
            );
          }}
          onHematologyInstrumentSelected={(instrument) => {
            let executeInstrumentRunDto = (
              labRequest.instrumentRunDtos || []
            ).find((request) => {
              return request.instrumentId === instrument.id;
            });
            if (executeInstrumentRunDto == null) {
              executeInstrumentRunDto = props.handleAddInstrument(instrument);
            }
            props.handleRunConfigChange(
              toHematologyConfig(undefined, undefined, {
                instrument: instrument,
                request: executeInstrumentRunDto,
              })
            );
            props.onClose();
          }}
        ></SelectHematologyInstrumentsModal>
      )}
    </Fragment>
  );
}
