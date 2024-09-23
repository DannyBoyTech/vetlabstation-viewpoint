import React from "react";
import { SpotIconProps } from "./spot-icon/SpotIcon";

const IdexxLogo = ({
  color,
  size,
  style,
  className,
}: Omit<SpotIconProps, "name">) => {
  return (
    <svg
      style={style}
      className={className}
      viewBox="0 0 186 32"
      fill={color}
      width={size || "100%"}
      height={size || "100%"}
    >
      <g fill="none">
        <path
          fill="#97999B"
          d="M0 0h11v32H0V0zm64 32h37v-7.61H74.404V18H64v14zm-22.103-7.784H25.302V19H15v13h28.578C53.879 32 60 27.796 60 20.323V19H49.698c-.129 4.126-3.491 5.216-7.801 5.216zM25.345 7.713H41.94c4.31 0 7.629 1.113 7.758 5.287H60v-1.073C60 4.254 53.88 0 43.578 0H15v13h10.302V7.713h.043zM101 7.178V0H64v13h10.404V7.178z"
        />
        <path fill="#F9423A" d="M78 13h23v5H78z" />
        <path
          fill="#97999B"
          d="M172.412 19h-18.406l-10.158 9.925L133.69 19h-18.406L102 32h13.631l8.856-9.341L133.386 32h20.924l8.899-9.341L172.065 32H186zM144 3.15l9.89 9.85h19.039L186 0h-13.68l-8.888 9.571L154.544 0H133.5l-8.932 9.571L115.68 0H102l13.071 13h19.039z"
        />
      </g>
    </svg>
  );
};

export default IdexxLogo;
