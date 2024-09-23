import {
  CatalystQualityControlLotDto,
  InstrumentType,
  QualityControlDto,
} from "@viewpoint/api";
import { Button, DataTable, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { BasicModal } from "../basic-modal/BasicModal";
import type { BasicModalProps } from "../basic-modal/BasicModal";
import { instrumentNameForType } from "../../utils/instrument-utils";
import { useCallback, useMemo } from "react";
import { useFormatDate } from "../../utils/hooks/datetime";
import { Theme } from "../../utils/StyleConstants";

const TestIds = {
  header: "header",
  closeButton: "closeButton",
  refRangeTable: "refRangeTable",
  lotNumber: "lotNumber",
  qcType: "qcType",
  expirationDate: "expirationDate",
  calibrationVersion: "calibrationVersion",
} as const;

type TestId = (typeof TestIds)[keyof typeof TestIds];

const StyledModal = styled(BasicModal)`
  /* Set up modal so content takes all available space */
  .spot-modal__header {
    flex: none;
  }

  .spot-modal__footer {
    flex: none;
  }

  .spot-modal__content {
    flex: auto;

    display: flex;
    flex-direction: column;
  }

  /* remove modal scroll related elements from flex layout */
  .spot-modal__header:after {
    display: none;
  }

  .spot-modal__content-scroll-shadow-mask {
    display: none;
  }

  .spot-modal__footer:before {
    display: none;
  }

  /* set min-height on all parent elements of scrollable content up to the flex
   * container to allow it to shrink to fit available height */

  .spot-modal__content-wrapper {
    display: flex;
    flex-direction: column;

    min-height: 0;
  }

  .spot-modal__copy {
    display: flex;
    flex-direction: column;

    min-height: 0;
  }

  /* spacing between info grid and table */
  .spot-modal__copy {
    gap: 30px;
  }

  /* shift button to right because there is only one */
  .spot-modal__footer {
    justify-content: flex-end;
  }
`;

const InfoGridRoot = styled.div`
  flex: 0 0;

  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 20px;
  margin: 0;
`;

const TableWrapper = styled.div`
  flex: auto;

  display: flex;
  flex-direction: column;

  overflow-y: auto;

  table {
    margin-left: 0;
    margin-right: 0;
  }

  table thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.background?.primary};
  }
`;

interface InfoGridProps {
  className?: string;
  instrumentType: InstrumentType;
  qcDto: QualityControlDto;
}

const CatalystInfoGrid = (props: InfoGridProps) => {
  const { t } = useTranslation();
  const formatDate = useFormatDate();

  const qcDto = props.qcDto as CatalystQualityControlLotDto;

  return (
    <InfoGridRoot className={props.className}>
      <SpotText level="paragraph" bold>
        {t("qc.lotInfo.lot")}:
      </SpotText>
      <SpotText level="paragraph" data-testid={TestIds.lotNumber}>
        {qcDto.lotNumber}
      </SpotText>
      <SpotText level="paragraph" bold>
        {t("qc.lotInfo.qcType")}:
      </SpotText>
      <SpotText level="paragraph" data-testid={TestIds.qcType}>
        {qcDto.controlType}
      </SpotText>
      <SpotText level="paragraph" bold>
        {t("qc.lotInfo.expiration")}:
      </SpotText>
      <SpotText level="paragraph" data-testid={TestIds.expirationDate}>
        {formatDate(qcDto.dateExpires)}
      </SpotText>
      <SpotText level="paragraph" bold>
        {t("qc.lotInfo.calibrationVersion")}:
      </SpotText>
      <SpotText level="paragraph" data-testid={TestIds.calibrationVersion}>
        {qcDto.calibrationVersion}
      </SpotText>
    </InfoGridRoot>
  );
};

type InfoGridComponent = (p: InfoGridProps) => JSX.Element;

const infoGridCompsByInstrument: {
  [key in InstrumentType]?: InfoGridComponent;
} = {
  [InstrumentType.CatalystDx]: CatalystInfoGrid,
  [InstrumentType.CatalystOne]: CatalystInfoGrid,
} as const;

const InfoGrid = (props: InfoGridProps) => {
  const Comp = infoGridCompsByInstrument[props.instrumentType] ?? null;
  return Comp != null ? <Comp {...props} /> : null;
};

const formatRefRange = (low?: string, high?: string) =>
  low && high ? `${low} - ${high}` : "";

const assayKey = (assayId?: string) => {
  if (assayId == null) return undefined;

  return `Assay.${assayId}`;
};

interface QCRefRange {
  assayDto?: { assayIdentityName?: string };
  high?: string;
  low?: string;
}

interface RefRangeTableProps {
  className?: string;
  ranges?: QCRefRange[];
}

const RefRangeTable = (props: RefRangeTableProps) => {
  const { t } = useTranslation();

  const assayName = useCallback(
    (assayId?: string) =>
      t(assayKey(assayId) as any, { defaultValue: assayId }),
    [t]
  );

  const data = useMemo(
    () =>
      props.ranges?.map((it) => ({
        assayName: assayName(it.assayDto?.assayIdentityName),
        refRange: formatRefRange(it.low, it.high),
      })) ?? [],
    [props.ranges, assayName]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("qc.lotInfo.test"),
        accessor: "assayName",
      },
      {
        Header: t("qc.lotInfo.expectedRange"),
        accessor: "refRange",
      },
    ],
    [t]
  );

  return (
    <TableWrapper>
      <DataTable
        data-testid={TestIds.refRangeTable}
        className={props.className}
        columns={columns}
        data={data}
      />
    </TableWrapper>
  );
};

interface QCLotInfoModalProps
  extends Omit<
    BasicModalProps,
    "headerContent" | "bodyContent" | "footerContent"
  > {
  instrumentType: InstrumentType;
  qualityControl: QualityControlDto;
}

const QCLotInfoModal = (props: QCLotInfoModalProps) => {
  const { t } = useTranslation();

  return (
    <StyledModal
      open={props.open}
      onClose={props.onClose}
      headerContent={
        <SpotText level={"h3"} data-testid={TestIds.header}>
          {t("qc.lotInfo.header", {
            instrumentName: instrumentNameForType(t, props.instrumentType),
          })}
        </SpotText>
      }
      bodyContent={
        <>
          <InfoGrid
            instrumentType={props.instrumentType}
            qcDto={props.qualityControl}
          />
          <RefRangeTable ranges={props.qualityControl.qcReferenceRangeDtos} />
        </>
      }
      footerContent={
        <Button data-testid={TestIds.closeButton} onClick={props.onClose}>
          {t("general.buttons.close")}
        </Button>
      }
    />
  );
};

export type { QCLotInfoModalProps };
export { QCLotInfoModal };

//exported for test only
export type { TestId };
export { TestIds, assayKey, formatRefRange };
