describe('catalog', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.sel('product-grid').should('exist');
  });

  it('lists every product', () => {
    cy.sel('page-title').should('have.text', 'Catalog');
    cy.sel('product-card').should('have.length', 12);
    cy.sel('result-count').should('have.text', '12 products');
  });

  it('shows a category and a price on every card', () => {
    cy.sel('product-card').each(($card) => {
      cy.wrap($card).find('[data-cy="product-category"]').should('not.be.empty');
      cy.wrap($card).find('[data-cy="product-price"]').invoke('text').should('match', /^\$\d+\.\d{2}$/);
    });
  });

  it('sorts by name by default', () => {
    cy.sel('product-name').then(($names) => {
      const rendered = [...$names].map((el) => el.textContent?.trim() ?? '');
      expect(rendered).to.deep.equal([...rendered].sort((a, b) => a.localeCompare(b)));
    });
  });

  it('opens a product from the grid', () => {
    cy.sel('product-card').first().find('[data-cy="product-name"]').click();
    cy.location('pathname').should('include', '/product/');
    cy.sel('add-to-cart').should('be.visible');
  });

  it('starts with an empty cart', () => {
    cy.sel('cart-count').should('have.text', '0');
    cy.sel('nav-cart').click();
    cy.sel('empty-cart').should('be.visible');
  });
});
