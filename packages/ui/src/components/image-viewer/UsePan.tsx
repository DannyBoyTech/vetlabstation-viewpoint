import { useCallback, useEffect, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface UsePanProps {
  zoomFactor: number;
  incrementPanX: (amount: number, zoomFactor: number) => void;
  incrementPanY: (amount: number, zoomFactor: number) => void;
}

export function usePan(props: UsePanProps) {
  const [panning, setPanning] = useState(false);
  const [lastPos, setLastPos] = useState<Position>();
  const [target, setTarget] = useState<HTMLElement | null>();

  const onTouchStart = useCallback(() => {
    setPanning(true);
  }, []);

  const onTouchEnd = useCallback(() => {
    // Reset when done dragging
    setLastPos(undefined);
    setPanning(false);
  }, []);

  const { zoomFactor, incrementPanY, incrementPanX } = props;

  const onTouchMove = useCallback(
    (ev: TouchEvent | MouseEvent) => {
      if (panning) {
        ev.stopPropagation();
        ev.preventDefault();
        const pos = getPageCoordinates(ev);
        if (lastPos) {
          incrementPanX((pos.x - lastPos.x) / zoomFactor, zoomFactor);
          incrementPanY((pos.y - lastPos.y) / zoomFactor, zoomFactor);
        }
        setLastPos(pos);
      }
    },
    [incrementPanX, incrementPanY, lastPos, panning, zoomFactor]
  );

  const attachListeners = useCallback(
    (element: HTMLElement | null) => {
      setTarget(element);
    },
    [setTarget]
  );

  useEffect(() => {
    target?.addEventListener("mousedown", onTouchStart);
    target?.addEventListener("touchstart", onTouchStart);

    target?.addEventListener("touchmove", onTouchMove);
    target?.addEventListener("mousemove", onTouchMove);

    target?.addEventListener("touchend", onTouchEnd);
    target?.addEventListener("mouseup", onTouchEnd);

    return () => {
      target?.removeEventListener("touchmove", onTouchMove);
      target?.removeEventListener("mousemove", onTouchMove);

      target?.removeEventListener("touchend", onTouchEnd);
      target?.removeEventListener("mouseup", onTouchEnd);
    };
  }, [target, lastPos, setLastPos, onTouchMove, onTouchStart, onTouchEnd]);

  return {
    attachListeners,
  };
}

export function getPageCoordinates(event: MouseEvent | TouchEvent): {
  x: number;
  y: number;
} {
  if (typeof (event as TouchEvent).touches !== "undefined") {
    const touch = (event as TouchEvent).touches[0];
    return { x: touch?.pageX, y: touch?.pageY };
  }
  return { x: (event as MouseEvent).pageX, y: (event as MouseEvent).pageY };
}
