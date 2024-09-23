import styled from "styled-components";
import {
  AngioDetectConsumable,
  AngioDetectConsumableProps,
} from "./AngioDetectConsumable";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";
import { ReactNode } from "react";
import { Theme } from "../../../utils/StyleConstants";

const PickerRoot = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  width: 521px;
  position: relative;
`;

const Selection = styled(SpotText)`
  &.selected {
    font-weight: bold;
    color: ${(p: { theme: Theme }) => p.theme.colors?.feedback?.error};
  }
`;

const LeaderLine = styled.div`
  flex: 1 1 initial;
  height: 1px;
  min-width: 20px;
  width: 47px;
  border: 0;
  border-bottom: 1px solid
    ${(p: { theme: Theme }) => p.theme.colors?.borders?.secondary};
`;

const RightLabelRoot = styled.div`
  display: flex;
  position: absolute;
  align-items: center;
  gap: 12px;
`;

interface RightLabelProps {
  className?: string;
  "data-testid"?: string;

  top?: string;
  left?: string;
  maxWidth?: string;
  children?: ReactNode;
}

function RightLabel(props: RightLabelProps) {
  return (
    <RightLabelRoot
      className={props.className}
      data-testid={props["data-testid"]}
    >
      <LeaderLine />
      {props.children}
    </RightLabelRoot>
  );
}

const ControlLabel = styled(RightLabel)`
  left: 345px;
  top: 142px;
  max-width: 175px;
`;

const AngioDetectLabel = styled(RightLabel)`
  left: 345px;
  top: 190px;
  max-width: 175px;
`;

const LabeledSelection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StyledConsumable = styled(AngioDetectConsumable)`
  width: 242px;
`;

export interface AngioDetectPickerProps extends AngioDetectConsumableProps {}

export function AngioDetectPicker(props: AngioDetectPickerProps) {
  const classes = classnames("angio-detect-picker", props.className);
  const { t } = useTranslation();

  return (
    <PickerRoot className={classes} data-testid={props["data-testid"]}>
      <StyledConsumable
        positive={props.positive}
        onIndicatorClick={props.onIndicatorClick}
      />
      <ControlLabel>
        <SpotText level={"secondary"}>
          {t("resultsEntry.snap.labels.control")}
        </SpotText>
      </ControlLabel>

      <AngioDetectLabel>
        <LabeledSelection>
          <SpotText level={"secondary"} bold>
            {t("assays.snap.A_VASO")}
          </SpotText>
          <Selection
            className={props.positive ? "selected" : undefined}
            level={"secondary"}
            bold={props.positive}
          >
            {t(
              `resultsEntry.snap.results.${
                props.positive ? "positive" : "negative"
              }`
            )}
          </Selection>
        </LabeledSelection>
      </AngioDetectLabel>
    </PickerRoot>
  );
}
