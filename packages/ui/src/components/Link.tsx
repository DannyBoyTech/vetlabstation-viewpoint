import classnames from "classnames";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  To,
} from "react-router-dom";

interface LinkProps extends Omit<RouterLinkProps, "to"> {
  className?: string;
  large?: boolean;
  small?: boolean;
  disabled?: boolean;
  ellipsis?: boolean;
  showVisited?: boolean;
  iconLeft?: boolean;
  iconRight?: boolean;
  iconSize?: "xs" | "s" | "m" | "l";
  // react-router can use numbers to go back (-1 to go back 1 page, etc.) but the types don't reflect that yet for some reason
  // see: https://reactrouter.com/docs/en/v6/hooks/use-navigate
  to: To | number;
}

export const Link = ({
  className,
  children,
  large,
  small,
  disabled,
  ellipsis,
  showVisited,
  iconSize,
  iconRight,
  iconLeft,
  to,
  ...props
}: LinkProps) => {
  const classes = classnames("spot-link", className, {
    "spot-link--small": small,
    "spot-link--large": large,
    "spot-link--ellipsis": ellipsis,
    "spot-link--disabled": disabled,
    "spot-link--show-visited": showVisited,
  });

  return (
    <RouterLink className={classes} {...props} to={to as string}>
      {children}
    </RouterLink>
  );
};
