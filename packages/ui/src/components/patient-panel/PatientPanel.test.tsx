import { describe, expect, it } from "vitest";
import { render } from "../../../test-utils/test-utils";
import { PatientPanel, PatientPanelProps, TestId } from "./PatientPanel";
import { randomPatientDto } from "@viewpoint/test-utils";
import {
  PatientWeightUnitsEnum,
  ReferenceClassType,
  SpeciesType,
} from "@viewpoint/api";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const defaultDisplaySettings: PatientPanelProps["displaySettings"] = {
  displayRequisitionId: true,
  displayWeight: true,
  displayReasonForTesting: true,
  displayDoctorName: true,
  requireRequisitionId: false,
} as const;

describe("PatientPanel", () => {
  it("displays all optional fields", async () => {
    render(
      <PatientPanel
        patient={randomPatientDto()}
        availableRefClasses={[]}
        availableDoctors={[]}
        weightUnits={PatientWeightUnitsEnum.POUNDS}
        displaySettings={defaultDisplaySettings}
      />
    );
    expect(await screen.findByTestId(TestId.ReqIdInput)).toBeInTheDocument();
    expect(await screen.findByTestId(TestId.DoctorInput)).toBeInTheDocument();
    expect(
      await screen.findByTestId(TestId.LastKnownWeightInput)
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId(TestId.ReasonForTestingContainer)
    ).toBeInTheDocument();
  });

  it("omits requisition ID field if indicated", async () => {
    render(
      <PatientPanel
        patient={randomPatientDto()}
        availableRefClasses={[]}
        availableDoctors={[]}
        weightUnits={PatientWeightUnitsEnum.POUNDS}
        displaySettings={{
          ...defaultDisplaySettings,
          displayRequisitionId: false,
        }}
      />
    );
    expect(
      await screen.queryByTestId(TestId.ReqIdLabel)
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(TestId.ReqIdError)
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(TestId.ReqIdInput)
    ).not.toBeInTheDocument();
  });

  it("omits lastKnownWeight field if indicated", async () => {
    render(
      <PatientPanel
        patient={randomPatientDto()}
        availableRefClasses={[]}
        availableDoctors={[]}
        weightUnits={PatientWeightUnitsEnum.POUNDS}
        displaySettings={{ ...defaultDisplaySettings, displayWeight: false }}
      />
    );
    expect(
      await screen.queryByTestId(TestId.LastKnownWeightInput)
    ).not.toBeInTheDocument();
  });

  it("omits reason for testing options if indicated", async () => {
    render(
      <PatientPanel
        patient={randomPatientDto()}
        availableRefClasses={[]}
        availableDoctors={[]}
        weightUnits={PatientWeightUnitsEnum.POUNDS}
        displaySettings={{
          ...defaultDisplaySettings,
          displayReasonForTesting: false,
        }}
      />
    );
    expect(
      await screen.queryByTestId(TestId.ReasonForTestingContainer)
    ).not.toBeInTheDocument();
  });

  it("omits doctor field if indicated", async () => {
    render(
      <PatientPanel
        patient={randomPatientDto()}
        availableRefClasses={[]}
        availableDoctors={[]}
        weightUnits={PatientWeightUnitsEnum.POUNDS}
        displaySettings={{
          ...defaultDisplaySettings,
          displayDoctorName: false,
        }}
      />
    );
    expect(
      await screen.queryByTestId(TestId.DoctorInput)
    ).not.toBeInTheDocument();
  });

  it("marks requisition ID field as required if indicated", async () => {
    render(
      <PatientPanel
        patient={randomPatientDto()}
        availableRefClasses={[]}
        availableDoctors={[]}
        weightUnits={PatientWeightUnitsEnum.POUNDS}
        displaySettings={{
          ...defaultDisplaySettings,
          requireRequisitionId: true,
        }}
      />
    );
    const reqIdLabel = await screen.findByTestId(TestId.ReqIdLabel);
    const errorWrapper = await screen.findByTestId(TestId.ReqIdError);
    const reqIdInput = await screen.findByTestId(TestId.ReqIdInput);
    expect(reqIdLabel).toHaveTextContent("Req ID *");
    expect(errorWrapper).not.toHaveTextContent("This field is required");

    // Focus and then blur on the input but don't input anything to trigger the error label
    await userEvent.click(reqIdInput);
    await userEvent.click(reqIdLabel);
    expect(errorWrapper).toHaveTextContent("This field is required");
  });

  it("marks lifestage as required", async () => {
    render(
      <PatientPanel
        patient={randomPatientDto()}
        availableRefClasses={[]}
        availableDoctors={[]}
        weightUnits={PatientWeightUnitsEnum.POUNDS}
        displaySettings={defaultDisplaySettings}
      />
    );

    const refClassError = await screen.findByTestId(TestId.RefClassError);

    expect(refClassError).toHaveTextContent("You must choose an option");
  });

  it('uses term "lifestage" for species with lifestage ref classes', async () => {
    const speciesDto = {
      id: 1,
      speciesClass: ReferenceClassType.LifeStage,
      speciesName: SpeciesType.Canine,
    };
    render(
      <PatientPanel
        patient={randomPatientDto({ speciesDto })}
        availableRefClasses={[]}
        availableDoctors={[]}
        weightUnits={PatientWeightUnitsEnum.POUNDS}
        displaySettings={defaultDisplaySettings}
      />
    );

    expect(await screen.findByTestId(TestId.RefClassLabel)).toHaveTextContent(
      "Confirm Lifestage *"
    );
    expect(await screen.findByTestId(TestId.RefClassSelect)).toHaveValue(
      "Select a Lifestage"
    );
  });

  it('uses term "type" for species with type ref classes', async () => {
    const speciesDto = {
      id: 1,
      speciesName: SpeciesType.Canine,
      speciesClass: ReferenceClassType.Type,
    };
    render(
      <PatientPanel
        patient={randomPatientDto({ speciesDto })}
        availableRefClasses={[]}
        availableDoctors={[]}
        weightUnits={PatientWeightUnitsEnum.POUNDS}
        displaySettings={defaultDisplaySettings}
      />
    );

    expect(await screen.findByTestId(TestId.RefClassLabel)).toHaveTextContent(
      "Confirm Type *"
    );
    expect(await screen.findByTestId(TestId.RefClassSelect)).toHaveValue(
      "Select a Type"
    );
  });
});
