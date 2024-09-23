import { useParams } from "react-router-dom";
import { useGetInstrumentQuery } from "../../api/InstrumentApi";
import { InstrumentType } from "@viewpoint/api";
import { ProCyteOneLotEntryScreen } from "./procyteone/ProCyteOneLotEntryScreen";
import { ProCyteDxLotEntryScreen } from "./procytedx/ProCyteDxLotEntryScreen";
import { InVueDxLotEntryScreen } from "./invuedx/diagnostics/InVueDxLotEntryScreen";
import { useHeaderTitle } from "../../utils/hooks/hooks";
import { useTranslation } from "react-i18next";

export function LotEntryScreens() {
  const { instrumentId: instrumentIdParam } = useParams();
  const { barcodeType: barcodeTypeParam } = useParams();
  const { t } = useTranslation();

  const { data: instrument } = useGetInstrumentQuery(
    Number(instrumentIdParam!)
  );

  switch (instrument?.instrument.instrumentType) {
    case InstrumentType.ProCyteOne:
      return (
        <ProCyteOneLotEntryScreen
          instrument={instrument}
          initialBarcodeType={barcodeTypeParam}
        />
      );
    case InstrumentType.Theia:
      return <InVueDxLotEntryScreen instrument={instrument} />;
    case InstrumentType.ProCyteDx:
      return <ProCyteDxLotEntryScreen instrumentStatus={instrument} />;
    default:
      return <></>;
  }
}
