describe('search results', () => {
  it('runs a search from the header box', () => {
    cy.visit('/');
    cy.sel('header-search-input').type('cache');
    cy.sel('header-search-submit').click();
    cy.location('pathname').should('equal', '/search');
    cy.location('search').should('equal', '?q=cache');
    cy.sel('search-loading').should('be.visible');
    cy.sel('search-result').should('have.length', 3);
  });

  it('reports how many articles matched', () => {
    cy.searchFor('cache');
    cy.sel('result-count').should('have.text', '3 results for "cache"');
    cy.sel('search-empty').should('not.exist');
  });

  it('uses the singular for a single match', () => {
    cy.searchFor('caching');
    cy.sel('result-count').should('have.text', '1 result for "caching"');
    cy.sel('search-result').should('have.length', 1);
    cy.sel('search-result-title').should('have.text', 'Caching Explained');
    cy.sel('search-result-category').should('have.text', 'Guides');
  });

  it('describes each hit with a snippet and a match count', () => {
    cy.searchFor('parallel');
    cy.sel('search-result').should('have.length', 4);
    cy.sel('search-result').each(($result) => {
      cy.wrap($result).find('[data-cy="search-result-snippet"]').invoke('text').should('match', /parallel/i);
      cy.wrap($result)
        .find('[data-cy="search-result-matches"]')
        .invoke('text')
        .should('match', /^[1-9]\d* matches$/);
    });
  });

  it('orders the hits by how often the term appears', () => {
    cy.searchFor('npx nx');
    cy.sel('search-result').should('have.length', 7);
    cy.sel('search-result-matches').then(($counts) => {
      const totals = [...$counts].map((el) => Number(el.textContent?.split(' ')[0]));
      expect(totals).to.deep.equal([...totals].sort((a, b) => b - a));
    });
  });

  it('opens the article behind a result', () => {
    cy.searchFor('flaky');
    cy.sel('search-result').should('have.length', 2);
    cy.get('[data-cy="search-result"][data-slug="running-tests"]').click();
    cy.location('pathname').should('equal', '/docs/running-tests');
    cy.sel('article-title').should('have.text', 'Running Tests');
  });

  it('exposes the result list to the keyboard', () => {
    cy.searchFor('graph');
    cy.sel('search-result').should('have.length', 2);
    cy.sel('search-result').each(($result) => {
      cy.wrap($result).should('have.attr', 'href').and('include', '/docs/');
    });
    cy.sel('search-result').first().focus();
    cy.focused().should('have.attr', 'data-cy', 'search-result');
    cy.focused().click();
    cy.location('pathname').should('include', '/docs/');
    cy.sel('article').should('be.visible');
  });
});
