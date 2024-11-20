/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

declare module '*.scss' {
  export const content: Record<string, string>;
  export default content;
}
