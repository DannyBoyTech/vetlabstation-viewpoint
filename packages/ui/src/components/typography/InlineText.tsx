import { SpotText } from "@viewpoint/spot-react";
import { SpotTextProps } from "@viewpoint/spot-react/src/components/typography/Typography";
import styled from "styled-components";

const StyledText = styled(SpotText)`
  display: inline;
`;

interface InlineTextProps extends SpotTextProps {}

const InlineText = (props: InlineTextProps) => {
  return <StyledText {...props} />;
};

export type { InlineTextProps };
export { InlineText };
