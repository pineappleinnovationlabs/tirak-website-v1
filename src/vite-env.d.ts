/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Core Worker API base URL — required, no live fallback */
  readonly VITE_CORE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
