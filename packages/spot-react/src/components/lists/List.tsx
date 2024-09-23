import React, { HTMLAttributes, MouseEventHandler } from "react";
import classNames from "classnames";
import { SpotIconName } from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";
import { SpotIcon } from "@viewpoint/spot-icons";
import styled from "styled-components";

const NonSpotIcon = styled.img`
  height: 16px;
  width: 16px;
  margin: 0 8px 0 0;
  display: flex;
  justify-content: center;
`;

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  nested?: boolean;
  prominent?: boolean;
  expanded?: boolean;
}

const List = ({
  className,
  prominent,
  nested,
  expanded,
  ...props
}: ListProps) => {
  const listClasses = classNames(
    {
      "spot-list-group": !nested,
      "spot-list-group__sublist": nested,
      "spot-list-group--interactive": prominent,
      "spot-list-group--expanded": expanded,
    },
    className
  );
  return (
    <ul className={listClasses} {...props}>
      {props.children}
    </ul>
  );
};

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  nested?: boolean;
  active?: boolean;
  onClick?: MouseEventHandler;
  iconName?: SpotIconName;
  customIcon?: string;
  separator?: boolean;
}

const Item = ({
  className,
  separator,
  iconName,
  customIcon,
  nested,
  onClick,
  active,
  ...props
}: ListItemProps) => {
  const listItemClasses = classNames(
    {
      "spot-list-group__item": true,
      "spot-list-group__item--active": active,
      "spot-list-group__item--separator-before": separator,
      "spot-list-group__item--sublist": nested,
    },
    className
  );
  const innerDivClasses = classNames({
    "spot-list-group__link": true,
    "spot-list-group__link--child": nested,
  });
  const innerSpanClasses = classNames({
    "spot-list-group__item-label": true,
  });

  const cursorStyle =
    typeof onClick !== "undefined" ? { cursor: "pointer" } : {};

  return (
    <li
      className={listItemClasses}
      {...props}
      onClick={onClick}
      style={cursorStyle}
    >
      <div className={innerDivClasses}>
        {iconName ? (
          <SpotIcon name={iconName} className="spot-list-group__item-icon" />
        ) : customIcon ? (
          <NonSpotIcon src={customIcon} />
        ) : undefined}
        <span className={innerSpanClasses}>{props.children}</span>
      </div>
    </li>
  );
};

export interface ListItemHeaderProps extends HTMLAttributes<HTMLLIElement> {
  iconName?: SpotIconName;
}

const Header = ({
  iconName,
  className,
  onClick,
  ...props
}: ListItemHeaderProps) => {
  const listItemClasses = classNames(
    {
      "spot-list-group__item": true,
      "spot-list-group__item--header": true,
    },
    className
  );
  const innerSpanClasses = classNames({
    "spot-list-group__header": true,
  });

  const cursorStyle =
    typeof onClick !== "undefined" ? { cursor: "pointer" } : {};

  return (
    <li
      className={listItemClasses}
      {...props}
      onClick={onClick}
      style={cursorStyle}
    >
      <span className={innerSpanClasses}>
        {iconName && (
          <SpotIcon name={iconName} className="spot-list-group__item-icon" />
        )}
        {props.children}
      </span>
    </li>
  );
};

List.Item = Item;
List.Header = Header;

export default List;
