import classNames from "classnames";
import React, {
  createContext,
  CSSProperties,
  ElementType,
  Fragment,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  SystemMessage,
  SystemMessageProps,
} from "../SystemMessageBase/SystemMessage";

import { animationInOptions, animationOutOptions } from "../animations";
import { PolymorphicComponentPropsWithoutRef } from "../../../polymorphic";

type SystemMessageToastProps<C extends ElementType = "div"> = {
  style: CSSProperties;
  timer?: number;
  animationIn?: (typeof animationInOptions)[number];
  animationOut?: (typeof animationOutOptions)[number];
} & PolymorphicComponentPropsWithoutRef<C, SystemMessageProps>;

const SystemMessageToast = ({
  timer,
  onDismiss,
  animationIn,
  animationOut,
  className,
  ...props
}: SystemMessageToastProps) => {
  const [animationClass, setAnimationClass] = useState<string | undefined>(
    animationIn
  );
  const progressRef = React.useRef<HTMLDivElement>(null);
  const [endTimestamp, setEndTimestamp] = React.useState<number>();
  const [dismissed, setDismissed] = React.useState<boolean>(false);

  const dismissFn = useCallback(async () => {
    setAnimationClass(animationOut);
    if (animationOut) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    onDismiss?.();
  }, [animationOut, onDismiss]);

  const triggerDismissal = useCallback(() => setDismissed(true), []);

  //this is done via useEffect to prevent multiple onDismiss calls for single
  //dismissed state change
  useEffect(() => {
    if (dismissed) dismissFn();
  }, [dismissed, dismissFn]);

  useEffect(() => {
    const { current: progress } = progressRef;

    if (timer != null) {
      const duration = timer; //for type checking purposes

      function progressBarAnimation(timestamp: number) {
        if (!dismissed) {
          if (!endTimestamp) {
            setEndTimestamp(timestamp + duration);
          } else {
            const width =
              100 * Math.max(0, (endTimestamp - timestamp) / duration);

            if (progress) {
              progress.style.width = `${width}%`;
            }

            if (width > 0) {
              requestAnimationFrame(progressBarAnimation);
            } else {
              triggerDismissal();
            }
          }
        }
      }

      requestAnimationFrame(progressBarAnimation);
    }
  }, [timer, endTimestamp, dismissed, triggerDismissal]);

  return (
    <SystemMessage
      className={classNames(className, {
        animated: animationIn || animationOut,
        [animationClass ?? ""]: animationClass,
      })}
      onDismiss={triggerDismissal}
      progressRef={progressRef}
      {...props}
    />
  );
};

type ToastLocation =
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "topCenter"
  | "bottomCenter"
  | "centerCenter";

interface ToastProps extends SystemMessageProps {
  id: string;
  content: ReactNode;
  timer?: number;
  animationIn?: (typeof animationInOptions)[number];
  animationOut?: (typeof animationOutOptions)[number];
}

type ToastLocationLists = Record<ToastLocation, { [id: string]: ToastProps }>;

const locationStringMap: Record<ToastLocation, string> = {
  topLeft: "top-left",
  topRight: "top-right",
  bottomLeft: "bottom-left",
  bottomRight: "bottom-right",
  topCenter: "top-center",
  bottomCenter: "bottom-center",
  centerCenter: "center-center",
};

const ToastContext = createContext({
  addToast: (props: ToastProps, location: ToastLocation) => {},
  removeToast: (id: string, location: ToastLocation) => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastLocationLists>({
    topRight: {},
    topLeft: {},
    bottomRight: {},
    bottomLeft: {},
    topCenter: {},
    bottomCenter: {},
    centerCenter: {},
  });

  const addToast = useCallback((props: ToastProps, location: ToastLocation) => {
    setToasts((prevToasts) => ({
      ...prevToasts,
      [location]: { ...prevToasts[location], [props.id]: props },
    }));
  }, []);

  const removeToast = useCallback((id: string, location: ToastLocation) => {
    setToasts((prevToasts) => {
      const newToastEntries = Object.entries(prevToasts[location]).filter(
        ([toadId]) => toadId !== id
      );
      return {
        ...prevToasts,
        [location]: { ...Object.fromEntries(newToastEntries) },
      };
    });
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {Object.entries(toasts).map(([location, toastList]) => {
        if (Object.keys(toastList).length === 0) return null;

        const locationString = location as ToastLocation;

        const isCenter = locationString.includes("Center");

        const Container = isCenter ? Fragment : "div";

        const relativeStyleslocationString: CSSProperties = isCenter
          ? {}
          : { position: "relative" };

        const containerProps = isCenter
          ? {}
          : {
              className: `toast-container--${locationStringMap[locationString]}`,
            };

        return (
          <Container key={location} {...containerProps}>
            {Object.entries(toastList).map(
              ([id, { content, onDismiss, ...props }]) => {
                return (
                  <SystemMessageToast
                    role="status"
                    aria-live="off"
                    aria-atomic="true"
                    key={id}
                    className={`spot-toast ${locationStringMap[locationString]}`}
                    style={relativeStyleslocationString}
                    {...props}
                    onDismiss={() => {
                      removeToast(id, locationString);
                      onDismiss?.();
                    }}
                  >
                    {content}
                  </SystemMessageToast>
                );
              }
            )}
          </Container>
        );
      })}
    </ToastContext.Provider>
  );
};

export interface AddToastProps extends Omit<ToastProps, "id"> {
  id?: string;
  location: ToastLocation;
}

const generateId = (function* () {
  let i = 0;
  while (true) {
    yield `toast-${i++}`;
  }
})();

export const useToast = () => {
  const { addToast: addToastWithLocation } = React.useContext(ToastContext);

  const addToast = useCallback(
    ({ location, ...props }: AddToastProps) => {
      const id = props.id ?? generateId.next().value;

      addToastWithLocation({ ...props, id }, location);

      return id;
    },
    [addToastWithLocation]
  );

  return { addToast };
};

export const useRemoveToast = () => {
  const { removeToast } = useContext(ToastContext);
  return { removeToast };
};
