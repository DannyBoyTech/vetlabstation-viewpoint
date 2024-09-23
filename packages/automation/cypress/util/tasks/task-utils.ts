import {
  ConnecteddeviceApi,
  FeatureFlagApi,
  FeatureFlagName,
  InstrumentRunApi,
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  LabRequestApi,
  ProCyteApi,
  SediVueApi,
  SettingsApi,
  TenseiQCApi,
} from "@viewpoint/api";
import {
  AcadiaDxApi,
  CatalystOneApi,
  InstrumentApi,
  InstrumentMaintenanceResultDto,
  IrisInstrumentDto,
  IrisInstruments,
  NextAcadiaDxMaintenanceResultDto,
  NextCatOneMaintenanceResultDto,
  NextResultEndpointApi,
  NextSediVueDxMaintenanceResultDto,
  NextTenseiMaintenanceResultDto,
  SedivueDxApi,
  TenseiApi,
} from "../instrument-simulator";
import { waitFor } from "../general-utils";
import { getIrisApiService, getIvlsApiService } from "./api-services";
import { ResultSet } from "../instrument-simulator/Results";
import { js2xml } from "xml-js";

const IS_CI = process.env.CI === "true";

export async function verifyIvlsRunning(): Promise<void> {
  await waitFor(() => getIvlsApiService(SettingsApi).getSettings());
  console.log("IVLS server is available");
}

export async function verifyIrisRunning(): Promise<void> {
  await waitFor(() => getIrisApiService(InstrumentApi).fetchInstruments());
  console.log("IRIS server is available");
}

export async function toggleFeatureFlag(
  flag: FeatureFlagName,
  enabled: boolean
) {
  return await getIvlsApiService(FeatureFlagApi).activate(flag, {
    activate: enabled,
  });
}

// Causes all instruments to stop waiting for results or their current maintenance action -- sending them all back to green and READY status
export async function stopWaitingAllInstruments(): Promise<void> {
  const devices = await getAllDevicesIncludingSnapPros();
  await Promise.all(
    devices
      .filter(
        (dev) =>
          dev.connected &&
          dev.instrument.instrumentType !== InstrumentType.InterlinkPims
      )
      .map(async (dev) => {
        try {
          await getIvlsApiService(ConnecteddeviceApi).stopWaiting(
            dev.instrument.id
          );
        } catch (err) {
          console.error(
            `Could not cancel processes for instrument ${dev.instrument.instrumentType}:${dev.instrument.id}`
          );
        }
      })
  );
}

export async function cancelRuns(): Promise<void> {
  const runningLabRequests = await getIvlsApiService(
    LabRequestApi
  ).runningLabRequests();
  for (const labRequest of runningLabRequests) {
    for (const run of labRequest.instrumentRunDtos) {
      // Try cancelling the run directly
      try {
        await getIvlsApiService(InstrumentRunApi).cancelRun(run.id);
      } finally {
        // Tell the instrument to stop waiting for all runs (catch all in case cancel run didn't work)
        await getIvlsApiService(ConnecteddeviceApi).stopWaiting(
          run.instrumentId
        );
      }
    }
  }
  console.log("Cancelled all in process runs.");
}

export async function resetInstruments(): Promise<void> {
  // Tell IVLS to stop waiting for instrument processes
  await stopWaitingAllInstruments();

  // Remove all IRIS instruments
  const irisInstruments = await getIrisApiService(
    InstrumentApi
  ).fetchInstruments();
  await Promise.all(
    irisInstruments.map((instrument) =>
      getIrisApiService(InstrumentApi).removeInstrument(instrument.id)
    )
  );

  // Wait for all the IRIS instruments to reflect offline on IVLS
  const irisSerialNumbers = irisInstruments.map(
    (instrument) => instrument.instrumentSerialNumber
  );
  await waitFor(async () => {
    const instruments = await getAllDevicesIncludingSnapPros();
    // Make sure each one that is from IRIS is now offline
    return (
      instruments.filter(
        (is) =>
          is.instrumentStatus === InstrumentStatus.Offline ||
          !is.connected ||
          !irisSerialNumbers.includes(is.instrument.instrumentSerialNumber)
      ).length === 0
    );
  });

  // Suppress them (removes the offline icon from the screen)
  const devices = await getAllDevicesIncludingSnapPros();
  await Promise.all(
    devices
      .filter(
        (dev) =>
          // SNAP instrument shows connected = false but status = ready.
          // It can also be suppressed, which is not something we want to do.
          (!dev.connected && dev.instrumentStatus !== InstrumentStatus.Ready) ||
          irisSerialNumbers.includes(dev.instrument.instrumentSerialNumber)
      )
      .map((dev) =>
        getIvlsApiService(ConnecteddeviceApi).suppress(dev.instrument.id)
      )
  );
  console.log("Reset all instruments");
}

