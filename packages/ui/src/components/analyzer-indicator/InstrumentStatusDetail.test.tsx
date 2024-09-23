import { InstrumentType } from "@viewpoint/api";
import { InstrumentStatusDetail } from "./InstrumentStatusDetail";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { render } from "../../../test-utils/test-utils";

const DETAIL_TESTID = "instrument-status-detail";

describe("InstrumentStatusDetail", () => {
  it.each([
    {
      instrumentType: InstrumentType.AutoReader,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.AutoReader,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.CatalystDx,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.CatalystDx,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.CatalystOne,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.CatalystOne,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.CoagDx,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.CoagDx,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.ProCyteDx,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.ProCyteDx,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.ProCyteOne,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.ProCyteOne,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.LaserCyte,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.LaserCyte,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.LaserCyteDx,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.LaserCyteDx,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.SediVueDx,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.SediVueDx,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.SnapReader,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.SnapReader,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.SNAPPro,
      hidePseudoStatus: true,
      statusShows: false,
    },
    {
      instrumentType: InstrumentType.SNAPPro,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.SNAP,
      hidePseudoStatus: true,
      statusShows: false,
    },
    {
      instrumentType: InstrumentType.SNAP,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.Theia,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.Theia,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.Tensei,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.Tensei,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.UAAnalyzer,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.UAAnalyzer,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.UriSysDx,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.UriSysDx,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.VetLyte,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.VetLyte,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.VetStat,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.VetStat,
      hidePseudoStatus: false,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.VetTest,
      hidePseudoStatus: true,
      statusShows: true,
    },
    {
      instrumentType: InstrumentType.VetTest,
      hidePseudoStatus: false,
      statusShows: true,
    },
  ])(
    "should show status=$statusShows for instrumentType=$instrumentType while hidePseudoStatus=$hidePseudoStatus",
    ({ instrumentType, hidePseudoStatus, statusShows }) => {
      const instrumentStatus = randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType,
        }),
      });

      const screen = render(
        <InstrumentStatusDetail
          name="SNAP Pro"
          type={instrumentStatus.instrument.instrumentType}
          status={instrumentStatus.instrumentStatus}
          hidePseudoStatus={hidePseudoStatus}
          data-testid={DETAIL_TESTID}
        />
      );

      const detail = screen.getByTestId(DETAIL_TESTID);
      const statusPills = Array.from(detail.querySelectorAll(".spot-pill"));

      expect(statusPills).toHaveLength(statusShows ? 1 : 0);
    }
  );
});
