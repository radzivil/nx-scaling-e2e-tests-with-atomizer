/// <reference types="cypress" />

export const ADMIN_USER = { email: 'admin@nxshop.test', password: 'nx-atomizer' };

const USER_KEY = 'nxadmin.user';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Select by `data-cy` attribute. */
      sel(name: string): Chainable<JQuery<HTMLElement>>;
      /** Sign in through the real form. */
      login(email?: string, password?: string): Chainable<void>;
      /**
       * Land on `path` already signed in. Skips the login round-trip so a spec
       * spends its wall-clock time on the screen it is actually testing.
       */
      visitAsAdmin(path: string): Chainable<void>;
      /** One row of a `<DataTable cy="...">` by its row key. */
      row(table: string, id: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('sel', (name: string) => cy.get(`[data-cy="${name}"]`));

Cypress.Commands.add('login', (email = ADMIN_USER.email, password = ADMIN_USER.password) => {
  cy.visit('/login');
  cy.sel('email').type(email);
  cy.sel('password').type(password, { log: false });
  cy.sel('submit-login').click();
  cy.sel('current-user').should('have.text', ADMIN_USER.email);
});

Cypress.Commands.add('visitAsAdmin', (path: string) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(USER_KEY, JSON.stringify({ email: ADMIN_USER.email }));
    },
  });
  cy.sel('current-user').should('have.text', ADMIN_USER.email);
});

Cypress.Commands.add('row', (table: string, id: string) =>
  cy.get(`[data-cy="${table}-row"][data-row-id="${id}"]`)
);
