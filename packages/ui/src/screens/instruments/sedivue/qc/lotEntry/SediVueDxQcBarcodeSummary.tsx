import { SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { InlineText } from "../../../../../components/typography/InlineText";
import { ReactNode } from "react";
import classNames from "classnames";
import { useFormatDate } from "../../../../../utils/hooks/datetime";
import { QualityControlBarcodeDto } from "@viewpoint/api";

const Levels = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Level = styled.div`
  flex: auto;
  flex-direction: column;

  display: flex;
  gap: 15px;

  min-height: 150px;
`;

const BarcodeRoot = styled.div`
  flex: none;

  display: grid;
  grid-template-columns: 33% 67%;
  grid-template-rows: repeat(4, minmax(23.5px, auto));
  grid-template-areas:
    "label lot"
    ".     exp"
    ".     rbc"
    ".     wbc";

  column-gap: 4px;
  row-gap: 5px;

  .barcode__label {
    grid-area: label;
    text-align: right;
  }

  .barcode__lot {
    grid-area: lot;
  }

  .barcode__expiry {
    grid-area: exp;
  }

  .barcode__rbc {
    grid-area: rbc;
  }

  .barcode__wbc {
    grid-area: wbc;
  }
`;

interface SediVueDxBarcodeSummaryProps {
  className?: string;
  "data-testid"?: string;

  level1Barcode?: QualityControlBarcodeDto;
  level2Barcode?: QualityControlBarcodeDto;
}

interface BarcodeProps {
  label: ReactNode;
  barcode?: QualityControlBarcodeDto;
  placeholderContent: ReactNode;
}

function BarcodePlaceholder(props: { children: ReactNode }) {
  return <SpotText level="paragraph" {...props} />;
}

const BarcodeDatumRoot = styled.div`
  .barcode-datum__label {
    margin-right: 5px;
  }
`;

function formatRangeLowHigh(low: number, high: number): string {
  return `${low}-${high}`;
}

function BarcodeDatum(props: {
  className?: string;
  label: ReactNode;
  value: ReactNode;
}) {
  const classes = classNames("barcode-datum", props.className);
  return (
    <BarcodeDatumRoot className={classes}>
      <InlineText className="barcode-datum__label" level="paragraph" bold>
        {props.label}
      </InlineText>
      <InlineText className="barcode-datum__value" level="paragraph">
        {props.value}
      </InlineText>
    </BarcodeDatumRoot>
  );
}

function Barcode(props: BarcodeProps) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();

  const interp = props.barcode?.barcodeInterpretation;
  const lotNumber = interp?.lotNumber;
  let rbcRange;
  let wbcRange;
  let expiry;

  if (interp) {
    const { rbcLow, rbcHigh, wbcLow, wbcHigh, expirationDate } = interp;
    rbcRange = formatRangeLowHigh(rbcLow, rbcHigh);
    wbcRange = formatRangeLowHigh(wbcLow, wbcHigh);
    expiry = formatDate(expirationDate);
  }

  return (
    <BarcodeRoot>
      <div className="barcode__label">
        <SpotText level="paragraph" bold>
          {props.label}
        </SpotText>
      </div>
      {props.barcode ? (
        <>
          <BarcodeDatum
            className="barcode__lot"
            label={t("instrumentScreens.sediVueDx.qc.lotEntry.lotNumber")}
            value={lotNumber}
          />
          <BarcodeDatum
            className="barcode__expiry"
            label={t("instrumentScreens.sediVueDx.qc.lotEntry.expiry")}
            value={expiry}
          />
          <BarcodeDatum
            className="barcode__rbc"
            label={t("instrumentScreens.sediVueDx.qc.lotEntry.rbcRange")}
            value={rbcRange}
          />
          <BarcodeDatum
            className="barcode__wbc"
            label={t("instrumentScreens.sediVueDx.qc.lotEntry.wbcRange")}
            value={wbcRange}
          />
        </>
      ) : (
        <BarcodePlaceholder>
          {t("instrumentScreens.sediVueDx.qc.lotEntry.enterBarcode")}
        </BarcodePlaceholder>
      )}
    </BarcodeRoot>
  );
}

const LevelHeadingRoot = styled.div`
  display: flex;
  gap: 10px;

  .level-heading__label {
    flex: initial;
  }

  .level-heading__message {
    flex: auto;
  }
`;

interface LevelHeadingProps {
  className?: string;
  "data-testid"?: string;

  title: ReactNode;
  message?: ReactNode;
}

function LevelHeading(props: LevelHeadingProps) {
  return (
    <LevelHeadingRoot>
      <SpotText className="level-heading__label" level="paragraph" bold>
        {props.title}
      </SpotText>
      <SpotText className="level-heading__message" level="paragraph" bold>
        {props.message}
      </SpotText>
    </LevelHeadingRoot>
  );
}

function SediVueDxQcBarcodeSummary(props: SediVueDxBarcodeSummaryProps) {
  const { t } = useTranslation();
  const classes = classNames(props.className, "svdx-qc-barcode-summary");

  return (
    <Levels className={classes} data-testid={props["data-testid"]}>
      <Level>
        <LevelHeading
          title={t("instrumentScreens.sediVueDx.qc.lotEntry.level1Abnormal")}
          message={
            props.level1Barcode
              ? t("instrumentScreens.sediVueDx.qc.lotEntry.complete")
              : undefined
          }
        />
        <Barcode
          label={t("instrumentScreens.sediVueDx.qc.lotEntry.barcode1")}
          barcode={props.level1Barcode}
          placeholderContent={t(
            "instrumentScreens.sediVueDx.qc.lotEntry.enterBarcode"
          )}
        />
      </Level>
      <Level>
        <LevelHeading
          title={t("instrumentScreens.sediVueDx.qc.lotEntry.level2Normal")}
          message={
            props.level2Barcode
              ? t("instrumentScreens.sediVueDx.qc.lotEntry.complete")
              : undefined
          }
        />
        <Barcode
          label={t("instrumentScreens.sediVueDx.qc.lotEntry.barcode2")}
          barcode={props.level2Barcode}
          placeholderContent={t(
            "instrumentScreens.sediVueDx.qc.lotEntry.enterBarcode"
          )}
        />
      </Level>
    </Levels>
  );
}

export type { SediVueDxBarcodeSummaryProps };
export { SediVueDxQcBarcodeSummary };
