import React, { InputHTMLAttributes } from "react";
import classNames from "classnames";
import { SpotIcon } from "@viewpoint/spot-icons";

let lastId = 0;

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  alert?: boolean;
  label?: any;
}

const Toggle = ({ className, alert, label, ...props }: ToggleProps) => {
  const [id] = React.useState(lastId++);

  const checkboxClasses = classNames(
    {
      "spot-toggle": true,
      "spot-toggle--alert": alert,
    },
    className
  );

  return (
    <>
      <input
        id={`spot-toggle-${id}`}
        type="checkbox"
        className={checkboxClasses}
        {...props}
      />
      <label className="spot-toggle-label" htmlFor={`spot-toggle-${id}`}>
        {label}
      </label>
    </>
  );
};

export default Toggle;
