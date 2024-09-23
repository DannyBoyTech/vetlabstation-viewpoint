import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import { SpotText } from "@viewpoint/spot-react";
import { SpotTextProps } from "@viewpoint/spot-react/src/components/typography/Typography";

export interface PageTitleProps extends Omit<SpotTextProps, "level"> {
  className?: string;
  "data-testid"?: string;
}

const PageTitleText = styled(SpotText)`
  margin-bottom: 16px;
`;

export const PageTitle = (props: PageTitleProps) => {
  return <PageTitleText {...props} level="h3" />;
};

export interface SectionTitleProps extends Omit<SpotTextProps, "level"> {
  className?: string;
  "data-testid"?: string;
}

export const SectionTitle = (props: SectionTitleProps) => {
  return <SpotText {...props} level="paragraph" bold />;
};

export const Sections = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  gap: 16px;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Columns = styled.div`
  display: flex;
  gap: 30px;
`;

export const Column = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
`;

export const SelectContainer = styled.div`
  display: flex;
  gap: 5px;
`;

export const SettingsPageRoot = styled.div`
  display: flex;
  flex: 1;

  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
`;

export const SettingsPageContent = styled.div`
  flex: auto;
  margin: 30px;
  padding: 20px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
`;

export const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;

export enum SettingsCategory {
  SMART_SERVICE = "SMART_SERVICE",
  LANGUAGE = "LANGUAGE",
  REPORTS = "REPORTS",
  TIME_DATE = "TIME_DATE",
  UNITS = "UNITS",
  PRINTING = "PRINTING",
  ALERTS_NOTIFICATIONS = "ALERTS_NOTIFICATIONS",
  PRACTICE_INFO = "PRACTICE_INFO",
  DISPLAY = "DISPLAY",
  PRACTICE_MANAGEMENT = "PRACTICE_MANAGEMENT",
  VET_CONNECT_PLUS = "VET_CONNECT_PLUS",
}

export const OrderedCategories: SettingsCategory[] = [
  SettingsCategory.SMART_SERVICE,
  SettingsCategory.VET_CONNECT_PLUS,
  SettingsCategory.PRACTICE_MANAGEMENT,
  SettingsCategory.ALERTS_NOTIFICATIONS,
  SettingsCategory.DISPLAY,
  SettingsCategory.LANGUAGE,
  SettingsCategory.PRACTICE_INFO,
  SettingsCategory.PRINTING,
  SettingsCategory.REPORTS,
  SettingsCategory.TIME_DATE,
  SettingsCategory.UNITS,
];
