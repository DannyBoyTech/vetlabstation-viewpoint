/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VP_NO_I18N: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite-plugin-svgr/client" />
