import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { InstrumentType, QcLotDto } from "@viewpoint/api";
import { Button, DataTable, SpotText } from "@viewpoint/spot-react";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import type { BasicModalProps } from "../../../../components/basic-modal/BasicModal";
import { instrumentNameForType } from "../../../../utils/instrument-utils";
import { useFormatDate } from "../../../../utils/hooks/datetime";
import { Theme } from "../../../../utils/StyleConstants";

const TestIds = {
  header: "header",
  closeButton: "closeButton",
  refRangeTable: "refRangeTable",
  lotNumber: "lotNumber",
  level: "level",
  expirationDate: "expirationDate",
  calibrationVersion: "calibrationVersion",
} as const;

type TestId = (typeof TestIds)[keyof typeof TestIds];

interface InfoGridProps {
  className?: string;
  instrumentType: InstrumentType;
  qcDto: QcLotDto;
}

// Need to check the possiblity on reusing the duplicate styles of this component with components/qc/QCLotInfoModal
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

const InfoGrid = (props: InfoGridProps) => {
  const { t } = useTranslation();
  const formatDate = useFormatDate();

  const qcDto = props.qcDto;

  return (
    <InfoGridRoot className={props.className}>
      <SpotText level="paragraph" bold>
        {t("qc.lotInfo.lot")}:
      </SpotText>
      <SpotText level="paragraph" data-testid={TestIds.lotNumber}>
        {qcDto.lotNumber}
      </SpotText>
      <SpotText level="paragraph" bold>
        {t("instrumentScreens.proCyteDx.qc.level")}:
      </SpotText>
      <SpotText level="paragraph" data-testid={TestIds.level}>
        {qcDto.level}
      </SpotText>
      <SpotText level="paragraph" bold>
        {t("instrumentScreens.proCyteDx.qc.unopenedExpiration")}:
      </SpotText>
      <SpotText level="paragraph" data-testid={TestIds.expirationDate}>
        {formatDate(qcDto.dateExpires)}
      </SpotText>
    </InfoGridRoot>
  );
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
  target?: string;
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
        target: it.target,
      })) ?? [],
    [props.ranges, assayName]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("instrumentScreens.proCyteDx.qc.parameter"),
        accessor: "assayName",
      },
      {
        Header: t("instrumentScreens.proCyteDx.qc.target"),
        accessor: "target",
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

interface ProCyteDxQcLotInfoModalProps
  extends Omit<
    BasicModalProps,
    "headerContent" | "bodyContent" | "footerContent"
  > {
  instrumentType: InstrumentType;
  qualityControl: QcLotDto;
}

const ProCyteDxQcLotInfoModal = (props: ProCyteDxQcLotInfoModalProps) => {
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

export type { ProCyteDxQcLotInfoModalProps };
export { ProCyteDxQcLotInfoModal };

//exported for test only
export type { TestId };
export { TestIds, assayKey, formatRefRange };
