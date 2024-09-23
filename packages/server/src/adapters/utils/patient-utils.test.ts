import { PatientDto, ReferenceClassType, SpeciesType } from "@viewpoint/api";
import { shuffle } from "lodash";
import { sortPatientRecordSearchResultsBy, sortPatientSearchResultsBy } from "./query-utils";

function patient(patientName: string, clientLastName: string, clientFirstName: string, clientId: string): PatientDto {
  return {
    id: 1,
    patientName,
    speciesDto: {
      id: 1,
      speciesClass: ReferenceClassType.LifeStage,
      speciesName: SpeciesType.Alpaca,
    },
    clientDto: {
      id: 1,
      clientId,
      firstName: clientFirstName,
      lastName: clientLastName,
    },
  };
}

function patientNames(...patients: PatientDto[]): (string | undefined)[] {
  return patients.map((p) => p.patientName);
}

function clientLastNames(...patients: PatientDto[]): (string | undefined)[] {
  return patients.map((p) => p.clientDto?.lastName);
}

function clientFirstNames(...patients: PatientDto[]): (string | undefined)[] {
  return patients.map((p) => p.clientDto?.firstName);
}

function clientIds(...patients: PatientDto[]): (string | undefined)[] {
  return patients.map((p) => p.clientDto?.clientId);
}

