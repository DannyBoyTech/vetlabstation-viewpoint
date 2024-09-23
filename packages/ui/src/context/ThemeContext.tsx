import React, { ReactNode, useState } from "react";
import { DarkTheme, LightTheme, Theme } from "../utils/StyleConstants";

export interface ThemeContext {
  theme: Theme;
  setTheme: (t: Theme) => void;
  availableThemes: Theme[];
  windowWidth: number;
  windowHeight: number;
}

export interface ThemeProviderProps {
  defaultTheme: Theme;
  children: ReactNode;
}

export const ViewpointThemeContext = React.createContext<ThemeContext>(
  undefined as unknown as ThemeContext
);

/**
 * Theme provider. Holds the current them in context, providing a hook to update the current theme
 *
 * @param props {ThemeProviderProps}
 */
const ViewpointThemeProvider = (props: ThemeProviderProps) => {
  const [theme, setTheme] = React.useState(props.defaultTheme);
  const [windowWidth, setWindowWidth] = React.useState<number>(
    window.innerWidth
  );
  const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);

  const checkWindow = () => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
  };

  React.useLayoutEffect(() => {
    window.addEventListener("resize", checkWindow);
    checkWindow();
    return () => window.removeEventListener("resize", checkWindow);
  }, []);

  return (
    <ViewpointThemeContext.Provider
      value={{
        theme,
        setTheme,
        windowWidth,
        windowHeight,
        availableThemes: [DarkTheme, LightTheme],
      }}
    >
      {props.children}
    </ViewpointThemeContext.Provider>
  );
};

export default ViewpointThemeProvider;
