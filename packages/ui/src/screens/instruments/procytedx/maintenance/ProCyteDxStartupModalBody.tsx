import { SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { InlineText } from "../../../../components/typography/InlineText";

const i18nKey = (name: string): any =>
  `instrumentScreens.proCyteDx.startupConfirmModal.${name}`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const RequirementsSection = styled.div`
  ul {
    margin: 0;
    padding-left: 25px;
  }
`;

const StepsSection = styled.div`
  .step {
    margin-left: 10px;
  }
`;

const DurationWarning = () => {
  const { t } = useTranslation();
  return (
    <SpotText className="duration" level="paragraph" bold>
      {t("general.messages.actionWillTakeApproximatelyDuration", {
        action: t("general.ThisProcedure"),
        duration: t("general.duration.minute", { count: 45 }),
      })}
    </SpotText>
  );
};

const Caption = (props: { keyFragment: string }) => {
  const { t } = useTranslation();
  return (
    <SpotText className="caption" level="paragraph">
      {t(i18nKey(props.keyFragment))}
    </SpotText>
  );
};

const Requirement = (props: { keyFragment: string }) => {
  const { t } = useTranslation();
  return (
    <li>
      <InlineText className="requirement" level="paragraph">
        {t(i18nKey(props.keyFragment))}
      </InlineText>
    </li>
  );
};

const components = {
  strong: <InlineText level="paragraph" bold />,
} as const;

const Step = (props: { keyFragment: string }) => {
  return (
    <SpotText className="step" level="paragraph">
      <Trans i18nKey={i18nKey(props.keyFragment)} components={components} />
    </SpotText>
  );
};

function ProCyteDxStartupModalBody() {
  return (
    <Root>
      <DurationWarning />

      <RequirementsSection>
        <Caption keyFragment="youMustHave" />
        <ul>
          <Requirement keyFragment="aFullReagentKit" />
          <Requirement keyFragment="aFullStainPack" />
          <Requirement keyFragment="aQuickConnector" />
        </ul>
      </RequirementsSection>

      <StepsSection>
        <Caption keyFragment="followTheseSteps" />
        <Step keyFragment="attachQuickConnectorTop" />
        <Step keyFragment="attachQuickConnectorLines" />
        <Step keyFragment="installStainPack" />
        <Step keyFragment="tapInitiateStartup" />
      </StepsSection>
    </Root>
  );
}

export { ProCyteDxStartupModalBody };
