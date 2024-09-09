import { defineConfig } from "@playwright/test";

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

export default defineConfig({
  timeout: 60 * 1000,

  webServer: {
    command: `webpack-cli serve --mode development --port ${port}`,
    port,
  },
});
