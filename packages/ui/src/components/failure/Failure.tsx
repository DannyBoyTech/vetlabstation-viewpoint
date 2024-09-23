import { SpotText } from "@viewpoint/spot-react";
import classNames from "classnames";
import { Trans } from "react-i18next";
import styled from "styled-components";
import ErrorImg from "../../assets/Error_image_420x420.png";

interface FailureProps {
  className?: string;
  "data-testid"?: string;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;

  height: 100%;

  align-items: center;
  justify-content: center;

  overflow: hidden;
`;
Root.displayName = "LoadFailure";

const MessageRoot = styled.div`
  text-align: center;
  white-space: nowrap;
`;
MessageRoot.displayName = "MessageRoot";

const Image = styled.img`
  height: 20rem;
  width: 20rem;
`;

interface MessageProps {
  className?: string;
  "data-testid"?: string;

  i18nKey: string;
}

const transComponents = {
  maybelinebreak: <wbr />,
} as const;
function Message(props: MessageProps) {
  const classes = classNames(props.className, "message");
  return (
    <MessageRoot className={classes} data-testid={props["data-testid"]}>
      <SpotText level="h5">
        <Trans i18nKey={props.i18nKey as any} components={transComponents} />
      </SpotText>
    </MessageRoot>
  );
}

/**
 * Component used to display a failure message when content fails to load.
 */
const Failure = (props: FailureProps) => {
  const classes = classNames("failure", props.className);

  return (
    <Root {...props} className={classes}>
      <Message i18nKey={"general.messages.whoopsSomethingWentWrong"} />
      <Image src={ErrorImg} />
    </Root>
  );
};

export type { FailureProps };
export { Failure };
