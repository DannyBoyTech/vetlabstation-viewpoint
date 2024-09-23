import { InstrumentRunDto, PatientDto } from "@viewpoint/api";
import { ConfirmModal } from "../../confirm-modal/ConfirmModal";
import { useTranslation } from "react-i18next";
import { useInstrumentNameForId } from "../../../utils/hooks/hooks";
import { useState } from "react";
import styled from "styled-components";
import { TextArea } from "@viewpoint/spot-react";
import { InputAware } from "../../InputAware";
import { SpotText } from "@viewpoint/spot-react/src";
import { useFormatDateTime12h } from "../../../utils/hooks/datetime";
import { useFormatPersonalName } from "../../../utils/hooks/LocalizationHooks";

import { DefaultResultTableResultRow } from "../default-components/DefaultResultTableResultRow";
import { DifferentialIcon } from "../common-components/Differentials";
import { ResultCell } from "../common-cells/ResultCell";
import { ReferenceRangeCell } from "../common-cells/ReferenceRangeCell";
import { AssayNameCell } from "../common-cells/AssayNameCell";
import { TestOrderResultIdentifier } from "../common-components/result-table-components";

interface SediVueCommentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (comment?: string) => void;
  run: InstrumentRunDto;
  patient: PatientDto;
  assayCategoryResultMappings?: Record<string, TestOrderResultIdentifier[]>;
}

export function SediVueCommentModal(props: SediVueCommentModalProps) {
  const [comment, setComment] = useState(props.run.userComment);
  const { t } = useTranslation();
  const formatName = useFormatPersonalName();
  return (
    <ConfirmModal
      responsive
      open={props.open}
      dismissable={false}
      onClose={props.onClose}
      onConfirm={() => props.onSave(comment)}
      bodyContent={
        <EditSediVueComment
          run={props.run}
          comment={comment}
          onCommentChanged={(cmt) => setComment(cmt)}
          assayCategoryResultMappings={props.assayCategoryResultMappings}
        />
      }
      confirmable={comment != props.run.userComment}
      confirmButtonContent={t("general.buttons.save")}
      cancelButtonContent={t("general.buttons.cancel")}
      secondaryHeaderContent={formatName({
        firstName: props.patient.patientName,
        lastName: props.patient.clientDto.lastName,
      })}
    />
  );
}

const Root = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: column;
  height: 250px;
  width: 700px;
  overflow: hidden;
`;

const Columns = styled.div`
  height: 100%;
  display: flex;
  gap: 10px;
  overflow: hidden;
`;

const ResultsContainer = styled.div`
  height: 100%;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr auto auto;
  border-bottom: ${(p) => p.theme.borders?.extraLightPrimary};
`;

const CommentContainer = styled.div`
  padding: 5px;
  flex: 1;
  display: flex;
`;

const StyledTextArea = styled(TextArea)`
  resize: none;
`;

interface EditSediVueCommentProps {
  run: InstrumentRunDto;
  onCommentChanged: (comment: string) => void;
  comment?: string;
  assayCategoryResultMappings?: Record<string, TestOrderResultIdentifier[]>;
}

function EditSediVueComment(props: EditSediVueCommentProps) {
  const getInstrumentName = useInstrumentNameForId();
  const formatDate = useFormatDateTime12h();
  return (
    <Root>
      <SpotText level="secondary" bold>
        {getInstrumentName(props.run.instrumentId)}
        {", "}
        {formatDate(props.run.testDateUtc * 1000)}
      </SpotText>
      <Columns>
        <ResultsContainer>
          {props.run.instrumentResultDtos?.map((result) => (
            <ResultsGrid>
              <AssayNameCell
                result={result}
                indented={result.displayCategory && result.category != null}
              />
              <ResultCell result={result} />
              <ReferenceRangeCell result={result} />
            </ResultsGrid>
          ))}
        </ResultsContainer>
        <CommentContainer>
          <InputAware>
            <StyledTextArea
              value={props.comment ?? ""}
              onChange={(ev) => props.onCommentChanged(ev.target.value)}
            />
          </InputAware>
        </CommentContainer>
      </Columns>
    </Root>
  );
}
