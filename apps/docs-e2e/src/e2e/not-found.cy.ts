describe('missing pages', () => {
  it('reports an unknown article slug', () => {
    cy.visit('/docs/there-is-no-such-page');
    cy.sel('article-loading').should('be.visible');
    cy.sel('not-found').should('be.visible');
    cy.sel('not-found-title').should('have.text', '404 — article not found');
    cy.sel('article').should('not.exist');
    cy.sel('toc').should('not.exist');
  });

  it('keeps the sidebar so you can carry on reading', () => {
    cy.visit('/docs/there-is-no-such-page');
    cy.sel('not-found').should('be.visible');
    cy.sel('sidebar-link').should('have.length', 8);
    cy.get('[data-cy="sidebar-link"][data-slug="caching"]').click();
    cy.sel('article').should('have.attr', 'data-slug', 'caching');
    cy.sel('not-found').should('not.exist');
  });

  it('reports an unknown top level route', () => {
    cy.visit('/pricing');
    cy.sel('not-found-title').should('have.text', '404 — page not found');
    cy.sel('not-found-body').should('contain.text', 'It may have been renamed or removed.');
    cy.sel('sidebar').should('not.exist');
  });

  it('offers a way back to the home page', () => {
    cy.visit('/docs/gone/for/good');
    cy.sel('not-found').should('be.visible');
    cy.sel('back-home').click();
    cy.location('pathname').should('equal', '/');
    cy.sel('page-title').should('have.text', 'Nx Shop Documentation');
  });

  it('offers a way back into the docs', () => {
    cy.visit('/nope');
    cy.sel('back-docs').click();
    cy.location('pathname').should('equal', '/docs/installation');
    cy.sel('article-title').should('have.text', 'Installation');
  });

  it('handles every shape of bad url', () => {
    const badArticles = ['nope', 'caching-2', 'Installation', 'guides'];
    badArticles.forEach((slug) => {
      cy.visit(`/docs/${slug}`);
      cy.sel('not-found-title').should('have.text', '404 — article not found');
      cy.sel('article').should('not.exist');
    });

    const badRoutes = ['/pricing', '/docs/a/b', '/search/all', '/changelog/3.2.0'];
    badRoutes.forEach((route) => {
      cy.visit(route);
      cy.sel('not-found-title').should('have.text', '404 — page not found');
      cy.sel('back-home').should('be.visible');
    });
  });

  it('still lets you search from a 404', () => {
    cy.visit('/nope');
    cy.sel('not-found').should('be.visible');
    cy.sel('header-search-input').type('doctor');
    cy.sel('header-search-submit').click();
    cy.sel('result-count').should('have.text', '1 result for "doctor"');
    cy.sel('search-result-title').should('have.text', 'Installation');
  });
});
