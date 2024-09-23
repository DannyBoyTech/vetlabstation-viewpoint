import { ServiceCategory } from "@viewpoint/api";
import styled from "styled-components";
import { Button, SpotText } from "@viewpoint/spot-react";
import { ServiceCategoryColors, ServiceCategoryImages } from "../result-utils";
import { useTranslation } from "react-i18next";
import { SpotIcon } from "@viewpoint/spot-icons";
import { SpotTokens } from "../../../utils/StyleConstants";

export const TestId = {
  ServiceCategoryHeader: (serviceCategory: string) =>
    `service-category-header-${serviceCategory}`,
};

const ServiceCategoryRoot = styled.div<{ $serviceCategory: ServiceCategory }>`
  display: flex;
  align-items: center;
  gap: ${SpotTokens.space.s};
  overflow: hidden;

  > .spot-typography__heading--level-4 {
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgb(${(p) => ServiceCategoryColors[p.$serviceCategory].join(", ")});
  }
`;
const ServiceCategoryImg = styled.img`
  width: 24px;
  height: 24px;
`;

const CollapseContainer = styled.div`
  display: flex;
  align-items: center;

  > .spot-icon {
    fill: ${(p) => p.theme.colors?.interactive?.primary};
  }

  > .spot-icon:active {
    opacity: 0.5;
  }
`;

export function ServiceCategoryHeader(props: ServiceCategoryHeaderProps) {
  const { t } = useTranslation();
  return (
    <ServiceCategoryRoot
      data-testid={TestId.ServiceCategoryHeader(props.serviceCategory)}
      onClick={props.onToggleExpanded}
      $serviceCategory={props.serviceCategory}
    >
      <CollapseContainer>
        <SpotIcon name={props.expanded ? "collapse" : "expand"} />
      </CollapseContainer>
      <ServiceCategoryImg src={ServiceCategoryImages[props.serviceCategory]} />
      <SpotText level="h4">
        {t(`ServiceCategory.${props.serviceCategory}`)}
      </SpotText>
    </ServiceCategoryRoot>
  );
}

export interface ServiceCategoryHeaderProps {
  serviceCategory: ServiceCategory;
  expanded: boolean;
  onToggleExpanded: () => void;
}
