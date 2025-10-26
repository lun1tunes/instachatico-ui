/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_BEARER_TOKEN: string
  readonly VITE_UI_USERNAME: string
  readonly VITE_UI_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
