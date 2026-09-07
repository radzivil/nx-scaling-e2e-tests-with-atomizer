import { ADMIN_USER } from '../support/commands';

describe('back-office sign in', () => {
  it('signs in with the demo account', () => {
    cy.visit('/login');
    cy.sel('demo-credentials').should('contain', ADMIN_USER.email);
    cy.sel('email').type(ADMIN_USER.email);
    cy.sel('password').type(ADMIN_USER.password);
    cy.sel('submit-login').click();
    cy.sel('current-user').should('have.text', ADMIN_USER.email);
    cy.location('pathname').should('equal', '/');
    cy.sel('page-title').should('have.text', 'Dashboard');
  });

  it('rejects a wrong password', () => {
    cy.visit('/login');
    cy.sel('email').type(ADMIN_USER.email);
    cy.sel('password').type('not-the-password');
    cy.sel('submit-login').click();
    cy.sel('login-error').should('have.text', 'Invalid email or password');
    cy.sel('app-nav').should('not.exist');
    cy.location('pathname').should('equal', '/login');
  });

  it('rejects an unknown account', () => {
    cy.visit('/login');
    cy.sel('email').type('nobody@nxshop.test');
    cy.sel('password').type(ADMIN_USER.password);
    cy.sel('submit-login').click();
    cy.sel('login-error').should('be.visible');
    cy.sel('current-user').should('not.exist');
  });

  it('validates the form before calling the server', () => {
    cy.visit('/login');
    cy.sel('submit-login').click();
    cy.sel('error-email').should('have.text', 'Email is required');
    cy.sel('error-password').should('have.text', 'Password is required');
    cy.sel('login-error').should('not.exist');

    cy.sel('email').type(ADMIN_USER.email);
    cy.sel('submit-login').click();
    cy.sel('error-email').should('not.exist');
    cy.sel('error-password').should('have.text', 'Password is required');
  });

  it('disables the button while the request is in flight', () => {
    cy.visit('/login');
    cy.sel('email').type(ADMIN_USER.email);
    cy.sel('password').type(ADMIN_USER.password);
    cy.sel('submit-login').click();
    cy.sel('submit-login').should('be.disabled').and('have.text', 'Signing in…');
    cy.sel('current-user').should('exist');
  });

  it('sends a signed-out visitor from a guarded page to sign in and back', () => {
    cy.visit('/orders');
    cy.location('pathname').should('equal', '/login');
    cy.sel('email').type(ADMIN_USER.email);
    cy.sel('password').type(ADMIN_USER.password);
    cy.sel('submit-login').click();
    cy.location('pathname').should('equal', '/orders');
    cy.sel('page-title').should('have.text', 'Orders');
    cy.sel('orders-row').should('have.length', 12);
  });

  it('signs out and locks the back office again', () => {
    cy.login();
    cy.sel('stat-orders').should('have.text', '12');
    cy.sel('sign-out').click();
    cy.location('pathname').should('equal', '/login');
    cy.sel('app-nav').should('not.exist');

    cy.visit('/settings');
    cy.location('pathname').should('equal', '/login');
    cy.sel('login-form').should('be.visible');
  });
});
