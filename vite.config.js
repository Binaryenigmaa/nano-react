// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "classic",
      pragma: "NanoReact.createElement",
      pragmaFrag: "NanoReact.Fragment",
    },
  },
});
