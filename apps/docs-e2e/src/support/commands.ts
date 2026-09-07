/// <reference types="cypress" />

export const ARTICLE_SLUGS = [
  'installation',
  'quick-start',
  'project-structure',
  'running-tests',
  'caching',
  'parallel-execution',
  'cli-commands',
  'configuration',
];

declare global {
  namespace Cypress {
    interface Chainable {
      /** Select by `data-cy` attribute. */
      sel(name: string): Chainable<JQuery<HTMLElement>>;
      /** Open an article and wait for the fake-latency load to settle. */
      openArticle(slug: string): Chainable<void>;
      /** Run a search from the /search page and wait for the result count. */
      searchFor(term: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('sel', (name: string) => cy.get(`[data-cy="${name}"]`));

Cypress.Commands.add('openArticle', (slug: string) => {
  cy.visit(`/docs/${slug}`);
  cy.sel('article').should('have.attr', 'data-slug', slug);
});

Cypress.Commands.add('searchFor', (term: string) => {
  cy.visit('/search');
  cy.sel('search-input').clear().type(term);
  cy.sel('search-submit').click();
  cy.sel('result-count').should('be.visible');
});