export async function ensureInstrumentOfType(
  type: IrisInstruments
): Promise<IrisInstrumentDto | undefined> {
  const ivlsType = IrisInstrumentTypeMappings[type];
  // Is there already a READY instrument of this type?
  const existing = (await getAllDevicesIncludingSnapPros()).find(
    (is) => is.instrument.instrumentType === ivlsType
  );
  if (existing?.connected) {
    // Find it in the simulator, return it
    return (await getIrisApiService(InstrumentApi).fetchInstruments()).find(
      (instrument) =>
        getSerialNumberForIrisInstrument(instrument) ===
        existing.instrument.instrumentSerialNumber
    );
  } else {
    // Create a new instrument and wait for it to be ready
    return createInstrument(type);
  }
}

export async function getIvlsInstrumentStatus(
  serialNumber: string
): Promise<InstrumentStatusDto | undefined> {
  return (await getAllDevicesIncludingSnapPros()).find(
    (is) => is.instrument.instrumentSerialNumber === serialNumber
  );
}

export async function createInstrument(
  type: IrisInstruments
): Promise<IrisInstrumentDto> {
  console.log(`Creating new instrument of type ${type}`);
  const createdIrisInstrument = await getIrisApiService(
    InstrumentApi
  ).addInstrument(type);

  if (type === IrisInstrumentType["ProCyte Dx"]) {
    console.log(
      `Checking approval for new ProCyte Dx instrument ${getSerialNumberForIrisInstrument(
        createdIrisInstrument
      )}`
    );
    // PDx has to be approved
    await waitFor(async () =>
      isProCyteReady(getSerialNumberForIrisInstrument(createdIrisInstrument))
    );
  }
  // Wait for it to be ready
  await waitFor(async () => {
    const ivlsInstrument = await getIvlsInstrumentStatus(
      getSerialNumberForIrisInstrument(createdIrisInstrument)
    );
    if (
      ivlsInstrument?.connected &&
      ivlsInstrument.instrumentStatus === InstrumentStatus.Ready
    ) {
      console.log(
        `${type} instrument ${ivlsInstrument.instrument.instrumentSerialNumber} with status ${ivlsInstrument.instrumentStatus} is ready to use.`
      );
      return true;
    }
  });
  return getIrisApiService(InstrumentApi).fetchInstrument(
    createdIrisInstrument.id
  );
}

async function isProCyteReady(serialNumber: string) {
  // Is the instrument already ready? It may have been approved previously,
  // in which case we're good to go
  const ivlsInstrument = await getIvlsInstrumentStatus(serialNumber);
  if (
    ivlsInstrument?.connected &&
    ivlsInstrument.instrumentStatus === InstrumentStatus.Ready
  ) {
    if (IS_CI) {
      console.warn(
        `ProCyte ${serialNumber} was ready without requiring approval. This is possible running locally, but not expected when running in CI.`
      );
    }
    return true;
  } else {
    // Get list of pending approvals
    const approvals = await getIvlsApiService(
      ConnecteddeviceApi
    ).fetchDevicesAwaitingApproval();
    // Find the corresponding approval request
    const deviceToApprove = approvals?.find(
      (approvalRequest) =>
        approvalRequest.instrument.instrumentSerialNumber === serialNumber
    );
    if (deviceToApprove != null) {
      // Approve it
      await getIvlsApiService(ConnecteddeviceApi).setApprovalStatus(
        deviceToApprove.instrument.id,
        true
      );
      console.log(`Approved ProCyte Dx instrument ${serialNumber}`);
      return true;
    }
  }
}

export function getSerialNumberForIrisInstrument(
  instrument: IrisInstrumentDto
): string {
  return instrument.mainUnitSerialNumber == null
    ? instrument.instrumentSerialNumber
    : `${instrument.mainUnitSerialNumber}${instrument.instrumentSerialNumber}`;
}

export async function setInstrumentResults(
  instrumentId: number,
  results: ResultSet
) {
  // Tweak to match expected XML format
  const { results: resultsArray, ...rest } = results;
  const converted = {
    ResultSet: {
      result: resultsArray,
      ...rest,
    },
  };
  const xml = js2xml(converted, { compact: true });
  await getIrisApiService(NextResultEndpointApi).setNextResult({
    irisInstrumentId: instrumentId,
    body: xml,
  });
}

async function getAllDevicesIncludingSnapPros() {
  const connectedDeviceApi = getIvlsApiService(ConnecteddeviceApi);
  const devices = await connectedDeviceApi.fetchConnectedDeviceStatuses();
  const snapProDevices =
    await connectedDeviceApi.fetchConnectedSnapProDeviceStatuses();
  return [...devices, ...snapProDevices];
}

