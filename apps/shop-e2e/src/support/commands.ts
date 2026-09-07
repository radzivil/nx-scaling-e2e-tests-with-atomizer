/// <reference types="cypress" />

export const DEMO_USER = { email: 'demo@nxshop.test', password: 'nx-atomizer' };

declare global {
  namespace Cypress {
    interface Chainable {
      /** Select by `data-cy` attribute. */
      sel(name: string): Chainable<JQuery<HTMLElement>>;
      login(email?: string, password?: string): Chainable<void>;
      addToCart(productId: string, qty?: number): Chainable<void>;
    }
  }
}

Cypress.Commands.add('sel', (name: string) => cy.get(`[data-cy="${name}"]`));

Cypress.Commands.add('login', (email = DEMO_USER.email, password = DEMO_USER.password) => {
  cy.visit('/login');
  cy.sel('email').type(email);
  cy.sel('password').type(password, { log: false });
  cy.sel('submit-login').click();
  cy.sel('current-user').should('have.text', email);
});

Cypress.Commands.add('addToCart', (productId: string, qty = 1) => {
  cy.visit(`/product/${productId}`);
  for (let i = 1; i < qty; i++) cy.sel('qty-increment').click();
  cy.sel('qty-value').should('have.text', String(qty));
  cy.sel('add-to-cart').click();
  cy.sel('added-notice').should('be.visible');
});
