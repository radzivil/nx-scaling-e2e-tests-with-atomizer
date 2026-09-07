const { nxE2EPreset } = require('@nx/cypress/plugins/cypress-preset');
const { defineConfig } = require('cypress');
module.exports = defineConfig({
  // See shop-e2e for why this is off.
  allowCypressEnv: false,
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      bundler: 'vite',
      webServerCommands: {
        default: 'npx nx run admin:dev',
        production: 'npx nx run admin:preview',
      },
      ciWebServerCommand: 'npx nx run admin:preview',
      ciBaseUrl: 'http://localhost:4301',
    }),
    baseUrl: 'http://localhost:4201',
  },
});
