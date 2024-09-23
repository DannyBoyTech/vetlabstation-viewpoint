import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { BasicModal } from "../../components/basic-modal/BasicModal";
import { ResponsiveModalWrapper } from "../../components/modal/ResponsiveModalWrapper";
import { Button } from "@viewpoint/spot-react";
import {
  useGetSystemInfoQuery,
  useRequestSystemShutdownMutation,
} from "../../api/SystemInfoApi";
import { Theme } from "../../utils/StyleConstants";
import { SpotText } from "@viewpoint/spot-react/src";
import {
  FirstBootEulaType,
  useGetFirstBootEulaQuery,
} from "../../api/ServerResourceApi";
import { skipToken } from "@reduxjs/toolkit/query";

const RightAlignedButton = styled(Button)`
  && {
    margin-left: auto;
  }
`;

interface FirstBootEulaModalProps {
  open: boolean;
  onNext: () => void;
}

export function FirstBootEulaModal(props: FirstBootEulaModalProps) {
  const { t } = useTranslation();
  const [shutdown] = useRequestSystemShutdownMutation();

  return (
    <ResponsiveModalWrapper>
      <BasicModal
        dismissable={false}
        open={props.open}
        onClose={props.onNext}
        bodyContent={<EulaModalBody />}
        footerContent={
          <>
            <RightAlignedButton
              buttonType="secondary"
              onClick={() => shutdown()}
            >
              {t("eula.common.buttons.disagree")}
            </RightAlignedButton>

            <Button onClick={props.onNext}>
              {t("eula.common.buttons.agree")}
            </Button>
          </>
        }
      />
    </ResponsiveModalWrapper>
  );
}

const Root = styled.div`
  width: 80vw;
  height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Content = styled.p`
  background-color: ${(t: { theme: Theme }) =>
    t.theme.colors?.background?.secondary};
  padding: 20px;
  white-space: pre-line;
  overflow-y: auto;
  flex: 1;
`;

function EulaModalBody() {
  const { t } = useTranslation();
  const { data: system } = useGetSystemInfoQuery();
  const { data: eulaContent } = useGetFirstBootEulaQuery(
    (system?.windowsEulaType as FirstBootEulaType) ?? skipToken
  );
  return (
    <Root>
      <SpotText level={"h3"}>{t("eula.common.header.microsoft")}</SpotText>
      <SpotText level={"paragraph"} bold>
        {t("eula.common.instructions")}
      </SpotText>
      <Content>{eulaContent}</Content>
    </Root>
  );
}
