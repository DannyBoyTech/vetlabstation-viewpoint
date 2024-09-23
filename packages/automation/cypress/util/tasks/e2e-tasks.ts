import {
  ensureInstrumentOfType,
  resetInstruments,
  setInstrumentResults,
  verifyIrisRunning,
  verifyIvlsRunning,
  sendInstrumentMaintenanceResult,
  setInstrumentNextMaintenanceResult,
  sendFluidPack,
  cancelRuns,
  sendCatoneFault,
  sendAcadiaFault,
  getIvlsInstrumentStatus,
  toggleFeatureFlag,
  saveQCBarcodes,
} from "./task-utils";
import {
  InstrumentMaintenanceResultDto,
  NextAcadiaDxMaintenanceResultDto,
  IrisInstruments,
  NextCatOneMaintenanceResultDto,
  NextSediVueDxMaintenanceResultDto,
  NextTenseiMaintenanceResultDto,
} from "../instrument-simulator";
import { ResultSet } from "../instrument-simulator/Results";
import { FeatureFlagName, InstrumentType } from "@viewpoint/api";

export const E2ETasks = {
  "ivls:initialize": async () => {
    try {
      await verifyIvlsRunning();
      await verifyIrisRunning();
      await resetInstruments();
      await cancelRuns();
    } catch (err) {
      console.error("Error initializing connection with IVLS", err);
      throw err;
    }
    return null;
  },
  "ivls:toggle-feature-flag": async (args: {
    flag: FeatureFlagName;
    enabled: boolean;
  }) => {
    return await toggleFeatureFlag(args.flag, args.enabled);
  },
  "ivls:toggle-theia-flags": async (enabled: boolean) => {
    const flags = [
      FeatureFlagName.THEIA_CONNECTION,
      FeatureFlagName.THEIA_RESULTS,
      FeatureFlagName.THEIA_CANINE_EARSWAB_ENABLED,
      FeatureFlagName.THEIA_CANINE_EARSWAB_RESULTS,
      FeatureFlagName.THEIA_FELINE_EARSWAB_ENABLED,
      FeatureFlagName.THEIA_FELINE_EARSWAB_RESULTS,
      FeatureFlagName.THEIA_CANINE_BLOOD_ENABLED,
      FeatureFlagName.THEIA_CANINE_BLOOD_RESULTS,
      FeatureFlagName.THEIA_FELINE_BLOOD_ENABLED,
      FeatureFlagName.THEIA_FELINE_BLOOD_RESULTS,
      FeatureFlagName.THEIA_FNA_ENABLED,
    ];
    await Promise.all(flags.map((flag) => toggleFeatureFlag(flag, enabled)));
    return null;
  },
  "ivls:get-instrument": async (serialNumber: string) => {
    return await getIvlsInstrumentStatus(serialNumber);
  },
  "ivls:save-barcodes": async (args: {
    instrumentType: InstrumentType;
    barcodes: string[];
  }) => {
    return await saveQCBarcodes(args.instrumentType, args.barcodes);
  },
  "iris:get-instruments": async (instruments: IrisInstruments[]) => {
    try {
      return await Promise.all(
        instruments.map((instrumentName) =>
          ensureInstrumentOfType(instrumentName)
        )
      );
    } catch (err) {
      console.error("Error getting instruments", err);
      throw err;
    }
  },
  "iris:set-results": async (
    args: { instrumentId: number; resultSet: ResultSet }[]
  ) => {
    for (const resultSet of args) {
      await setInstrumentResults(resultSet.instrumentId, resultSet.resultSet);
    }
    return null;
  },
  log: (message) => {
    console.log(message);
    return null;
  },
  "iris:send-maintenance-result": async (args: {
    instrumentId: number;
    maintenanceResult: InstrumentMaintenanceResultDto;
  }) => {
    await sendInstrumentMaintenanceResult(
      args.instrumentId,
      args.maintenanceResult
    );
    return null;
  },
  "iris:replace-fluid-pack": async (args: {
    instrumentId: number;
    fluidPackType: "Reagent" | "Sheath";
  }) => {
    await sendFluidPack(args.instrumentId, args.fluidPackType);
    return null;
  },
  "iris:set-maintenance-result": async (args: {
    instrumentId: number;
    maintenanceProcedure: any;
    nextMaintenanceResult:
      | NextCatOneMaintenanceResultDto
      | NextAcadiaDxMaintenanceResultDto
      | NextSediVueDxMaintenanceResultDto
      | NextTenseiMaintenanceResultDto;
  }) => {
    await setInstrumentNextMaintenanceResult(
      args.instrumentId,
      args.maintenanceProcedure,
      args.nextMaintenanceResult
    );
    return null;
  },
  "iris:send-catOne-fault": async (args: {
    instrumentId: number;
    fault: any;
    addFault: NextCatOneMaintenanceResultDto.FaultEnum;
  }) => {
    await sendCatoneFault(args.instrumentId, args.fault);
    return null;
  },
  "iris:send-acadia-fault": async (args: {
    instrumentId: number;
    fault: any;
    addFault: NextAcadiaDxMaintenanceResultDto.FaultEnum;
  }) => {
    await sendAcadiaFault(args.instrumentId, args.fault);
    return null;
  },
} as const;

export type TaskName = keyof typeof E2ETasks;
