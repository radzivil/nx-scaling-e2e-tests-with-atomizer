const { nxE2EPreset } = require('@nx/cypress/plugins/cypress-preset');
const { defineConfig } = require('cypress');
module.exports = defineConfig({
  // Nx passes --env webServerCommand=..., but the preset reads it Node-side in
  // setupNodeEvents. Nothing in the browser needs Cypress.env(), so turn the
  // deprecated API off rather than carry its warning.
  allowCypressEnv: false,
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      bundler: 'vite',
      webServerCommands: {
        default: 'npx nx run shop:dev',
        production: 'npx nx run shop:preview',
      },
      ciWebServerCommand: 'npx nx run shop:preview',
      ciBaseUrl: 'http://localhost:4300',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
