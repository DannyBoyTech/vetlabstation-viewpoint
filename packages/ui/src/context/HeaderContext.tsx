import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
import type { HeaderTitleProps } from "../components/header/Header";

export type PartialHeaderTitleProps = Partial<Omit<HeaderTitleProps, "theme">>;

export interface HeaderContext {
  titleProps?: PartialHeaderTitleProps;
  setTitleProps: (props?: PartialHeaderTitleProps) => void;
  searchIconHidden?: boolean;
  setSearchIconHidden: Dispatch<SetStateAction<boolean>>;
}

export interface HeaderContextProps {
  children?: ReactNode;
}

export const ViewpointHeaderContext = React.createContext<HeaderContext>(
  undefined as unknown as HeaderContext
);

/**
 * Theme provider. Holds the current them in context, providing a hook to update the current theme
 *
 * @param props {ThemeProviderProps}
 */
const ViewpointHeaderProvider = (props: HeaderContextProps) => {
  const [leftHeaderProps, setLeftHeaderProps] =
    useState<PartialHeaderTitleProps>();
  const [searchIconHidden, setSearchIconHidden] = useState(false);

  return (
    <ViewpointHeaderContext.Provider
      value={{
        titleProps: leftHeaderProps,
        setTitleProps: setLeftHeaderProps,
        searchIconHidden,
        setSearchIconHidden,
      }}
    >
      {props.children}
    </ViewpointHeaderContext.Provider>
  );
};

export default ViewpointHeaderProvider;
