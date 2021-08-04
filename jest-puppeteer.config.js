const PORT = process.env["PORT"] || 8383;

module.exports = {
  server: {
    command: `./node_modules/.bin/webpack-cli serve --mode development --port ${PORT}`,
    port: PORT,
    debug: true,
  },
  launch: {
    headless: !process.env["DEBUG"],
  },
};
