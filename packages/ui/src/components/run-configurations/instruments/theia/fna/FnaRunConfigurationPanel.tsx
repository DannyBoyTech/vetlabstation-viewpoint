import { Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const Root = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px;
  width: 100%;
`;

export interface FnaRunConfigurationPanelProps {
  onEdit: () => void;
}

export function FnaRunConfigurationPanel(props: FnaRunConfigurationPanelProps) {
  const { t } = useTranslation();
  return (
    <Root>
      <Button buttonType="secondary" onClick={props.onEdit}>
        {t("orderFulfillment.runConfig.inVueDx.fna.edit")}
      </Button>
    </Root>
  );
}
