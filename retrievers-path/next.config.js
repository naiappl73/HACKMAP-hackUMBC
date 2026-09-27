const path = require("path");

module.exports = {
  reactStrictMode: true,
  // The repo root also has a package.json (so `npm run dev` works from there). Tell Next this folder is the app.
  outputFileTracingRoot: path.join(__dirname),
};
