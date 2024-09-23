import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Button, SpotText } from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { FullSizeSpinner } from "../spinner/FullSizeSpinner";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 36px;
  justify-content: center;
  align-items: center;
  margin-top: 64px;

  > .spot-icon {
    fill: ${(p) => p.theme.colors?.interactive?.primary};
  }
`;

export interface AddPatientSearchPlaceholderProps {
  onAddNewPatient: () => void;
  loading?: boolean;
  uninitialized?: boolean;
}

export function AddPatientSearchPlaceholder(
  props: AddPatientSearchPlaceholderProps
) {
  const { t } = useTranslation();
  if (props.loading) {
    return <FullSizeSpinner />;
  }
  return (
    <Root>
      <SpotText level="secondary" bold>
        {t(
          props.uninitialized
            ? "searchPatient.instructionsAddPatient"
            : "searchPatient.noResults"
        )}
      </SpotText>

      <SpotIcon name="clipboard-patient" size={70} />

      <Button
        buttonType="secondary"
        leftIcon="add"
        onClick={props.onAddNewPatient}
      >
        {t("searchPatient.addPatient")}
      </Button>
    </Root>
  );
}
