const PORT = process.env['PORT'] || 8383;

module.exports = {
  server: {
    command: `./node_modules/.bin/webpack-dev-server --port ${PORT}`,
    port: PORT,
  },
  launch: {
    headless: !process.env['DEBUG'],
  },
};
