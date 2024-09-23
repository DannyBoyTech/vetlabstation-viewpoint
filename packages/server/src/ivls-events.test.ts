import type { AssayTypeIdentificationRequestEvent } from "@viewpoint/api";
import { ivlsEventXmlToVpEvents } from "./ivls-events";

describe("ivlsEventXmlToVpEvents", () => {
  it("should return 'pending_request_updated' event when passed an ivls 'update_pending_list' event", async () => {
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><update_pending_list/>';

    const actualEvents = await ivlsEventXmlToVpEvents(xml);

    expect(actualEvents.length).toBe(1);
    expect(actualEvents[0]?.id).toEqual("pending_requests_updated");
  });

  it("should return 'running_lab_requests_updated' event when passed an ivls 'update_lab_request_list' event", async () => {
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><update_lab_request_list/>';

    const actualEvents = await ivlsEventXmlToVpEvents(xml);

    expect(actualEvents.length).toBe(1);
    expect(actualEvents[0]?.id).toEqual("running_lab_requests_updated");
  });

  it("should return 'running_lab_requests_updated' event when passed an ivls 'instrument-run-progress' event", async () => {
    const xml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><instrument-run-progress><instrumentrun-id>53123</instrumentrun-id></instrument-run-progress>';

    const actualEvents = await ivlsEventXmlToVpEvents(xml);

    expect(actualEvents.length).toBe(2);
    expect(actualEvents[0]?.id).toEqual("running_lab_requests_updated");
  });

  it("should return 'recent_results_updated', 'lab_request_complete' and 'running_lab_requests_updated' events when passed an ivls 'lab-request-complete' event", async () => {
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><lab-request-complete/>';

    const actualEvents = await ivlsEventXmlToVpEvents(xml);

    expect(actualEvents.length).toBe(3);
    expect(actualEvents.map((ev) => ev.id).sort()).toEqual(
      expect.arrayContaining(["recent_results_updated", "running_lab_requests_updated", "lab_request_complete"].sort())
    );
  });

  it("should return 'recent_results_updated' and 'running_lab_requests_updated' events when passed an ivls 'instrument-run-completed' event", async () => {
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><instrument-run-completed/>';

    const actualEvents = await ivlsEventXmlToVpEvents(xml);

    expect(actualEvents.length).toBe(2);
    expect(actualEvents.map((ev) => ev.id).sort()).toEqual(
      expect.arrayContaining(["recent_results_updated", "running_lab_requests_updated"].sort())
    );
  });

  it("should return 'recent_results_updated' and 'running_lab_requests_updated' events when passed an ivls 'instrument-run-status' event", async () => {
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><instrument-run-status/>';

    const actualEvents = await ivlsEventXmlToVpEvents(xml);

    expect(actualEvents.length).toBe(2);
    expect(actualEvents.map((ev) => ev.id).sort()).toEqual(
      expect.arrayContaining(["recent_results_updated", "running_lab_requests_updated"].sort())
    );
  });

  it("should return 'instrument_status_updated' events when passed an ivls 'instrument-update' event", async () => {
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><instrument-update/>';

    const actualEvents = await ivlsEventXmlToVpEvents(xml);

    expect(actualEvents.length).toBe(1);
    expect(actualEvents[0]?.id).toBe("instrument_status_updated");
  });

  it("should return 'instrument_status_updated' and 'detailed_instrument_status_updated' events when passed an ivls 'detailedInstrumentStatusDto' event", async () => {
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><detailedInstrumentStatusDto/>';

    const actualEvents = (await ivlsEventXmlToVpEvents(xml)).sort((a, b) => a.id.localeCompare(b.id));

    expect(actualEvents.length).toBe(2);
    expect(actualEvents.map((ev) => ev.id).sort()).toEqual(
      expect.arrayContaining(["detailed_instrument_status_updated", "instrument_status_updated"].sort())
    );
  });

  it("should return 'assay_type_identification_request' with instrumentRunId when passed an ivls 'assay-type-identification-request'", async () => {
    const xml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><assay-type-identification-request><labrequest-id>36367</labrequest-id><instrumentrun-id>46162</instrumentrun-id><instrumentresult-id>1081456</instrumentresult-id><patient-name>Fabienne</patient-name><species-dto><id>3</id><speciesName>Feline</speciesName></species-dto><assay-options><assayIdentityName>BA01</assayIdentityName><assayOrderAlpha>820</assayOrderAlpha><assayOrderOrgan>820</assayOrderOrgan><conversionFactor>1.0</conversionFactor><id>217</id><precision>1</precision><sampleTypeId>0</sampleTypeId></assay-options><assay-options><assayIdentityName>BA02</assayIdentityName><assayOrderAlpha>821</assayOrderAlpha><assayOrderOrgan>821</assayOrderOrgan><conversionFactor>1.0</conversionFactor><id>260</id><precision>1</precision><sampleTypeId>0</sampleTypeId></assay-options><assay-options><assayIdentityName>BA03</assayIdentityName><assayOrderAlpha>819</assayOrderAlpha><assayOrderOrgan>819</assayOrderOrgan><conversionFactor>1.0</conversionFactor><id>259</id><precision>1</precision><sampleTypeId>0</sampleTypeId></assay-options><assay-category-key>Assay.Category.BileAcids</assay-category-key></assay-type-identification-request>';

    const actualEvents = await ivlsEventXmlToVpEvents(xml);

    expect(actualEvents.length).toBe(1);

    const actualEvent = actualEvents[0] as AssayTypeIdentificationRequestEvent;

    expect(actualEvent?.id).toBe("assay_type_identification_request");
    expect(actualEvent?.instrumentRunId).toBe(46162);
  });
});
