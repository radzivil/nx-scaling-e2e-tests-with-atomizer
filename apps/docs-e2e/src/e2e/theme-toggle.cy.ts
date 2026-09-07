const THEME_KEY = 'docs-theme';

const storedTheme = () => cy.window().its('localStorage').invoke('getItem', THEME_KEY);

describe('light and dark theme', () => {
  it('starts in the light theme', () => {
    cy.visit('/');
    cy.get('html').should('have.attr', 'data-theme', 'light');
    cy.sel('theme-label').should('have.text', 'Light');
    cy.sel('theme-toggle').should('have.attr', 'aria-pressed', 'false');
  });

  it('switches to dark when toggled', () => {
    cy.visit('/');
    cy.sel('theme-toggle').click();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.sel('theme-label').should('have.text', 'Dark');
    cy.sel('theme-toggle').should('have.attr', 'aria-pressed', 'true');
  });

  it('remembers the choice in local storage', () => {
    cy.visit('/');
    storedTheme().should('equal', 'light');
    cy.sel('theme-toggle').click();
    cy.sel('theme-label').should('have.text', 'Dark');
    storedTheme().should('equal', 'dark');
  });

  it('survives a full reload', () => {
    cy.visit('/changelog');
    cy.sel('page-title').should('have.text', 'Changelog');
    cy.sel('theme-toggle').click();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.reload();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.sel('theme-label').should('have.text', 'Dark');
  });

  it('follows you across the app', () => {
    cy.visit('/');
    cy.sel('theme-toggle').click();
    cy.sel('hero-cta').click();
    cy.sel('article-title').should('have.text', 'Installation');
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.sel('nav-changelog').click();
    cy.sel('page-title').should('have.text', 'Changelog');
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.sel('theme-label').should('have.text', 'Dark');
  });

  it('is already dark on every freshly loaded page', () => {
    cy.visit('/');
    cy.sel('theme-toggle').click();
    cy.get('html').should('have.attr', 'data-theme', 'dark');

    ['/docs/installation', '/docs/caching', '/docs/cli-commands', '/search?q=cache', '/changelog', '/nope'].forEach(
      (route) => {
        cy.visit(route);
        cy.get('html').should('have.attr', 'data-theme', 'dark');
        cy.sel('theme-label').should('have.text', 'Dark');
        cy.sel('theme-toggle').should('have.attr', 'aria-pressed', 'true');
      },
    );
  });

  it('toggles back to light again', () => {
    cy.visit('/docs/caching');
    cy.sel('article').should('be.visible');
    cy.sel('theme-toggle').click();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.sel('theme-toggle').click();
    cy.get('html').should('have.attr', 'data-theme', 'light');
    cy.sel('theme-label').should('have.text', 'Light');
    storedTheme().should('equal', 'light');
    cy.reload();
    cy.get('html').should('have.attr', 'data-theme', 'light');
  });
});
