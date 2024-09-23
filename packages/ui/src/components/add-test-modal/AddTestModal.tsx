import { Button, Modal, SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import {
  BasicModal,
  BasicModalProps,
} from "../../components/basic-modal/BasicModal";
import styled from "styled-components";
import { CommonTransComponents } from "../../utils/i18n-utils";
import {
  LabRequestRunType,
  SupportedRunTypeValidationDto,
} from "@viewpoint/api";
import { useMemo } from "react";
import { InlineText } from "../typography/InlineText";
import { SpotIcon } from "@viewpoint/spot-icons";

interface AddTestModalProps
  extends Omit<
    BasicModalProps,
    "headerContent" | "bodyContent" | "footerContent"
  > {
  onClickAppend?: () => void;
  onClickNew?: () => void;
  onClickMerge?: () => void;
  addTestValidations: SupportedRunTypeValidationDto[];
}

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5em;
`;

const NotesSection = styled.div`
  display: flex;
  align-items: center;
`;

const IconSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 16px 16px 0;

  > .spot-icon {
    fill: ${(p) => p.theme.colors?.feedback?.error};
  }
`;

const NotesContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const AddTestModal = (props: AddTestModalProps) => {
  const { t, i18n } = useTranslation();

  const mappedValidations = useMemo(
    () =>
      props.addTestValidations.reduce(
        (mapped, current) => ({
          ...mapped,
          [current.runType]: current,
        }),
        {} as Record<LabRequestRunType, SupportedRunTypeValidationDto>
      ),
    [props.addTestValidations]
  );

  const validationText = useMemo(
    () =>
      props.addTestValidations
        .flatMap((validation) => validation.reasons)
        .filter((reason) =>
          i18n.exists(`addTestModal.validationErrors.${reason}` as any)
        )
        .map((reason) => (
          <div key="reason">
            <SpotText level="secondary">
              <Trans
                i18nKey={`addTestModal.validationErrors.${reason}` as any}
                components={{
                  ...CommonTransComponents,
                  strong: <InlineText level="secondary" bold />,
                }}
              />
            </SpotText>
          </div>
        )),
    [i18n, props.addTestValidations]
  );

  return (
    <BasicModal
      open={props.open}
      onClose={props.onClose}
      headerContent={
        <SpotText level="h2" className="spot-modal__title">
          {t("addTestModal.title")}
        </SpotText>
      }
      bodyContent={
        <ModalBody>
          <div>{t("addTestModal.selectHowToSaveResults")}</div>

          {mappedValidations.APPEND?.supported && (
            <SpotText level="paragraph">
              <Trans
                i18nKey={"addTestModal.appendResults.description"}
                components={CommonTransComponents}
              />
            </SpotText>
          )}

          {mappedValidations.MERGE?.supported && (
            <SpotText level="paragraph">
              <Trans
                i18nKey={"addTestModal.mergeResults.description"}
                components={CommonTransComponents}
              />
            </SpotText>
          )}

          {mappedValidations.NEW?.supported && (
            <SpotText level="paragraph">
              <Trans
                i18nKey={"addTestModal.newResults.description"}
                components={CommonTransComponents}
              />
            </SpotText>
          )}
          {validationText.length > 0 && (
            <NotesSection>
              <IconSection>
                <SpotIcon name="alert-notification" />
              </IconSection>
              <NotesContent>{validationText}</NotesContent>
            </NotesSection>
          )}
        </ModalBody>
      }
      footerContent={
        <>
          <Modal.FooterCancelButton
            data-testid="cancel-button"
            onClick={props.onClose}
          >
            {t("general.buttons.cancel")}
          </Modal.FooterCancelButton>
          {mappedValidations.APPEND?.supported && (
            <Button
              buttonType={"secondary"}
              data-testid="append-button"
              onClick={props.onClickAppend}
            >
              {t("addTestModal.appendResults.button")}
            </Button>
          )}
          {mappedValidations.MERGE?.supported && (
            <Button
              buttonType={"secondary"}
              data-testid="merge-button"
              onClick={props.onClickMerge}
            >
              {t("addTestModal.mergeResults.button")}
            </Button>
          )}
          {mappedValidations.NEW?.supported && (
            <Button
              buttonType={"secondary"}
              data-testid="new-button"
              onClick={props.onClickNew}
            >
              {t("addTestModal.newResults.button")}
            </Button>
          )}
        </>
      }
    />
  );
};

export type { AddTestModalProps };

export { AddTestModal };