export async function sendInstrumentMaintenanceResult(
  instrumentId: number,
  maintenanceResult: InstrumentMaintenanceResultDto
) {
  await getIrisApiService(AcadiaDxApi).sendMaintenanceResult(
    instrumentId,
    maintenanceResult
  );
}

export async function sendFluidPack(
  instrumentId: number,
  fluidPackType: "Reagent" | "Sheath"
) {
  await getIrisApiService(AcadiaDxApi).replaceFluidPack(
    instrumentId,
    fluidPackType
  );
}

export const IrisInstrumentTypeMappings: Record<
  IrisInstruments,
  InstrumentType
> = {
  "Acadia Dx": InstrumentType.ProCyteOne,
  "Catalyst One": InstrumentType.CatalystOne,
  "ProCyte Dx": InstrumentType.ProCyteDx,
  "SediVue Dx": InstrumentType.SediVueDx,
  "SnapShot Dx": InstrumentType.SNAPshotDx,
  SnapPro: InstrumentType.SNAPPro,
  "Catalyst Dx": InstrumentType.CatalystDx,
  Theia: InstrumentType.Theia,
  "UriSys Dx": InstrumentType.UriSysDx,
  Tensei: InstrumentType.Tensei,
};

export async function setInstrumentNextMaintenanceResult(
  instrumentId: number,
  maintenanceProcedure: any,
  nextMaintenanceResult:
    | NextCatOneMaintenanceResultDto
    | NextAcadiaDxMaintenanceResultDto
    | NextSediVueDxMaintenanceResultDto
    | NextTenseiMaintenanceResultDto
) {
  const irisInstrument = await getIrisApiService(InstrumentApi).fetchInstrument(
    instrumentId
  );
  // IRIS instrument doesn't indicate what the type of instrument is, so get it from the IVLS API
  const instrument = await getIvlsInstrumentStatus(
    irisInstrument.instrumentSerialNumber
  );
  switch (instrument.instrument.instrumentType) {
    case InstrumentType.CatalystOne:
      return getIrisApiService(CatalystOneApi).setNextMaintenanceResult1(
        instrumentId,
        maintenanceProcedure,
        nextMaintenanceResult as NextCatOneMaintenanceResultDto
      );
    case InstrumentType.ProCyteOne:
      return getIrisApiService(AcadiaDxApi).setNextMaintenanceResult(
        instrumentId,
        maintenanceProcedure,
        nextMaintenanceResult as NextAcadiaDxMaintenanceResultDto
      );
    case InstrumentType.SediVueDx:
      return getIrisApiService(SedivueDxApi).setNextMaintenanceResult2(
        instrumentId,
        maintenanceProcedure,
        nextMaintenanceResult as NextSediVueDxMaintenanceResultDto
      );
    case InstrumentType.Tensei:
      return getIrisApiService(TenseiApi).setNextMaintenanceResult3(
        instrumentId,
        maintenanceProcedure,
        nextMaintenanceResult as NextTenseiMaintenanceResultDto
      );
    default:
      throw new Error(
        `Instrument type "${instrument.instrument.instrumentType}" does not support setting maintenance results`
      );
  }
}

export async function sendCatoneFault(instrumentId: number, fault: any) {
  await getIrisApiService(CatalystOneApi).addFault1(instrumentId, fault);
}

export async function sendAcadiaFault(instrumentId: number, fault: any) {
  await getIrisApiService(AcadiaDxApi).addFault(instrumentId, fault);
}

export async function saveQCBarcodes(type: InstrumentType, barcodes: string[]) {
  switch (type) {
    case InstrumentType.Tensei:
      return getIvlsApiService(TenseiQCApi).saveQcBarcodes({
        barcodes: barcodes.map((barcode) => ({ barcode })),
      });
    case InstrumentType.ProCyteDx:
      return getIvlsApiService(ProCyteApi).saveQcBarcodes({
        barcodes: barcodes.map((barcode) => ({ barcode })),
      });
    case InstrumentType.SediVueDx:
      return getIvlsApiService(SediVueApi).createLotsForSediVue({
        currentBarcode: "",
        preapprovedBarcodes: barcodes,
        instrumentType: InstrumentType.SediVueDx,
      });
  }
}

export const IrisInstrumentType = Object.keys(
  IrisInstrumentTypeMappings
).reduce((prev, curr) => ({ ...prev, [curr]: curr }), {}) as Record<
  IrisInstruments,
  IrisInstruments
>;

export function isE2ETest() {
  return Cypress.spec.absolute.includes("automation/cypress/e2e");
}
