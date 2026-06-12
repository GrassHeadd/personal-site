import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  globalIgnores([".next/**", "node_modules/**"]),
  nextVitals,
  nextTs,
  {
    rules: {
      /* resetting state when a prop changes is used deliberately
         (e.g. NoteLine's loading flash guard) — flag, don't fail */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
