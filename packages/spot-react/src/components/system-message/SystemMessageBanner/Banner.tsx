import classNames from "classnames";
import React, { ElementType, forwardRef, useCallback, useState } from "react";
import {
  SystemMessage,
  SystemMessageProps,
} from "../SystemMessageBase/SystemMessage";

import { animationInOptions, animationOutOptions } from "../animations";
import { PolymorphicComponentPropsWithoutRef } from "../../../polymorphic";

export type BannerProps<C extends ElementType = "div"> = {
  location?: "top" | "bottom";
  animationIn?: (typeof animationInOptions)[number];
  animationOut?: (typeof animationOutOptions)[number];
} & PolymorphicComponentPropsWithoutRef<C, SystemMessageProps>;

export const Banner = forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      animationIn,
      animationOut,
      onDismiss,
      location = "bottom",
      ...props
    }: BannerProps,
    ref
  ) => {
    const [animationClass, setAnimationClass] = useState<string | undefined>(
      animationIn
    );

    const dismissFn = useCallback(async () => {
      setAnimationClass(animationOut);
      if (animationOut) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      onDismiss?.();
    }, [animationOut, onDismiss]);

    return (
      <SystemMessage
        ref={ref}
        className={classNames(className, "spot-toast", {
          [`${location}-full`]: location,
          animated: animationIn ?? animationOut,
          [animationClass ?? ""]: animationClass,
        })}
        onDismiss={dismissFn}
        {...props}
      />
    );
  }
);

Banner.displayName = "Banner";
