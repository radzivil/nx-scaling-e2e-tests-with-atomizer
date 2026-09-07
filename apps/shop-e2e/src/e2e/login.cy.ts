import { DEMO_USER } from '../support/commands';

describe('sign in', () => {
  it('signs in with the demo account', () => {
    cy.visit('/login');
    cy.sel('email').type(DEMO_USER.email);
    cy.sel('password').type(DEMO_USER.password);
    cy.sel('submit-login').click();
    cy.sel('current-user').should('have.text', DEMO_USER.email);
    cy.location('pathname').should('equal', '/');
  });

  it('rejects a wrong password', () => {
    cy.visit('/login');
    cy.sel('email').type(DEMO_USER.email);
    cy.sel('password').type('not-the-password');
    cy.sel('submit-login').click();
    cy.sel('login-error').should('have.text', 'Invalid email or password');
    cy.sel('nav-login').should('exist');
  });

  it('rejects an unknown account', () => {
    cy.visit('/login');
    cy.sel('email').type('nobody@nxshop.test');
    cy.sel('password').type(DEMO_USER.password);
    cy.sel('submit-login').click();
    cy.sel('login-error').should('be.visible');
  });

  it('disables the button while the request is in flight', () => {
    cy.visit('/login');
    cy.sel('email').type(DEMO_USER.email);
    cy.sel('password').type(DEMO_USER.password);
    cy.sel('submit-login').click();
    cy.sel('submit-login').should('be.disabled').and('have.text', 'Signing in…');
    cy.sel('current-user').should('exist');
  });

  it('sends an anonymous visitor from checkout to sign in and back', () => {
    cy.addToCart('fitness-band');
    cy.visit('/checkout');
    cy.location('pathname').should('equal', '/login');
    cy.sel('email').type(DEMO_USER.email);
    cy.sel('password').type(DEMO_USER.password);
    cy.sel('submit-login').click();
    cy.location('pathname').should('equal', '/checkout');
    cy.sel('checkout-email').should('have.text', DEMO_USER.email);
  });

  it('signs out again', () => {
    cy.login();
    cy.sel('sign-out').click();
    cy.sel('nav-login').should('be.visible');
    cy.sel('current-user').should('not.exist');
  });
});
