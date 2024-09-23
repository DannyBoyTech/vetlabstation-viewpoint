import React, { useEffect } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { EllipsizedPaginator as Component } from "./EllipsizedPaginator";
import { PagingProps } from "./Paging";
import { useState } from "@storybook/preview-api";

export default {
  title: "spot-react/Paging",
  component: Component,
} as Meta;

export const EllipsizedPaginator: StoryFn<PagingProps> = (args) => {
  const [currentPage, setCurrentPage] = useState(args.currentPage);

  useEffect(() => {
    setCurrentPage(args.currentPage);
  }, [args.currentPage]);
  return (
    <div style={{ width: "500px" }}>
      <Component
        {...args}
        currentPage={currentPage}
        onPageChange={(p) => setCurrentPage(p)}
      />
    </div>
  );
};

EllipsizedPaginator.args = {
  count: 30,
  currentPage: 0,
};
