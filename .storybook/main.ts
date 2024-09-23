import { dirname, join } from "path";
import { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../packages/**/src/**/*.mdx",
    "../packages/**/src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  typescript: {
    reactDocgen: "react-docgen-typescript", // or false if you don't need docgen at all
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
    },
  },
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  staticDirs: ["../packages/ui/public", "../packages/test-utils/test-data"],
  async viteFinal(config, { configType }) {
    const { mergeConfig } = await import("vite");
    // return the customized config
    return mergeConfig(config, {
      // customize the Vite config here
      optimizeDeps: {
        include: ["@viewpoint/api"],
      },
      build: {
        rollupOptions: {
          external: [/.*\.vtt$/],
        },
        sourcemap: true,
        commonjsOptions: {
          include: [/api\//, /node_modules/],
        },
      },
    });
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
