describe('docs landing page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.sel('overview').should('be.visible');
  });

  it('introduces the platform in the hero', () => {
    cy.sel('page-title').should('have.text', 'Nx Shop Documentation');
    cy.sel('hero-subtitle').should('contain.text', 'build, test and ship');
    cy.sel('overview').should('have.text', '8 articles across 3 categories');
    cy.sel('overview-loading').should('not.exist');
  });

  it('shows a card for every selling point', () => {
    cy.sel('feature-card').should('have.length', 4);
    cy.sel('feature-card').each(($card) => {
      cy.wrap($card).find('[data-cy="feature-title"]').should('not.have.text', '');
      cy.wrap($card).find('[data-cy="feature-body"]').should('not.have.text', '');
    });
    cy.get('[data-feature="atomizer"]').find('[data-cy="feature-title"]').should('have.text', 'One target per spec');
  });

  it('groups the library into three categories', () => {
    cy.sel('category-card').should('have.length', 3);
    cy.sel('category-title').then(($titles) => {
      const names = [...$titles].map((el) => el.textContent);
      expect(names).to.deep.equal(['Getting Started', 'Guides', 'Reference']);
    });
    cy.sel('category-count').then(($counts) => {
      const totals = [...$counts].map((el) => Number(el.textContent?.split(' ')[0]));
      expect(totals).to.deep.equal([3, 3, 2]);
      expect(totals.reduce((a, b) => a + b, 0)).to.equal(8);
    });
    cy.sel('article-link').should('have.length', 8);
    cy.sel('article-summary').should('have.length', 8);
  });

  it('sends the primary call to action into the first article', () => {
    cy.sel('hero-cta').click();
    cy.location('pathname').should('equal', '/docs/installation');
    cy.sel('article-title').should('have.text', 'Installation');
  });

  it('links to the changelog from the hero', () => {
    cy.sel('hero-changelog').click();
    cy.location('pathname').should('equal', '/changelog');
    cy.sel('page-title').should('have.text', 'Changelog');
  });

  it('opens every article it advertises', () => {
    cy.sel('article-link').then(($links) => {
      const slugs = [...$links].map((el) => el.getAttribute('data-slug') as string);
      expect(slugs).to.have.length(8);
      slugs.forEach((slug) => {
        cy.visit(`/docs/${slug}`);
        cy.sel('article').should('have.attr', 'data-slug', slug);
        cy.sel('article-title').should('not.have.text', '');
        cy.sel('not-found').should('not.exist');
      });
    });
  });
});
