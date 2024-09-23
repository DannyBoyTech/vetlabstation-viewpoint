import React from "react";

export interface ProductNameProps {
  logo?: React.ReactNode;
}

export const ProductName = (
  props: React.PropsWithChildren<ProductNameProps>
) => {
  const { logo, children } = props;

  return (
    <div className="spot-header__product-identity">
      {logo && <div className="spot-header__product-icon">{logo}</div>}
      <div className="spot-header__product-name">
        <span>IDEXX</span> {children}
      </div>
    </div>
  );
};
