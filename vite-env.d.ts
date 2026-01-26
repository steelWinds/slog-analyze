interface ImportMetaEnv {
  readonly PROD: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_VERSION: string
  readonly VITE_LOG: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
