import { SpotIcon } from "@viewpoint/spot-icons";
import { useContext, useRef, useState, VideoHTMLAttributes } from "react";
import styled from "styled-components";
import { ViewpointThemeContext } from "../../context/ThemeContext";
import {
  trackVideoEnded,
  trackVideoPause,
  trackVideoPlay,
} from "../../analytics/nltx-events";
import classnames from "classnames";

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  video {
    width: 100%;
  }
`;

const PlayButtonContainer = styled.div`
  position: absolute;
  inset: 0 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  "data-testid"?: string;

  loopTimes?: number;
  disableTracking?: boolean;
}

export function LimitedLoopedVideo({ loopTimes, ...props }: VideoProps) {
  const [loopCount, setLoopCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { theme } = useContext(ViewpointThemeContext);

  const showPlayButton = loopTimes != null && loopCount >= loopTimes;

  const classes = classnames("limited-looped-video", props.className);

  return (
    <Container className={props.className}>
      <video
        {...props}
        ref={videoRef}
        loop={loopCount != null ? undefined : props.loop}
        onPlay={() =>
          !props.disableTracking && trackVideoPlay({ src: props.src })
        }
        onPause={() =>
          !props.disableTracking && trackVideoPause({ src: props.src })
        }
        onEnded={async () => {
          if (loopTimes != null) {
            const newLoopCount = loopCount + 1;
            setLoopCount(newLoopCount);
            if (loopTimes > newLoopCount) {
              await videoRef.current?.play();
            } else {
              videoRef.current?.pause();
            }
          }
          !props.disableTracking && trackVideoEnded({ src: props.src });
        }}
      />
      {showPlayButton && (
        <PlayButtonContainer>
          <div
            onClick={async () => {
              setLoopCount(0);
              await videoRef.current?.play();
            }}
          >
            <SpotIcon
              name={"play"}
              color={theme.colors?.interactive?.primary}
              size={40}
            />
          </div>
        </PlayButtonContainer>
      )}
    </Container>
  );
}
