import { SpotIcon } from "@viewpoint/spot-icons";
import {
  Header as SpotHeader,
  NavItem,
  NavItems,
  ProductName,
} from "@viewpoint/spot-react";
import styled from "styled-components";
import classnames from "classnames";
import { SpotIconName } from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";
import { NavDropDown } from "./NavDropDown";
import { useContext, useEffect, useState } from "react";
import { Link } from "../Link";
import { To, useNavigate } from "react-router-dom";
import { ViewpointThemeContext } from "../../context/ThemeContext";
import { Theme } from "../../utils/StyleConstants";
import { ViewpointHeaderContext } from "../../context/HeaderContext";
import { useFormatTime12h } from "../../utils/hooks/datetime";
import { SmartServiceIndicator } from "./SmartServiceIndicator";
import { MessagesNavItem } from "./MessagesIndicator";
import { AlertNavItem } from "./AlertIndicator";
import classNames from "classnames";
import { TutorialPill } from "./TutorialPill";

export const TestId = {
  HeaderLeft: "header-left",
};

const StyledNavItems = styled(NavItems)`
  gap: 25px;
`;

// When the draggable class is added to this item, the window can be dragged by
// clicking and dragging it. This should only be enabled in development mode.
const DraggableNavItem = styled(NavItem)`
  &.draggable {
    -webkit-app-region: drag;
  }
`;

export interface HeaderProps {
  className?: string;
}

const CustomizedSpotHeader = (props: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState<string>();
  const { theme } = useContext(ViewpointThemeContext);
  const { titleProps, searchIconHidden } = useContext(ViewpointHeaderContext);

  const formatTime = useFormatTime12h();
  const nav = useNavigate();

  const classes = classnames(props.className);

  useEffect(() => {
    setCurrentTime(formatTime(Date.now()));
    const interval = setInterval(
      () => setCurrentTime(formatTime(Date.now())),
      500
    );
    return () => clearInterval(interval);
  }, [formatTime]);

  const mergedLeftProps =
    titleProps == null
      ? DefaultHeaderTitle
      : { ...DefaultHeaderTitlesProps, ...titleProps };

  return (
    <SpotHeader
      className={classes}
      headerType="normal"
      leftAligned={true}
      fluid={true}
      leftContent={
        <StyledNavItems>
          <HeaderTitle
            data-testid={TestId.HeaderLeft}
            theme={theme}
            {...mergedLeftProps}
          />
          <TutorialPill />
        </StyledNavItems>
      }
      centerContent={<></>}
      rightContent={
        <>
          <StyledNavItems>
            {!searchIconHidden && (
              <NavItem onClick={() => nav("/patientSearch")}>
                <SpotIcon
                  name="search"
                  size={20}
                  color={theme.colors?.text?.primary}
                />
              </NavItem>
            )}

            <AlertNavItem />

            <MessagesNavItem />

            <SmartServiceIndicator />

            <NavItem>
              <NavDropDown />
            </NavItem>

            <DraggableNavItem
              className={classNames({
                // Enable using the system time to drag the app window when in
                // development mode
                draggable: window.main?.getEnv() === "development",
              })}
            >
              {currentTime}
            </DraggableNavItem>
          </StyledNavItems>
        </>
      }
    />
  );
};

export interface HeaderTitleProps {
  theme: Theme;
  label: string;
  to: To | number;
  iconName?: SpotIconName | "None";
  iconColor?: string;
  useProductName?: boolean;
  "data-testid"?: string;
}

const HeaderTitle = (props: HeaderTitleProps) => {
  const { theme } = useContext(ViewpointThemeContext);
  return (
    <Link
      to={props.to}
      style={{ color: theme.colors?.text?.secondary }}
      data-testid={props["data-testid"]}
    >
      {props.iconName && props.iconName !== "None" && (
        <SpotIcon
          name={props.iconName}
          size={25}
          style={{ marginRight: 10 }}
          color={props.iconColor ?? theme.colors?.interactive?.primary}
        />
      )}
      {props.useProductName ? (
        <ProductName>{props.label}</ProductName>
      ) : (
        <>{props.label}</>
      )}
    </Link>
  );
};

export const DefaultHeaderTitle: Omit<HeaderTitleProps, "theme"> =
  Object.freeze({
    label: "VetLab Station",
    to: "/",
    useProductName: true,
    iconName: "home",
  });

const DefaultHeaderTitlesProps: Omit<HeaderTitleProps, "theme"> = {
  to: "/",
  label: "IDEXX VetLab Station",
  iconName: "home",
};

export const Header = styled(CustomizedSpotHeader)`
  /* override (broken?) spot small dot badge styling in header */

  .spot-badge.spot-badge--small.spot-badge--dot {
    height: 12px;
    width: 12px;
  }
`;