describe("sortPatientSearchResultsBy", () => {
  it("should sort by patient name ascending when that query is present", () => {
    const unsorted = shuffle([
      patient("Betty", "A", "A", "1"),
      patient("Carson", "A", "A", "2"),
      patient("Alexander", "A", "A", "3"),
    ]);

    const sorted = sortPatientSearchResultsBy(unsorted, "patientName");

    expect(patientNames(...sorted)).toEqual(["Alexander", "Betty", "Carson"]);
  });

  it("should sort by client last name ascending when that query is present", () => {
    const unsorted = shuffle([
      patient("Randy", "Carson", "A", "Z"),
      patient("Randy", "Atkinson", "A", "Z"),
      patient("Randy", "Black", "A", "Z"),
    ]);

    const sorted = sortPatientSearchResultsBy(unsorted, "clientLastName");

    expect(clientLastNames(...sorted)).toEqual(["Atkinson", "Black", "Carson"]);
  });

  it("should sort by client first name ascending when client last query is present", () => {
    const unsorted = shuffle([
      patient("Alexander", "Atkinson", "Carl", "Z"),
      patient("Alexander", "Atkinson", "Brent", "Z"),
      patient("Alexander", "Atkinson", "Abathur", "Z"),
    ]);

    const sorted = sortPatientSearchResultsBy(unsorted, "clientLastName");

    expect(clientFirstNames(...sorted)).toEqual(["Abathur", "Brent", "Carl"]);
  });

  it("should sort by clientId ascending when that query is present", () => {
    const unsorted = shuffle([patient("A", "B", "C", "A"), patient("A", "B", "C", "B"), patient("A", "B", "C", "C")]);

    const sorted = sortPatientSearchResultsBy(unsorted, "clientIdentifier");

    expect(clientIds(...sorted)).toEqual(["A", "B", "C"]);
  });

  it("should sort by patient name and clientId in order specified", () => {
    const unsorted = shuffle([
      patient("Alex", "Black", "Rick", "111"),
      patient("Alex", "Blake", "James", "112"),
      patient("Alex", "Burke", "Delta", "1"),
      patient("Brick", "DeLong", "Ariana", "343"),
      patient("Brick", "DeLong", "Brittany", "555"),
      patient("Brick", "DeLong", "Cathy", "32"),
      patient("Cindy", "Arid", "Alex", "94"),
      patient("Cindy", "Bird", "Brian", "59"),
      patient("Cindy", "Mancy", "Carl", "737"),
      patient("Dirk", "O'Mally", "Nester", "5"),
      patient("Dirk", "O'Mally", "Nester", "55558"),
      patient("Dirk", "O'Mally", "Nester", "5553"),
    ]);

    const sorted = sortPatientSearchResultsBy(unsorted, "patientName", "clientIdentifier");

    expect(clientIds(...sorted)).toEqual([
      "1",
      "111",
      "112",
      "32",
      "343",
      "555",
      "59",
      "737",
      "94",
      "5",
      "5553",
      "55558",
    ]);
  });

  it("should sort by patient name and client names in order specified", () => {
    const unsorted = shuffle([
      patient("Alex", "Black", "Rick", "111"),
      patient("Alex", "Blake", "James", "112"),
      patient("Alex", "Burke", "Delta", "1"),
      patient("Brick", "DeLong", "Ariana", "343"),
      patient("Brick", "DeLong", "Brittany", "555"),
      patient("Brick", "DeLong", "Cathy", "32"),
      patient("Cindy", "Arid", "Alex", "94"),
      patient("Cindy", "Bird", "Brian", "59"),
      patient("Cindy", "Mancy", "Carl", "737"),
    ]);

    const sorted = sortPatientSearchResultsBy(unsorted, "patientName", "clientLastName");

    expect(clientIds(...sorted)).toEqual(["111", "112", "1", "343", "555", "32", "94", "59", "737"]);
  });

  it("should sort patient name in a locale-aware case insensitive manner", () => {
    const unsorted = [
      patient("abcde 123", "", "", "6"),
      patient("Apollo", "", "", "7"),
      patient("Abcde", "", "", "3"),
      patient("a@cde", "", "", "2"),
      patient("Apollo", "", "", "8"),
      patient("Astro", "", "", "9"),
      patient("Astro", "", "", "10"),
      patient("a2cde", "", "", "1"),
      patient("aBcde", "", "", "4"),
      patient("abcde", "", "", "5"),
    ];

    const sorted = sortPatientSearchResultsBy(unsorted, "patientName");

    expect(clientIds(...sorted)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
  });

  it("should sort client name by lastname, firstname in locale-aware case insensitive manner", () => {
    const unsorted = [
      patient("", "CaRRol", "Zane", "6"),
      patient("", "JoneS", "Cleopatra", "19"),
      patient("", "Franco", "MatTy", "12"),
      patient("", "bOurget", "Zeke", "4"),
      patient("", "JOnes", "jaMes", "20"),
      patient("", "GuerETTe", "JAkob", "14"),
      patient("", "GUERette", "Hope", "13"),
      patient("", "BouRGet", "Chris", "3"),
      patient("", "hamilTOn", "lEWis", "16"),
      patient("", "FraNco", "JaMes", "11"),
      patient("", "cArrol", "Trevor", "5"),
      patient("", "DuFrESne", "Andrew", "7"),
      patient("", "EHerts", "brad", "9"),
      patient("", "IgLEsias", "Manfred", "18"),
      patient("", "HamiLTon", "alex", "15"),
      patient("", "DuFresne", "Blake", "8"),
      patient("", "iGlesias", "Julio", "17"),
      patient("", "ARNold", "Xavier", "2"),
      patient("", "arnold", "Becky", "1"),
      patient("", "EhErts", "KYle", "10"),
    ];

    const sorted = sortPatientSearchResultsBy(unsorted, "clientLastName");

    expect(clientIds(...sorted)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
    ]);
  });

  it("should sort by client identifier in locale-aware case insensitive manner", () => {
    const unsorted = [
      patient("", "", "", "c3"),
      patient("", "", "", "z7"),
      patient("", "", "", "D4"),
      patient("", "", "", "f6"),
      patient("", "", "", "a1"),
      patient("", "", "", "E5"),
      patient("", "", "", "B2"),
    ];

    const sorted = sortPatientSearchResultsBy(unsorted, "clientIdentifier");

    expect(clientIds(...sorted)).toEqual(["a1", "B2", "c3", "D4", "E5", "f6", "z7"]);
  });
});

describe("sortPatientRecordSearchResultsBy", () => {
  it("should sort by patient name and days back in order specified", () => {
    const unsorted = shuffle([
      { patientDto: patient("Alex", "Black", "Rick", "111"), runDate: Date.now() - 24 * 3600 * 1 },
      { patientDto: patient("Alex", "Blake", "James", "112"), runDate: Date.now() - 24 * 3600 * 2 },
      { patientDto: patient("Alex", "Burke", "Delta", "1"), runDate: Date.now() - 24 * 3600 * 3 },
      { patientDto: patient("Brick", "DeLong", "Ariana", "343"), runDate: Date.now() - 24 * 3600 * 2 },
    ]);

    const sorted = sortPatientRecordSearchResultsBy(unsorted, "patientName", "daysBack");
    expect(clientIds(...sorted.map((s) => s.patientDto))).toEqual(["111", "112", "1", "343"]);
  });
});
