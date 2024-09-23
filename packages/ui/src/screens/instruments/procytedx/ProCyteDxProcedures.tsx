import { SpotText, SystemMessage } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "../../../components/Link";
import { SpotPopover } from "../../../components/popover/Popover";
import { useRef, useState } from "react";
import { FullSizeSpinner } from "../../../components/spinner/FullSizeSpinner";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  .spot-message,
  .message--content {
    overflow: hidden;
  }
`;

const ProcedureContainer = styled.div`
  position: relative;
`;

const SpinnerContainer = styled.div`
  position: absolute;
  inset: 0 0 0 0;
  z-index: 1;
`;

export const TestId = {
  ProceduresRoot: "pdx-procedures-root",
  Procedure: (key: string) => `pdx-procedure-${key}`,
  ViewAllLink: "pdx-procedures-view-all-link",
  ViewAllPopover: "pdx-procedures-popover",
  LoadingSpinner: "pdx-procedures-loading-spinner",
};

export interface ProCyteDxProceduresProps {
  reminderKeys?: string[];
  loading: boolean;
}

export function ProCyteDxProcedures(props: ProCyteDxProceduresProps) {
  const { t } = useTranslation();
  return (
    <Root data-testid={TestId.ProceduresRoot}>
      <SpotText level="h4">
        {t("instrumentScreens.proCyteDx.labels.procedures")}
      </SpotText>
      <ProcedureContainer>
        {props.loading && (
          <SpinnerContainer data-testid={TestId.LoadingSpinner}>
            <FullSizeSpinner />
          </SpinnerContainer>
        )}
        {props.reminderKeys == null || props.reminderKeys.length === 0 ? (
          <NoProcedures />
        ) : (
          <Procedures reminderKeys={props.reminderKeys} />
        )}
      </ProcedureContainer>
    </Root>
  );
}

function NoProcedures() {
  const { t } = useTranslation();
  return (
    <SystemMessage alertLevel="default" icon="checkmark">
      <SpotText level="secondary" bold>
        {t("instrumentScreens.proCyteDx.labels.upToDate")}
      </SpotText>
    </SystemMessage>
  );
}

interface ProceduresProps {
  reminderKeys: string[];
}

const EllipsizedText = styled(SpotText)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledList = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

function Procedures(props: ProceduresProps) {
  const [anchor, setAnchor] = useState<HTMLElement>();
  const previewRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const hasOverflowed =
    previewRef.current != null &&
    previewRef.current!.scrollWidth > previewRef.current!.offsetWidth;

  return (
    <SystemMessage alertLevel="danger" icon="alert-notification">
      <EllipsizedText level="secondary" ref={previewRef}>
        {props.reminderKeys.map((key) => (
          <span data-testid={TestId.Procedure(key)} key={key}>
            <Trans i18nKey={key as any} />
            &nbsp;
          </span>
        ))}
      </EllipsizedText>
      {hasOverflowed && (
        <Link
          to={"#"}
          data-testid={TestId.ViewAllLink}
          onClick={(ev) =>
            setAnchor(anchor == null ? ev.currentTarget : undefined)
          }
        >
          {t("instrumentScreens.proCyteDx.buttons.viewAll")}
        </Link>
      )}

      <SpotPopover
        offsetTo="right"
        anchor={anchor}
        onClickAway={() => setAnchor(undefined)}
        popFrom="bottom"
      >
        <StyledList data-testid={TestId.ViewAllPopover}>
          {props.reminderKeys.map((key) => (
            <li key={key}>
              <EllipsizedText level="secondary">
                <Trans
                  i18nKey={key as any}
                  key={key}
                  data-testid={TestId.Procedure(key)}
                />
              </EllipsizedText>
            </li>
          ))}
        </StyledList>
      </SpotPopover>
    </SystemMessage>
  );
}
