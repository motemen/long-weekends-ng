import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Reporter to use
  reporter: "html",

  timeout: 60 * 1000,

  webServer: {
    command: "webpack-cli serve --mode development",
    port: 8080,
    stdout: "pipe",
    stderr: "pipe",
  },
});
