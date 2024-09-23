import styled from "styled-components";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { Theme } from "../../utils/StyleConstants";

const Root = styled.div<{ align?: "left" | "center" }>`
  display: flex;
  overflow: hidden;
  position: relative;
  ${(p) =>
    p.align === "left"
      ? "justify-content: flex-start"
      : "justify-content: center"};
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
  width: 100%;
`;

const Scroller = styled.div`
  display: flex;
  align-items: center;
  overflow-x: auto;
  padding: 8px;
  border: ${(p: { theme: Theme }) =>
    `1px solid ${p.theme.colors?.background?.primary}`};

  ::-webkit-scrollbar {
    display: none;
  }
`;

const ArrowContainer = styled.div<{ position: "left" | "right" }>`
  position: absolute;
  ${(p) => (p.position === "left" ? "left: 0" : "right: 0")};
  height: 100%;
  width: 60px;

  display: flex;
  align-items: center;
  justify-content: ${(p) =>
    p.position === "left" ? "flex-start" : "flex-end"};

  .icon {
    pointer-events: none;
    margin-${(p) => p.position}: 15px;
    fill: ${(p: { theme: Theme }) => p.theme.colors?.interactive?.primary};
    z-index: 1;
  }
`;

const ArrowGradient = styled.div<{ position: "left" | "right" }>`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
  -webkit-mask-image: -webkit-gradient(
    linear,
    ${(p) =>
      p.position === "left"
        ? "100% 0, 80% 0%, from(rgba(0, 0, 0, 0)), to(rgba(0, 0, 0, 1))"
        : "20% 100%, 0% 100%, from(rgba(0, 0, 0, 1)), to(rgba(0, 0, 0, 0))"}
  );

  :active {
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.interactive?.hoverSecondary};
  }
`;

export function HorizontalScrollContainer(
  props: PropsWithChildren & {
    className?: string;
    "data-testid"?: string;
    align?: "left" | "center";
  }
) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const checkScrollState = useCallback((target: HTMLDivElement | null) => {
    if (target != null) {
      const size = target.getBoundingClientRect();

      // If there's no scrollability, don't show either
      // Give it a buffer of 2 pixels, sometimes in flex box scenarios the width of the container is a fraction
      // of a pixel smaller than the scrollWidth for some reason
      if (size.width + 2 >= target.scrollWidth) {
        setShowPrev(false);
        setShowNext(false);
      }
      // if we're at scrollLeft === 0, don't show prev
      else if (target.scrollLeft === 0) {
        setShowPrev(false);
        setShowNext(true);
        // If we're scrolled all the way to the right, just show prev, no next
      } else if (size.width + target.scrollLeft >= target.scrollWidth) {
        setShowPrev(true);
        setShowNext(false);
        // We're somewhere in between - show both
      } else {
        setShowPrev(true);
        setShowNext(true);
      }
    }
  }, []);

  const handleScroll = useCallback((direction: "forward" | "backward") => {
    scrollerRef.current?.scrollBy({
      behavior: "smooth",
      left:
        direction === "forward"
          ? scrollerRef.current.clientWidth / 4
          : -scrollerRef.current.clientWidth / 4,
    });
  }, []);

  const checkRefScrollState = () => {
    checkScrollState(scrollerRef.current);
  };

  useEffect(() => {
    checkRefScrollState();
  }, [checkRefScrollState]);

  // Check scroll state when window is resized
  useEffect(() => {
    window.addEventListener("resize", checkRefScrollState);
    return () => window.removeEventListener("resize", checkRefScrollState);
  }, []);

  return (
    <Root
      className={props.className}
      data-testid={props["data-testid"]}
      align={props.align}
    >
      <Scroller
        ref={scrollerRef}
        onScroll={(event) => checkScrollState(event.currentTarget)}
      >
        {props.children}
      </Scroller>

      {showPrev && (
        <ArrowContainer
          data-testid="backward-arrow"
          position="left"
          onClick={() => handleScroll("backward")}
        >
          <ArrowGradient position="left" />
          <SpotIcon name="double-left" size={30} />
        </ArrowContainer>
      )}
      {showNext && (
        <ArrowContainer
          data-testid="forward-arrow"
          position="right"
          onClick={() => handleScroll("forward")}
        >
          <ArrowGradient position="right" />
          <SpotIcon name="double-right" size={30} />
        </ArrowContainer>
      )}
    </Root>
  );
}
