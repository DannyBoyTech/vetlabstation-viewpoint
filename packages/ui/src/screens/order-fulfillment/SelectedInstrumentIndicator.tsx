import { ExecuteInstrumentRunDto } from "@viewpoint/api";
import { useGetInstrumentQuery } from "../../api/InstrumentApi";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import styled from "styled-components";
import { SpotIcon } from "@viewpoint/spot-icons";
import {
  RunValidationResult,
  validateExecuteRunRequest,
} from "../../utils/validation/labrequest-validation";
import { Theme } from "../../utils/StyleConstants";
import { SpotText } from "@viewpoint/spot-react";

const Container = styled.div`
  position: relative;
  height: 50px;
`;

const InstrumentImage = styled.img`
  object-fit: contain;
  height: 100%;
`;

const StatusIcon = styled.div<{ $valid: boolean }>`
  position: absolute;
  top: 0;
  right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 5px;
  width: 20px;
  height: 20px;

  background-color: ${(p: { $valid: boolean; theme: Theme }) =>
    p.$valid
      ? p.theme.colors?.feedback?.success
      : p.theme.colors?.text?.secondary};

  .spot-icon {
    height: unset;
    width: unset;
  }
`;

const NumberStatus = styled(SpotText)`
  && {
    font-size: 14px;
    color: white;
  }
`;

const TestId = {
  selectedInstrumentIndicator: "selected-instrument-indicator",
} as const;

interface SelectedInstrumentIndicatorProps {
  instrumentId: number;
  executeRunRequests: ExecuteInstrumentRunDto[];
}

export function SelectedInstrumentIndicator(
  props: SelectedInstrumentIndicatorProps
) {
  const { data: instrumentStatus, isLoading } = useGetInstrumentQuery(
    props.instrumentId
  );

  const containsRunsForOtherInstrument = props.executeRunRequests?.some(
    (it) => it.instrumentId !== props.instrumentId
  );

  const isValid =
    !containsRunsForOtherInstrument &&
    props.executeRunRequests
      .map((it) => validateExecuteRunRequest(it, instrumentStatus))
      .every((it) => it === RunValidationResult.Valid);

  if (isLoading || instrumentStatus == null) {
    return <></>;
  }

  const statusContent =
    props.executeRunRequests.length > 1 ? (
      <NumberStatus level="tertiary">
        {props.executeRunRequests.length}
      </NumberStatus>
    ) : (
      <SpotIcon name={isValid ? "checkmark" : "next"} size={10} color="white" />
    );

  return (
    <Container data-testid={TestId.selectedInstrumentIndicator}>
      <InstrumentImage
        src={getInstrumentDisplayImage(
          instrumentStatus.instrument.instrumentType
        )}
      />
      <StatusIcon $valid={isValid}>{statusContent}</StatusIcon>
    </Container>
  );
}
