import { Trans, useTranslation } from "react-i18next";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import styled from "styled-components";
import { UpgradeMedium } from "@viewpoint/api";
import { Button, Modal, SpotText } from "@viewpoint/spot-react";

const MediumSelectorBody = styled.div`
  ul {
    margin: 0;
    padding: 0;
  }
`;

export const TestId = {
  MediumSelector: "upgrade-medium-selector-modal",
  MediumButton: (medium: UpgradeMedium) => `upgrade-medium-${medium}-button`,
};

interface MediumSelectorProps {
  open: boolean;
  availableMediums: UpgradeMedium[];
  onClose: () => void;
  onMediumSelected: (medium: UpgradeMedium) => void;
}

export function UpgradeMediumSelector(props: MediumSelectorProps) {
  const { t } = useTranslation();
  return (
    <BasicModal
      open={true}
      onClose={props.onClose}
      headerContent={
        <SpotText level="h3">{t("upgrades.upgradeAvailable.title")}</SpotText>
      }
      bodyContent={
        <MediumSelectorBody data-testid={TestId.MediumSelector}>
          <ul>
            {props.availableMediums.map((medium) => (
              <li key={medium}>
                <Trans
                  i18nKey={
                    `upgrades.upgradeAvailable.instructions.${medium}` as any
                  }
                />
              </li>
            ))}
          </ul>
        </MediumSelectorBody>
      }
      footerContent={
        <>
          <Modal.FooterCancelButton onClick={props.onClose}>
            {t("general.buttons.cancel")}
          </Modal.FooterCancelButton>

          {props.availableMediums.map((medium) => (
            <Button
              key={medium}
              data-testid={TestId.MediumButton(medium)}
              onClick={() => props.onMediumSelected(medium)}
            >
              {t(`upgrades.upgradeAvailable.buttons.${medium}` as any)}
            </Button>
          ))}
        </>
      }
    />
  );
}
