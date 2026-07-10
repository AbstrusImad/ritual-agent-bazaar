/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BAZAAR_REGISTRY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
