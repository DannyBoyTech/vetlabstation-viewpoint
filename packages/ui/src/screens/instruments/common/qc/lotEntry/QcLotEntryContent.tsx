import styled from "styled-components";
import { Theme } from "../../../../../utils/StyleConstants";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ViewpointKeyboard } from "../../../../../components/keyboard/ViewpointKeyboard";
import { SpotText } from "@viewpoint/spot-react";
import classNames from "classnames";

const LotEntryRoot = styled.div`
  width: 700px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EntrySection = styled.div`
  display: flex;
  flex: 1;
  gap: 50px;
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .spot-form__field-error {
    margin: 0px;
  }
`;

const SummaryBox = styled(Section)`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  border-radius: 5px;
  padding: 10px;
`;

interface QcLotEntryContentProps {
  className?: string;
  "data-testid"?: string;

  promptContent: ReactNode;
  inputContent: ReactNode;
  summaryContent: ReactNode;
}

function QcLotEntryContent(props: QcLotEntryContentProps) {
  const { t } = useTranslation();
  const classes = classNames(props.className, "qc-lot-entry-content");

  return (
    <LotEntryRoot className={classes} data-testid={props["data-testid"]}>
      <div>{props.promptContent}</div>

      <EntrySection>
        <SummaryBox>
          <SpotText level="paragraph">
            {t("instrumentScreens.common.qc.lotEntry.barcodesHeader")}
          </SpotText>
          {props.summaryContent}
        </SummaryBox>

        <Section>
          {props.inputContent}
          <ViewpointKeyboard alwaysVisible keyboardType="numpad" />
        </Section>
      </EntrySection>
    </LotEntryRoot>
  );
}

export type { QcLotEntryContentProps };
export { QcLotEntryContent };
