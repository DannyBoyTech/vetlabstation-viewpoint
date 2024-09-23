import { SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";

export const DiagnosticsSectionContainer = styled.div`
  flex: 0 0 100%;

  display: flex;
  flex-flow: column wrap;

  height: 75vh; /* constrain height to wrap */

  gap: 16px;
`;
DiagnosticsSectionContainer.displayName = "SectionContainer";

export const DiagnosticsSection = styled.div`
  flex: 0 0 auto;

  ul {
    list-style: none;
    padding-inline-start: 20px;
  }

  li {
    margin: 16px 0px;
  }
`;
DiagnosticsSection.displayName = "Section";

export const DiagnosticsPageContentHeader = styled(SpotText)`
  flex: 0;
  margin-bottom: 30px;
`;
DiagnosticsPageContentHeader.displayName = "PageContentHeader";
