import React, { HTMLProps, useContext, useState } from "react";
import styled from "styled-components";
import { SpotPopover } from "../popover/Popover";
import { useTranslation } from "react-i18next";
import { List, Modal, SpotText, Button } from "@viewpoint/spot-react";
import {
  SpotIcon,
  SpotIconName,
} from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";
import { useNavigate } from "react-router-dom";
import { BasicModal } from "../basic-modal/BasicModal";
import {
  useRequestSystemRestartMutation,
  useRequestSystemShutdownMutation,
} from "../../api/SystemInfoApi";
import InstrumentIcon from "../../assets/header/Instruments.svg";
import { ViewpointThemeContext } from "../../context/ThemeContext";

export const TestId = {
  Button: "nav-dropdown-button",
  Dropdown: "nav-popover",
};

const NavDropDownRoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PopoverWrapper = styled.div`
  display: contents;

  .spot-popover {
    padding: 8px;
  }
`;

const StyledSpotList = styled(List)`
  .spot-list-group__item-label {
    white-space: nowrap;
  }

  .icon {
    width: 16px;
    height: 16px;
  }
`;

interface NavDropDownProps extends HTMLProps<any> {
  iconName?: SpotIconName;
  className?: string;
}

export const NavDropDown = ({ iconName }: NavDropDownProps) => {
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(
    null
  );
  const [powerDownModalOpen, setPowerDownModalOpen] = useState(false);
  const { theme } = useContext(ViewpointThemeContext);

  const { t } = useTranslation();
  const closePopover = () => setAnchorElement(null);

  const nav = useNavigate();

  const [powerDown] = useRequestSystemShutdownMutation();
  const [restart] = useRequestSystemRestartMutation();

  const goTo = (page: string) => {
    closePopover();
    nav(page);
  };

  return (
    <>
      <NavDropDownRoot
        data-testid="nav-dropdown-button"
        onClick={(event) => {
          setAnchorElement(anchorElement == null ? event.currentTarget : null);
        }}
      >
        <SpotIcon
          name={iconName ?? "settings"}
          size={20}
          color={theme.colors?.text?.primary}
        />
      </NavDropDownRoot>

      <PopoverWrapper>
        <SpotPopover
          anchor={anchorElement}
          onClickAway={closePopover}
          popFrom="bottom"
          offsetTo="left"
          gap={5}
        >
          <StyledSpotList expanded data-testid={TestId.Dropdown}>
            <List.Item
              customIcon={InstrumentIcon}
              onClick={() => goTo("/instruments")}
            >
              {t("header.navigation.instruments")}
            </List.Item>
            <List.Item iconName="settings" onClick={() => goTo("/settings")}>
              {t("header.navigation.settings")}
            </List.Item>
            <List.Item iconName="help-2" onClick={() => goTo("/help")}>
              {t("header.navigation.help")}
            </List.Item>
            <List.Item iconName="email" onClick={() => goTo("/messages")}>
              {t("header.navigation.messages")}
            </List.Item>
            <List.Item
              iconName="power"
              onClick={() => {
                closePopover();
                setPowerDownModalOpen(true);
              }}
            >
              {t("header.navigation.powerDown")}
            </List.Item>
          </StyledSpotList>
        </SpotPopover>
      </PopoverWrapper>

      {powerDownModalOpen && (
        <BasicModal
          open={true}
          onClose={() => setPowerDownModalOpen(false)}
          bodyContent={t("header.powerDownModal.body")}
          headerContent={
            <SpotText level="h3">{t("header.powerDownModal.title")}</SpotText>
          }
          footerContent={
            <>
              <Modal.FooterCancelButton
                onClick={() => setPowerDownModalOpen(false)}
              >
                {t("general.buttons.cancel")}
              </Modal.FooterCancelButton>
              <Button
                onClick={() => {
                  setPowerDownModalOpen(false);
                  powerDown();
                }}
              >
                {t("header.powerDownModal.buttons.powerDown")}
              </Button>
              <Button
                onClick={() => {
                  setPowerDownModalOpen(false);
                  restart();
                }}
              >
                {t("header.powerDownModal.buttons.restart")}
              </Button>
            </>
          }
        />
      )}
    </>
  );
};
