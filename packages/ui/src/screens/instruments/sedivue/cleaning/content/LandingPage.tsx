import { useContext } from "react";
import { ViewpointThemeContext } from "../../../../../context/ThemeContext";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import styled from "styled-components";
import { Theme } from "../../../../../utils/StyleConstants";
import { SpotText } from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";

const ListItemComponents = {
  ul: <ul />,
  li: <li />,
};
const LandingPageRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;

  ul {
    padding-inline-start: 25px;
    margin: unset;
  }

  li {
    margin: 5px 0;
  }
`;
const Columns = styled.div`
  display: flex;
  height: 100%;
  gap: 50px;
  padding: 30px;
`;
const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
`;

interface LandingPageProps {
  halfDoor?: boolean;
}

export function LandingPage(props: LandingPageProps) {
  const { theme } = useContext(ViewpointThemeContext);

  return (
    <LandingPageRoot>
      <SpotText level="paragraph">
        <Trans
          i18nKey={"instrumentScreens.sediVueDx.cleaningWizard.Landing.notes"}
          components={{ ...CommonTransComponents, ...ListItemComponents }}
        />
      </SpotText>
      <Columns>
        <Column>
          <SpotIcon
            name={"clipboard"}
            size={100}
            color={theme.colors?.feedback?.success}
          />
        </Column>
        <Column>
          <SpotText level="paragraph" bold>
            <Trans
              i18nKey={
                "instrumentScreens.sediVueDx.cleaningWizard.Landing.recommends"
              }
              components={{ ...CommonTransComponents, ...ListItemComponents }}
            />
          </SpotText>

          <Trans
            i18nKey={`instrumentScreens.sediVueDx.cleaningWizard.Landing.${
              props.halfDoor ? "halfDoor" : "fullDoor"
            }.list`}
            components={{ ...CommonTransComponents, ...ListItemComponents }}
          />
        </Column>
      </Columns>
    </LandingPageRoot>
  );
}
