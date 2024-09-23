import { CatalystQualityControlLotDto, InstrumentType } from "@viewpoint/api";
import {
  randomArrayOf,
  randomAssayDto,
  randomCatalystQualityControlDto,
  randomQualityControlReferenceRangeDto,
} from "@viewpoint/test-utils";
import { render } from "../../../test-utils/test-utils";
import {
  assayKey,
  formatRefRange,
  QCLotInfoModal,
  TestIds,
} from "./QCLotInfoModal";
import { screen } from "@testing-library/react";
import dayjs from "dayjs";

const catQcDtoWithUnknownAssays = (
  length: number,
  instrumentType: InstrumentType.CatalystDx | InstrumentType.CatalystOne
) => {
  const randAssays = randomArrayOf({
    length,
    valueFn: (i) => randomAssayDto({ assayIdentityName: `ASSAY::${i}` }),
  });

  const qcReferenceRangeDtos = Array.from(randAssays, (assayDto) =>
    randomQualityControlReferenceRangeDto({ assayDto })
  );

  return randomCatalystQualityControlDto({
    instrumentType,
    qcReferenceRangeDtos,
  });
};

describe("QC lot info modal", () => {
  it("should display catone header when instrument type is catone", () => {
    const instrumentType = InstrumentType.CatalystOne;
    const qcDto = randomCatalystQualityControlDto({ instrumentType });

    render(
      <QCLotInfoModal
        open={true}
        onClose={() => {}}
        instrumentType={instrumentType}
        qualityControl={qcDto}
      />
    );

    expect(screen.getByTestId(TestIds.header).textContent).toContain(
      "Catalyst One QC Lot Information"
    );
  });

  describe("assayKey", () => {
    it("should prepend 'Assay.' to passed argument", () => {
      expect(assayKey("somevalue")).toEqual("Assay.somevalue");
    });

    it("should return undefined if passed undefined", () => {
      expect(assayKey(undefined)).toBeUndefined();
    });
  });

  describe("formatRefRange", () => {
    test.each`
      low          | high         | expected
      ${"2.3"}     | ${"5.9"}     | ${"2.3 - 5.9"}
      ${undefined} | ${"100"}     | ${""}
      ${"34"}      | ${undefined} | ${""}
      ${""}        | ${""}        | ${""}
      ${""}        | ${"5.9"}     | ${""}
      ${"2"}       | ${""}        | ${""}
    `("should return $expected for low = $low and high = $high", () => {
      expect(formatRefRange("", ""));
    });
  });

  describe.each`
    instrumentName    | instrumentType
    ${"Catalyst Dx"}  | ${InstrumentType.CatalystDx}
    ${"Catalyst One"} | ${InstrumentType.CatalystOne}
  `("$instrumentName usage", ({ instrumentName, instrumentType }) => {
    //to not have to do backbends to verify i18n, use unknown assays as they get passed through untranslated

    let qcDto: CatalystQualityControlLotDto;

    beforeEach(() => {
      qcDto = catQcDtoWithUnknownAssays(5, instrumentType);

      render(
        <QCLotInfoModal
          open={true}
          onClose={() => {}}
          instrumentType={instrumentType}
          qualityControl={qcDto}
        />
      );
    });

    describe("header", () => {
      it("should display instrument specific content", () => {
        expect(screen.getByTestId(TestIds.header).textContent).toContain(
          `${instrumentName} QC Lot Information`
        );
      });
    });

    describe("lot info grid", () => {
      it("should display lot number", () => {
        expect(screen.getByTestId(TestIds.lotNumber).textContent).toContain(
          qcDto.lotNumber
        );
      });

      it("should display qc type", () => {
        expect(screen.getByTestId(TestIds.qcType).textContent).toContain(
          qcDto.controlType
        );
      });

      it("should display expiration date", () => {
        expect(
          screen.getByTestId(TestIds.expirationDate).textContent
        ).toContain(dayjs(qcDto.dateExpires).format("M/DD/YY"));
      });

      it("should display calibration version ", () => {
        expect(
          screen.getByTestId(TestIds.calibrationVersion).textContent
        ).toContain(qcDto.calibrationVersion);
      });
    });

    describe("ref range table", () => {
      it("should have 'Test' and 'Expected Range' columns", () => {
        const refRangeTable = screen.getByTestId(TestIds.refRangeTable);

        const columnHeads = Array.from(
          refRangeTable.querySelectorAll("th").values()
        );

        expect(columnHeads.length).toBe(2);
        expect(columnHeads[0].textContent).toContain("Test");
        expect(columnHeads[1].textContent).toContain("Expected Range");
      });

      it("should display a row for each qc ref range, in natural order", () => {
        const refRangeTable = screen.getByTestId(TestIds.refRangeTable);

        const refRangeRows = Array.from(
          refRangeTable.querySelectorAll("tbody tr").values()
        );

        expect(refRangeRows.length).toEqual(qcDto.qcReferenceRangeDtos?.length);

        qcDto.qcReferenceRangeDtos?.forEach((refRangeDto, idx) => {
          const rowElem = refRangeRows[idx];

          const rowCells = rowElem.querySelectorAll("td");

          expect(rowCells.length).toBe(2);

          expect(rowCells[0]).toHaveTextContent(`ASSAY::${idx}`);

          if (refRangeDto.low && refRangeDto.high) {
            expect(rowCells[1].textContent).toContain(
              `${refRangeDto.low} - ${refRangeDto.high}`
            );
          } else {
            expect(rowCells[1]).toHaveTextContent("");
          }
        });
      });
    });
  });
});
