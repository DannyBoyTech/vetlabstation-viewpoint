import { RunningLabRequestDto } from "@viewpoint/api";

export interface NewPatientOptions {
  patientName?: string;
  clientId?: string;
  clientLastName?: string;
  clientFirstName?: string;
  species?: string;
  breed?: string;
  sex?: string;
  lastKnownWeight?: string;
  lifeStage?: string;
  age?: number;
  ageCategory?: string;
  dobMonth?: number;
  dobDay?: number;
  dobYear?: number;
}

let CLIENT_ID_COUNT = 1; // Sometimes there are matches, which causes the pop-up to drop down and can mess up tests. Append this to guarantee a unique default random name

export function createNewPatient(
  providedOptions: NewPatientOptions
): NewPatientOptions {
  const options: NewPatientOptions = {
    patientName: `Patient-${Date.now()}`,
    clientId: `${Date.now()}-${CLIENT_ID_COUNT++}`,
    species: "Canine",
    lifeStage: "Adult Canine",
    ...providedOptions,
  };
  cy.getByTestId("patient-input").type(options.patientName);
  cy.getByTestId("client-id-input").type(options.clientId);
  cy.getByTestId("species-select").select(options.species);
  cy.getByTestId("lifestage-select").select(options.lifeStage);

  if (options.clientLastName) {
    cy.getByTestId("client-last-name-input").type(options.clientLastName);
  }
  if (options.clientFirstName) {
    cy.getByTestId("client-first-name-input").type(options.clientFirstName);
  }
  if (options.breed) {
    cy.getByTestId("breed-select").select(options.breed);
  }
  if (options.sex) {
    cy.getByTestId("gender-select").select(options.sex);
  }
  if (options.lastKnownWeight) {
    cy.getByTestId("last-known-weight-input").type(
      `${options.lastKnownWeight}`
    );
  }
  if (options.age) {
    cy.getByTestId("age-input").type(`${options.age}`);
  }
  if (options.ageCategory) {
    cy.getByTestId("age-category-select").select(options.ageCategory);
  }
  if (options.dobMonth) {
    cy.getByTestId("age-month-input").select(options.dobMonth);
  }
  if (options.dobDay) {
    cy.getByTestId("age-date-input").select(options.dobDay);
  }
  if (options.dobYear) {
    cy.getByTestId("age-year-input").select(options.dobYear);
  }

  cy.getByTestId("next-button").should("be.enabled").click();
  return options;
}

export function analyzeSample(options?: NewPatientOptions): NewPatientOptions {
  cy.intercept("**/device/status?speciesId=*").as("fetch-instruments");
  cy.visit("/");
  cy.getByTestId("analyze-sample-button").click();
  cy.getByTestId("add-new-button").click();

  const updatedOptions = createNewPatient(options);

  cy.wait("@fetch-instruments");

  return updatedOptions;
}

export interface StartAndRunNewLabRequestArgs extends NewPatientOptions {
  runConfigurationCallbacks?: Record<string, (serialNumber: string) => void>;
  afterRunClick?: () => void;
  // If true, will allow instrument to be in a "BUSY" status and still submit the run.
  // Useful for submitting a queued run request
  allowSubmitWhenBusy?: boolean;
}

export function startAndRunNewLabRequest(
  instrumentSerialNumbers: string[],
  options?: StartAndRunNewLabRequestArgs
): PromiseLike<
  NewPatientOptions & { labRequestId: number; labRequest: RunningLabRequestDto }
> {
  cy.intercept("POST", "**/labRequest").as("submitLabRequest");
  cy.intercept("GET", "**/labRequest/running").as("running-lab-request");
  cy.intercept({ method: "GET", pathname: "**/api/device/runConfigs" }).as(
    "defaultRunConfigs"
  );
  cy.intercept({ pathname: "**/species/*/sampleTypes", method: "GET" }).as(
    "availableSampleTypes"
  );

  const newPatientOptions = analyzeSample(options);
  // Selecting instrument before default run configs have been set will cause submission request to fail
  cy.wait("@defaultRunConfigs");
  cy.wait("@availableSampleTypes");
  // Sometimes if we click too quickly we can beat the default sample type population
  // which will prevent the run from being able to start
  cy.wait(750);

  for (const serialNumber of instrumentSerialNumbers) {
    cy.getByTestId(`selectable-analyzer-${serialNumber}`)
      .contains(
        options?.allowSubmitWhenBusy ? /Ready|Busy|Manual/g : /Ready|Manual/g
      )
      .click();
    options?.runConfigurationCallbacks?.[serialNumber](serialNumber);
  }
  cy.getByTestId("run-button").click();
  options?.afterRunClick?.();
  return cy.wait("@submitLabRequest").then((req) =>
    cy.wait("@running-lab-request").then(() => ({
      labRequestId: req.response.body.id,
      labRequest: req.response.body,
      ...newPatientOptions,
    }))
  );
}
