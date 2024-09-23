import styled from "styled-components";
import { DarkTheme, Theme } from "../../utils/StyleConstants";
import { List } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";

import { SettingsCategory } from "./common-settings-components";

const SideBarRoot = styled.div.attrs({
  className: DarkTheme.primaryContainerClass,
})`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 250px;
  height: 100%;
  padding-left: 10px;
  padding-top: 20px;
  background-color: ${DarkTheme.colors?.background?.primary};
`;

const StyledListItem = styled(List.Item)`
  justify-content: center;

  .spot-typography__text--body {
    color: ${(p: { theme: Theme }) =>
      p.theme.getOppositeTheme().colors?.borders?.control};
  }

  &.spot-list-group__item--active .spot-typography__text--body {
    color: ${(p: { theme: Theme }) =>
      p.theme.getOppositeTheme().colors?.text?.primary};
  }
`;

interface SideBarProps {
  items: SettingsCategory[];
  onSelected: (selection: string | number) => void;
  selectedOption: string | number;
}

export function LeftSideBar(props: SideBarProps) {
  return (
    <SideBarRoot>
      {props.items.map((category) => (
        <DefaultListItem
          key={category}
          item={category}
          active={props.selectedOption === category}
          onClick={() => props.onSelected(category)}
        />
      ))}
    </SideBarRoot>
  );
}

const DefaultListItem = ({
  item,
  active,
  onClick,
}: {
  item: SettingsCategory;
  active: boolean;
  onClick: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <StyledListItem active={active} onClick={onClick}>
      <div>{t(`settings.categories.${item}`)}</div>
    </StyledListItem>
  );
};
