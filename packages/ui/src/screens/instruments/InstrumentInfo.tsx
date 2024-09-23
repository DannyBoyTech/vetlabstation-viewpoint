import styled from "styled-components";
import { SpotText } from "@viewpoint/spot-react";

const InstrumentInfoRoot = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 1 content;
  overflow-y: auto;
  min-height: 50px;
  gap: 6px;
  margin: 10px 30px;
`;
const InstrumentInfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;
InstrumentInfoItem.displayName = "InstrumentInfoItem";

export interface InstrumentInfoProps {
  properties: Record<string, string | undefined>;
}

export const TestId = {
  InfoProperty: (prop: string) => `instrument-info-prop-${prop}`,
} as const;

export function InstrumentInfo(props: InstrumentInfoProps) {
  return (
    <InstrumentInfoRoot>
      {Object.keys(props.properties).map((prop) => (
        <InstrumentInfoItem key={prop} data-testid={TestId.InfoProperty(prop)}>
          <SpotText level="secondary" bold>
            {prop}
          </SpotText>
          <SpotText level="secondary">
            {props.properties[prop] ? props.properties[prop] : "--"}
          </SpotText>
        </InstrumentInfoItem>
      ))}
    </InstrumentInfoRoot>
  );
}
