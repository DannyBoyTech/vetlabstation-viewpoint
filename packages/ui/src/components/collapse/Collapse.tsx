import classnames from "classnames";
import {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CSSTransition } from "react-transition-group";
import styled from "styled-components";
import { useForkRef } from "../../utils/hooks/fork-ref";
import { useDebounce } from "../../utils/hooks/hooks";

const CollapseRoot = styled.div<{
  $expanded: boolean;
  $expandDuration: number;
  $height: number;
  $timing: CSSProperties["transitionTimingFunction"];
}>`
  overflow: hidden;

  height: ${(p) => (p.$expanded ? p.$height : 0)}px;

  &.enter,
  &.appear {
    height: 0px;
  }

  &.appear-active,
  &.enter-active {
    height: ${(p) => p.$height}px;
    transition: height ${(p) => `${p.$expandDuration}ms ${p.$timing}`};
  }

  &.enter-done {
    height: ${(p) => p.$height}px;
  }

  &.exit {
    height: ${(p) => p.$height}px;
  }

  &.exit-active {
    height: 0px;
    transition: height ${(p) => `${p.$expandDuration}ms ${p.$timing}`};
  }

  &.exit-done {
    height: 0px;
  }
`;

const CollapseContentRoot = styled.div`
  margin: 0px;
`;

interface CollapseContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onSizeChange?: (entry: ResizeObserverEntry) => void;
}

const CollapseContent = forwardRef(
  (props: CollapseContentProps, ref: ForwardedRef<HTMLDivElement>) => {
    const internalRef = useRef(null);
    const forkRef = useForkRef(internalRef, ref);

    const { onSizeChange, ...elemProps } = props;
    useEffect(() => {
      const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => onSizeChange?.(entry));
      });

      if (internalRef.current != null) {
        observer.observe(internalRef.current);
      }

      return () => observer.disconnect();
    }, [onSizeChange]);

    return <CollapseContentRoot {...elemProps} ref={forkRef} />;
  }
);

const DEFAULT_EXPAND_DURATION = 250;

export interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  expanded?: boolean;
  expandDuration?: number;
  mountOnExpand?: boolean;
  unmountOnCollapse?: boolean;

  onExpanded?: (contentRef: HTMLDivElement | null) => void;
  onCollapsed?: (contentRef: HTMLDivElement | null) => void;
  transitionTimingFunction?: CSSProperties["transitionTimingFunction"];
}

/**
 *  A React container component that expands and collapses, showing and hiding its contents, respectively.
 *  The expand and collapse is animated.
 */
export const Collapse = (props: CollapseProps) => {
  const expandDuration = props.expandDuration ?? DEFAULT_EXPAND_DURATION;
  const [contentHeight, setContentHeight] = useState<number>();

  const [contentExpanded, setContentExpanded] = useState<boolean>(
    props.expanded ?? false
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { children, className, onCollapsed, onExpanded, ...elemProps } = props;

  const onEntered = useCallback(
    (_isAppearing: boolean) => {
      setContentExpanded(true);
      onExpanded?.(contentRef.current as HTMLDivElement);
    },
    [onExpanded]
  );

  const onExited = useCallback(() => {
    setContentExpanded(false);
    onCollapsed?.(contentRef.current as HTMLDivElement);
  }, [onCollapsed]);

  const onSizeChange = useCallback((resize: ResizeObserverEntry) => {
    setContentHeight(resize.contentBoxSize[0].blockSize);
  }, []);

  const classes = classnames("collapse", className);
  const contentClasses = classnames("content", {
    expanded: contentExpanded,
  });

  const appear = props.mountOnExpand;

  return (
    <CSSTransition
      nodeRef={containerRef}
      className={classes}
      in={props.expanded}
      timeout={expandDuration}
      onEntered={onEntered}
      onExited={onExited}
      appear={appear}
      mountOnEnter={props.mountOnExpand}
      unmountOnExit={props.unmountOnCollapse}
    >
      <CollapseRoot
        ref={containerRef}
        {...elemProps}
        $expanded={props.expanded ?? false}
        $expandDuration={expandDuration}
        $height={contentHeight ?? 0}
        $timing={props.transitionTimingFunction ?? "ease-out"}
      >
        <CollapseContent
          className={contentClasses}
          ref={(r) => {
            // Apply content height immediately in case the content is already expanded
            setContentHeight(r?.getBoundingClientRect().height);
            contentRef.current = r;
          }}
          onSizeChange={onSizeChange}
        >
          {children}
        </CollapseContent>
      </CollapseRoot>
    </CSSTransition>
  );
};
