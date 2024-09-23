import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useContext, useEffect, useRef, useState } from "react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { ProgressBar, SpotText } from "@viewpoint/spot-react";
import { WizardFooter } from "../../../components/wizard/wizard-components";
import { BasicModal } from "../../../components/basic-modal/BasicModal";
import { ResponsiveModalWrapper } from "../../../components/modal/ResponsiveModalWrapper";
import { ViewpointThemeContext } from "../../../context/ThemeContext";
import {
  VIDEO_ORDER,
  CAPTION_ORDER,
  CueConfiguration,
  getCueConfiguration,
} from "./welcome-video-config";
import classnames from "classnames";
import {
  trackVideoEnded,
  trackVideoPause,
  trackVideoPlay,
} from "../../../analytics/nltx-events";

interface WelcomeModalProps {
  "data-testid"?: string;
  className?: string;

  open: boolean;
  onClose: () => void;
  dismissable?: boolean;

  disableTracking?: boolean;
}

export function WelcomeModal(props: WelcomeModalProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const { t } = useTranslation();

  const classes = classnames("welcome-modal", props.className);

  return (
    <ResponsiveModalWrapper className={classes}>
      <BasicModal
        open={props.open}
        dismissable={props.dismissable}
        onClose={props.onClose}
        footerContent={
          <WizardFooter
            totalSteps={VIDEO_ORDER.length}
            currentStepIndex={pageIndex}
            onNext={() => {
              if (pageIndex === VIDEO_ORDER.length - 1) {
                props.onClose();
                return;
              }
              setPageIndex((prev) => prev + 1);
            }}
            onBack={() => setPageIndex((prev) => (prev === 0 ? 0 : prev - 1))}
            nextButtonContent={
              pageIndex === VIDEO_ORDER.length - 1
                ? t("general.buttons.done")
                : t("general.buttons.next")
            }
            backButtonProps={pageIndex === 0 ? { disabled: true } : undefined}
          />
        }
        bodyContent={
          <WelcomeModalBody
            key={pageIndex}
            videoSrc={VIDEO_ORDER[pageIndex]}
            captionSrc={CAPTION_ORDER[pageIndex]}
            disableTracking={props.disableTracking}
          />
        }
        headerContent={
          <SpotText level="h3" className="spot-modal__title">
            {t("boot.welcome.title")}
          </SpotText>
        }
      />
    </ResponsiveModalWrapper>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const VideoWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  min-width: 700px;
  width: fit-content;
  align-self: center;
`;

const CUE_BACKGROUND_COLOR = "#0B76F0";

const CueContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  border-radius: 12px;
  position: absolute;
  background-color: ${CUE_BACKGROUND_COLOR};

  .spot-typography__heading--level-5 {
    color: white;
  }
`;

const PlayButtonContainer = styled.div`
  position: absolute;
  inset: 0 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;

  > div:active {
    opacity: 0.5;
  }
`;
const Shade = styled.div`
  position: absolute;
  inset: 0 0 0 0;
  background-color: rgba(255, 255, 255, 0.5);
`;

const ProgressContainer = styled.div<{ $hidden: boolean }>`
  width: 90%;
  align-self: center;
`;

interface WelcomeModalBodyProps {
  "data-testid"?: string;
  className?: string;

  videoSrc: string;
  captionSrc: string;

  disableTracking?: boolean;
}

function WelcomeModalBody(props: WelcomeModalBodyProps) {
  const [paused, setPaused] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [cueConfiguration, setCueConfiguration] = useState<CueConfiguration>();
  const [cueText, setCueText] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  // Used to force remounting of progress bar to avoid animating from complete
  // back down to 0 when user replays the video
  const [progressKey, setProgressKey] = useState(Date.now().toString());

  const trackRef = useRef<HTMLTrackElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { theme } = useContext(ViewpointThemeContext);
  const { t, i18n } = useTranslation("captions");

  const classes = classnames("welcome-modal-body", props.className);

  useEffect(() => {
    // Hide the tracks, we are applying our own overlaid on the video
    if (videoRef.current != null) {
      for (let i = 0; i < videoRef.current.textTracks.length; i++) {
        videoRef.current.textTracks[i].mode = "hidden";
      }
    }
    if (trackRef.current != null) {
      // Add listener for when cue change events occur
      const cueChangeListener = (ev: Event) => {
        // Get the cue configuration for the active cue
        const track = (ev.target as HTMLTrackElement).track;
        const activeCue = track.activeCues?.[0];
        // Apply positioning and text to the overlaid cue item
        const textId = `welcomeVideo.${activeCue?.id}`;
        setCueText(
          i18n.exists(textId, { ns: "captions" })
            ? t(textId as any)
            : (activeCue as VTTCue)?.text
        );
        setCueConfiguration(getCueConfiguration(activeCue?.id));
      };
      const track = trackRef.current;
      track.addEventListener("cuechange", cueChangeListener);
      return () => track.removeEventListener("cuechange", cueChangeListener);
    }
  }, []);

  return (
    <Root className={classes}>
      <VideoWrapper>
        <video
          autoPlay
          muted
          ref={videoRef}
          src={props.videoSrc}
          controls={false}
          preload="metadata"
          onClick={() => videoRef.current?.pause()}
          onTimeUpdate={() => {
            if (videoRef.current != null) {
              const duration = videoRef.current.duration;
              const currentTime = videoRef.current.currentTime;
              setProgress(currentTime / duration);
            }
          }}
          onPlay={() => {
            setVideoCompleted(false);
            setPaused(false);
            !props.disableTracking && trackVideoPlay({ src: props.videoSrc });
          }}
          onPause={() => {
            setPaused(true);
            !props.disableTracking && trackVideoPause({ src: props.videoSrc });
          }}
          onEnded={() => {
            setVideoCompleted(true);
            setPaused(false);
            !props.disableTracking && trackVideoEnded({ src: props.videoSrc });
          }}
        >
          <track
            hidden
            ref={trackRef}
            src={props.captionSrc}
            label={i18n.language}
            srcLang={i18n.language}
            kind="subtitles"
            default
          />
        </video>

        {cueConfiguration != null && cueText != null && (
          <>
            <CueContainer style={cueConfiguration.position}>
              <SpotText level="h5">{cueText}</SpotText>
            </CueContainer>
          </>
        )}
        {(videoCompleted || paused) && (
          <>
            <Shade />
            <PlayButtonContainer>
              <div
                onClick={async () => {
                  if (videoCompleted) {
                    setProgress(0);
                    setProgressKey(Date.now().toString());
                  }
                  await videoRef.current?.play();
                }}
              >
                <SpotIcon
                  name={videoCompleted ? "refresh-redo" : "play"}
                  color={theme.colors?.interactive?.primary}
                  size={75}
                />
              </div>
            </PlayButtonContainer>
          </>
        )}
      </VideoWrapper>
      <ProgressContainer $hidden={progress == null}>
        <ProgressBar size="small" progress={progress} key={progressKey} />
      </ProgressContainer>
    </Root>
  );
}
