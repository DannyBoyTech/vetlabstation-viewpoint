import { LabRequestDto } from "@viewpoint/api";
import { SpotText } from "@viewpoint/spot-react";
import classNames from "classnames";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { distinct } from "../../utils/general-utils";
import { useFormatDateTime12h } from "../../utils/hooks/datetime";
import { instrumentNameForType } from "../../utils/instrument-utils";
import { Theme } from "../../utils/StyleConstants";
import { LocalizedPatientSignalment } from "../localized-signalment/LocalizedPatientSignalment";

import { useFormatPersonalName } from "../../utils/hooks/LocalizationHooks";

interface TransferResultsDetailProps {
  labRequest?: LabRequestDto;
  className?: string;
}

const Card = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightSecondary};
  border-radius: 4px;
  padding: 20px;

  .spot-patient-display__icon,
  .spot-patient-display__pet-info {
    display: none;
  }
`;

const Section = styled.div`
  margin: 10px 0;
`;

const TransferResultsDetail = ({
  labRequest,
  ...props
}: TransferResultsDetailProps) => {
  const { t } = useTranslation();
  const classes = classNames("transfer-result-detail", props.className);
  const formatDateTime12h = useFormatDateTime12h();
  const formatName = useFormatPersonalName();

  const instrumentList = useMemo(() => {
    const instrumentTypes =
      labRequest?.instrumentRunDtos
        ?.map((run) => run.instrumentType)
        .filter((typ) => typ != null) ?? [];

    return distinct(instrumentTypes)
      ?.map((typ) => instrumentNameForType(t, typ))
      .join(", ");
  }, [labRequest?.instrumentRunDtos, t]);

  return (
    <Card className={classes} data-testid="transfer-results-detail">
      <Section className="patient">
        <LocalizedPatientSignalment
          size="small"
          patient={labRequest?.patientDto}
          allowPhotoUpload={false}
        />
        <SpotText
          className="requested"
          bold
          level={"paragraph"}
          data-testid="request-date"
        >
          {formatDateTime12h(labRequest?.requestDate)}
        </SpotText>
      </Section>

      <Section className="instruments" data-testid="instruments-section">
        <SpotText level="paragraph" bold>
          {t("transferResultsModal.heading.instruments")}
        </SpotText>
        <SpotText level="paragraph">{instrumentList}</SpotText>
      </Section>

      <Section className="veterinarian" data-testid="veterinarian-section">
        <SpotText level="paragraph" bold>
          {t("transferResultsModal.heading.veterinarian")}
        </SpotText>
        <SpotText level="paragraph">
          {labRequest?.doctorDto != null
            ? formatName(labRequest.doctorDto)
            : "--"}
        </SpotText>
      </Section>

      <Section className="requisition" data-testid="requisition-section">
        <SpotText level="paragraph" bold>
          {t("transferResultsModal.heading.requisitionNumber")}
        </SpotText>
        <SpotText level="paragraph">
          {(labRequest?.requisitionId != null &&
            labRequest?.requisitionId?.trim()) ||
            "--"}
        </SpotText>
      </Section>
    </Card>
  );
};

export type { TransferResultsDetailProps };

export { TransferResultsDetail };
