import { SlideOut } from "../../slideout/SlideOut";
import {
  CancelRunContainer,
  Divider,
  Header,
  HeaderButton,
  ManualEntrySlideOutProps,
  PageContainer,
  Root,
} from "../common-slideout-components";
import { useRef, useState } from "react";
import { CancelConfirmationModal } from "../../confirm-modal/CancelConfirmationModal";
import { useTranslation } from "react-i18next";
import {
  InstrumentType,
  ManualCrpResultDto,
  QualifierTypeEnum,
} from "@viewpoint/api";
import { Button, Input, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { GreaterThanLessThanNumpad } from "../../keyboard/GreaterThanLessThanNumpad";
import SpinnerOverlay from "../../overlay/SpinnerOverlay";
import { CancelRunModal } from "../../../screens/home/in-process/InProcessComponents";
import { I18nNs } from "../../../i18n/config";
import { useLocaleData } from "../../../context/AppStateContext";

export const TestId = {
  SlideOut: "mcrp-result-entry-slideout",
  CloseConfirm: "mcrp-result-entry-close-confirm-modal",
};

export interface ManualCRPResultsEntrySlideOutProps
  extends ManualEntrySlideOutProps {
  onSaveResults: (results: ManualCrpResultDto) => void;
  onCloseRequested: () => void;
  initialResults?: ManualCrpResultDto;
  onCancelRun?: () => void;
  loading?: boolean;
}

export function ManualCRPResultsEntrySlideOut(
  props: ManualCRPResultsEntrySlideOutProps
) {
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const { t } = useTranslation();

  return (
    <SlideOut
      side={"right"}
      open={!props.closing}
      onTapShade={() => setConfirmingClose(true)}
      onCloseTransitionEnd={() => props.onClose()}
      data-testid={TestId.SlideOut}
    >
      {props.loading && <SpinnerOverlay />}
      <ManualCRPResultsEntry
        onClose={() => setConfirmingClose(true)}
        onSave={props.onSaveResults}
        onCancelRun={
          props.onCancelRun == null
            ? undefined
            : () => setConfirmingCancel(true)
        }
        initialResults={props.initialResults}
      />
      {confirmingClose && (
        <CancelConfirmationModal
          onConfirm={() => {
            setConfirmingClose(false);
            props.onCloseRequested();
          }}
          open={confirmingClose}
          onClose={() => setConfirmingClose(false)}
          data-testid={TestId.CloseConfirm}
        />
      )}
      {confirmingCancel && (
        <CancelRunModal
          onConfirm={() => props.onCancelRun?.()}
          onClose={() => setConfirmingCancel(false)}
          instrumentName={t(`instruments.names.${InstrumentType.ManualCRP}`)}
        />
      )}
    </SlideOut>
  );
}

const HeaderText = styled(SpotText)`
  flex: 1;
  align-self: center;
  text-align: center;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  overflow: hidden;
`;

const EntryContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 48px;
  gap: 16px;
`;

interface ManualCRPResultsEntryProps {
  onClose: () => void;
  onSave: (results: ManualCrpResultDto) => void;
  initialResults?: ManualCrpResultDto;
  onCancelRun?: () => void;
}

function ManualCRPResultsEntry(props: ManualCRPResultsEntryProps) {
  const [resultValue, setResultValue] = useState(
    props.initialResults?.resultValue ?? ""
  );
  const [qualifierType, setQualifierType] = useState<QualifierTypeEnum>(
    props.initialResults?.qualifierType ?? QualifierTypeEnum.EQUALITY
  );
  const { t } = useTranslation();
  const { t: formatT, i18n } = useTranslation(I18nNs.Formats);
  const { decimalSeparator } = useLocaleData();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const qualifierChar = i18n.exists(`qualifiers.${qualifierType}`, {
    ns: "formats",
  })
    ? formatT(`qualifiers.${qualifierType}` as any)
    : undefined;

  const replacedResultValue = resultValue?.replaceAll(decimalSeparator, ".");

  const resultValid =
    replacedResultValue != null &&
    replacedResultValue.length > 0 &&
    !isNaN(Number(replacedResultValue));

  const handleSave = () => {
    if (!resultValid) {
      console.warn(
        `Invalid result ${replacedResultValue} attempting to be saved.`
      );
      return;
    }
    props.onSave({
      resultValue: replacedResultValue,
      qualifierType,
    });
  };

  return (
    <Root>
      <Header>
        <HeaderButton buttonType="secondary" onClick={props.onClose}>
          {t("general.buttons.close")}
        </HeaderButton>
        <HeaderText level="paragraph" bold>
          {t("resultsEntry.manualCRP.header")}
        </HeaderText>

        <HeaderButton
          buttonType="primary"
          onClick={handleSave}
          disabled={!resultValid}
        >
          {t("general.buttons.save")}
        </HeaderButton>
      </Header>

      <Divider />

      <PageContainer>
        <Content>
          <EntryContainer>
            <Input
              autoFocus
              type="search"
              innerRef={inputRef}
              value={`${
                qualifierChar == null ? "" : `${qualifierChar} `
              }${resultValue}`}
              placeholder={`- - ${decimalSeparator} - -`}
              maxLength={qualifierChar == null ? 5 : 7}
              onChange={(ev) => {
                const cleanedEntry = ev.target.value
                  .replace(qualifierChar ?? "", "")
                  .replaceAll(decimalSeparator, ".")
                  .trim();
                if (cleanedEntry === "") {
                  setResultValue("");
                  return;
                }
                const entry = Number(cleanedEntry);
                if (entry != null && !isNaN(entry) && entry <= 99.99) {
                  setResultValue(
                    cleanedEntry.replaceAll(".", decimalSeparator)
                  );
                }
              }}
              style={{ height: "3.5em" }}
              onBlur={() =>
                setResultValue((rv) =>
                  rv.trim().length === 0
                    ? rv
                    : Number(rv.replaceAll(decimalSeparator, "."))
                        .toFixed(2)
                        .replaceAll(".", decimalSeparator)
                )
              }
            />
            <GreaterThanLessThanNumpad
              greaterThanEnabled={
                qualifierType === QualifierTypeEnum.GREATERTHAN
              }
              lessThanEnabled={qualifierType === QualifierTypeEnum.LESSTHAN}
              onGreaterThanPressed={() =>
                setQualifierType((qual) =>
                  qual === QualifierTypeEnum.GREATERTHAN
                    ? QualifierTypeEnum.EQUALITY
                    : QualifierTypeEnum.GREATERTHAN
                )
              }
              onLessThanPressed={() =>
                setQualifierType((qual) =>
                  qual === QualifierTypeEnum.LESSTHAN
                    ? QualifierTypeEnum.EQUALITY
                    : QualifierTypeEnum.LESSTHAN
                )
              }
              keyboardProps={{
                zIndex: 1,
                additionalKeyboardOptions: { layoutName: "withDecimal" },
              }}
            />
          </EntryContainer>
        </Content>
        {props.onCancelRun != null && (
          <CancelRunContainer>
            <Button
              buttonType="link"
              leftIcon="delete"
              onClick={props.onCancelRun}
            >
              {t("inProcess.analyzerRun.buttons.cancelRun")}
            </Button>
          </CancelRunContainer>
        )}
      </PageContainer>
    </Root>
  );
}
