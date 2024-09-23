import { Pill } from "@viewpoint/spot-react";
import styled from "styled-components";
import {
  LocalStorageKey,
  useLocalStorageData,
} from "../../context/LocalStorageContext";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { usePrevious } from "../../utils/hooks/hooks";
import { useState } from "react";
import { WelcomeModal } from "../../screens/home/welcome/WelcomeModal";
import { nltxAttr, NltxIds } from "../../analytics/nltx-ids";

const StyledPill = styled(Pill)`
  transition: opacity 0.3s ease-in-out;

  &.spot-pill--interactive:active&.spot-pill--interactive:active,
  &.spot-pill--interactive:hover&.spot-pill--interactive:hover {
    background-color: ${(p) => p.theme.colors?.background?.primary};
    border-color: ${(p) => p.theme.colors?.text?.primary};
  }

  &.hidden {
    opacity: 0;
    pointer-events: none;
  }

  &.blinking {
    opacity: 1;
    animation: blink-tutorial-pill 600ms infinite;
    animation-iteration-count: 5;

    @keyframes blink-tutorial-pill {
      50% {
        background-color: ${(p) => p.theme.colors?.interactive?.hoverSecondary};
      }
    }
  }

  &.visible {
    opacity: 1;
  }

  // Override the .spot-header.spot-pill rule in SPOT that sets height/width
  // to 20x20 px

  > .spot-icon.spot-pill__icon {
    height: 12px;
    width: 12px;
  }
`;

export function TutorialPill() {
  const [welcomeTutorialOpen, setWelcomeTutorialOpen] = useState(false);
  const { data: welcomeScreenShown } = useLocalStorageData(
    LocalStorageKey.WelcomeScreenShown
  );
  const { t } = useTranslation();

  const prevWelcomeScreenShown = usePrevious(welcomeScreenShown);

  const className = classNames({
    visible: welcomeScreenShown,
    hidden: !welcomeScreenShown,
    // Only animate when the original welcome screen is closed
    blinking: welcomeScreenShown && !prevWelcomeScreenShown,
  });

  return (
    <>
      <StyledPill
        {...nltxAttr(NltxIds.TutorialButton)}
        className={className}
        leftIcon="video"
        level="primary"
        interactive
        outline
        onClick={() => setWelcomeTutorialOpen(true)}
      >
        {t("header.tutorial.label")}
      </StyledPill>
      {welcomeTutorialOpen && (
        <WelcomeModal
          dismissable
          open={welcomeTutorialOpen}
          onClose={() => setWelcomeTutorialOpen(false)}
        />
      )}
    </>
  );
}
