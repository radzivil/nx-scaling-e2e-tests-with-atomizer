describe('docs navigation', () => {
  it('groups the sidebar by category', () => {
    cy.openArticle('installation');
    cy.sel('sidebar-group').should('have.length', 3);
    cy.sel('sidebar-group-title').then(($titles) => {
      expect([...$titles].map((el) => el.textContent)).to.deep.equal(['Getting Started', 'Guides', 'Reference']);
    });
    cy.get('[data-category="Guides"]').find('[data-cy="sidebar-link"]').should('have.length', 3);
    cy.sel('sidebar-link').should('have.length', 8);
  });

  it('highlights the article you are reading', () => {
    cy.openArticle('caching');
    cy.get('[data-cy="sidebar-link"].active').should('have.length', 1);
    cy.get('[data-cy="sidebar-link"].active').should('have.attr', 'data-slug', 'caching');
  });

  it('moves the highlight when you pick another group', () => {
    cy.openArticle('installation');
    cy.get('[data-cy="sidebar-link"][data-slug="cli-commands"]').click();
    cy.sel('article').should('have.attr', 'data-slug', 'cli-commands');
    cy.sel('article-title').should('have.text', 'CLI Commands');
    cy.get('[data-cy="sidebar-link"].active').should('have.attr', 'data-slug', 'cli-commands');
    cy.location('pathname').should('equal', '/docs/cli-commands');
  });

  it('walks forward with the pager', () => {
    cy.openArticle('installation');
    cy.sel('prev-article-none').should('be.visible');
    cy.sel('next-article').should('have.attr', 'data-slug', 'quick-start').click();
    cy.sel('article').should('have.attr', 'data-slug', 'quick-start');
    cy.sel('next-article').should('have.attr', 'data-slug', 'project-structure').click();
    cy.sel('article').should('have.attr', 'data-slug', 'project-structure');
    cy.sel('prev-article').should('have.attr', 'data-slug', 'quick-start').click();
    cy.sel('article').should('have.attr', 'data-slug', 'quick-start');
  });

  it('stops the pager at the end of the library', () => {
    cy.openArticle('configuration');
    cy.sel('next-article-none').should('be.visible');
    cy.sel('next-article').should('not.exist');
    cy.sel('prev-article').should('have.attr', 'data-slug', 'cli-commands');
  });

  it('routes from the header to every top level page', () => {
    cy.visit('/');
    cy.sel('nav-changelog').click();
    cy.sel('page-title').should('have.text', 'Changelog');
    cy.sel('nav-docs').click();
    cy.sel('article-title').should('have.text', 'Installation');
    cy.sel('nav-home').click();
    cy.sel('page-title').should('have.text', 'Nx Shop Documentation');
  });

  it('redirects the bare docs path to the first article', () => {
    cy.visit('/docs');
    cy.location('pathname').should('equal', '/docs/installation');
    cy.sel('article-title').should('have.text', 'Installation');
    cy.sel('brand').click();
    cy.location('pathname').should('equal', '/');
  });
});
