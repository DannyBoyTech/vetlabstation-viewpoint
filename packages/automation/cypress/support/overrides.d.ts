/// <reference types="cypress" />
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to ... add your description here
     * @example cy.clickOnMyJourneyInCandidateCabinet()
     */
    getByTestId(
      dataTestAttribute: string,
      args?: any
    ): Chainable<JQuery<HTMLElement>>;

    getByTestIdContains(
      dataTestAttribute: string,
      args?: any
    ): Chainable<JQuery<HTMLElement>>;

    containedWithinTestId(
      testId: string,
      text: string | number | RegExp,
      options?: Partial<Loggable & Timeoutable & CaseMatchable & Shadow>
    ): Chainable<JQuery<HTMLElement>>;

    nth(index: number): Chainable<JQuery<HTMLElement>>;

    task<S = unknown>(
      event: import("../util/tasks/e2e-tasks").TaskName,
      arg?: any,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = import("../util/instrument-simulator").IrisInstrumentDto[]>(
      event: "iris:get-instruments",
      arg?: import("../util/instrument-simulator/api").IrisInstruments[],
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = import("@viewpoint/api").InstrumentStatusDto>(
      event: "ivls:get-instrument",
      arg?: string,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = import("@viewpoint/api").InstrumentStatusDto>(
      event: "ivls:toggle-feature-flag",
      arg?: {
        flag: import("@viewpoint/api").FeatureFlagName;
        enabled: boolean;
      },
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = import("@viewpoint/api").InstrumentStatusDto>(
      event: "ivls:toggle-theia-flags",
      arg?: boolean,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = import("@viewpoint/api").InstrumentType>(
      event: "ivls:save-barcodes",
      arg?: { instrumentType: S; barcodes: string[] },
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = unknown>(
      event: "iris:set-results",
      arg?: {
        instrumentId: number;
        resultSet: import("../util/instrument-simulator/Results").ResultSet;
      }[],
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = unknown>(
      event: "iris:send-maintenance-result",
      arg?: {
        instrumentId: number;
        maintenanceResult: import("../util/instrument-simulator/api").InstrumentMaintenanceResultDto;
      }[],
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = unknown>(
      event: "iris:replace-fluid-pack",
      arg?: {
        instrumentId: number;
        fluidPackType: import("../util/instrument-simulator/api").replaceFluidPack;
      }[],
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = unknown>(
      event: "iris:set-maintenance-result",
      arg?: {
        instrumentId: number;
        maintenanceProcedure: any;
        nextMaintenanceResult: import("../util/instrument-simulator/api").NextAcadiaDxMaintenanceResultDto;
      }[],
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = unknown>(
      event: "iris:send-catOne-fault",
      arg?: {
        instrumentId: number;
        fault: any;
        addFault: import("../util/instrument-simulator/api").NextCatOneMaintenanceResultDto.FaultEnum;
      }[],
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;

    task<S = unknown>(
      event: "iris:send-acadia-fault",
      arg?: {
        instrumentId: number;
        fault: any;
        addFault: import("../util/instrument-simulator/api").NextAcadiaMaintenanceResultDto.FaultEnum;
      }[],
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<S>;
  }
}
