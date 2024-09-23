import { ReactNode } from "react";
import {
  PageContent,
  PageRightPanel,
  PageRightPanelButtonContainer,
  PageRoot,
} from "../components/layout/common-layout-components";

interface SidebarPageLayoutProps {
  className?: string;
  "data-testid"?: string;

  mainContent?: ReactNode;
  sidebarContent?: ReactNode;
  sidebarButtons?: ReactNode;
}

function SidebarPageLayout(props: SidebarPageLayoutProps) {
  return (
    <PageRoot className={props.className} data-testid={props["data-testid"]}>
      <PageContent className="main-content">{props.mainContent}</PageContent>
      <PageRightPanel className="sidebar">
        {props.sidebarContent ? (
          props.sidebarContent
        ) : (
          <PageRightPanelButtonContainer className="sidebar-buttons">
            {props.sidebarButtons ? props.sidebarButtons : null}
          </PageRightPanelButtonContainer>
        )}
      </PageRightPanel>
    </PageRoot>
  );
}

export type { SidebarPageLayoutProps };
export { SidebarPageLayout };
