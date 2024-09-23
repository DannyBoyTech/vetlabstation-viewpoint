import { SpotText, Button } from "@viewpoint/spot-react";
import { ButtonProps } from "@viewpoint/spot-react/src/components/button/Button";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 0 4px;
`;

export const TestId = {
  NextButton: "paginator-next-button",
  BackButton: "paginator-back-button",
};

interface PaginatorProps {
  size?: ButtonProps["buttonSize"];
  currentPage: number;
  totalPages: number;
  onPageBack: () => void;
  onPageForward: () => void;
}

export function Paginator(props: PaginatorProps) {
  const { t } = useTranslation();
  return (
    <PaginationContainer>
      <Button
        buttonType="link"
        buttonSize={props.size}
        iconOnly
        leftIcon="previous"
        disabled={props.currentPage === 0}
        onClick={props.onPageBack}
        data-testid={TestId.BackButton}
      />
      <SpotText
        level={
          props.size === "large"
            ? "h3"
            : props.size === "small"
            ? "tertiary"
            : "paragraph"
        }
      >
        {t("imageViewer.labels.paginator", {
          totalPages: props.totalPages,
          currentPage: props.currentPage + 1,
        })}
      </SpotText>
      <Button
        buttonType="link"
        buttonSize={props.size}
        iconOnly
        leftIcon="next"
        disabled={props.currentPage === props.totalPages - 1}
        onClick={props.onPageForward}
        data-testid={TestId.NextButton}
      />
    </PaginationContainer>
  );
}
