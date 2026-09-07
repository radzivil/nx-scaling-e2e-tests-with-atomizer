describe('editing a product', () => {
  beforeEach(() => {
    cy.visitAsAdmin('/products/p-05');
    cy.sel('product-form').should('be.visible');
  });

  it('loads the saved values into the form', () => {
    cy.sel('page-title').should('have.text', 'Edit product');
    cy.sel('product-sku').should('have.text', 'AUD-005');
    cy.sel('name').should('have.value', 'Ember Speaker');
    cy.sel('price').should('have.value', '89');
    cy.sel('stock').should('have.value', '4');
    cy.sel('category').should('have.value', 'Audio');
    cy.sel('save-notice').should('not.exist');
  });

  it('refuses an empty or too-short name', () => {
    cy.sel('name').clear();
    cy.sel('save-product').click();
    cy.sel('error-name').should('have.text', 'Name is required');

    cy.sel('name').type('Em');
    cy.sel('save-product').click();
    cy.sel('error-name').should('have.text', 'Name must be at least 3 characters');
    cy.sel('saved-price').should('contain', '$89.00');
  });

  it('refuses a price that is not a positive number', () => {
    cy.sel('price').clear().type('0');
    cy.sel('save-product').click();
    cy.sel('error-price').should('have.text', 'Price must be greater than zero');

    cy.sel('price').clear().type('cheap');
    cy.sel('save-product').click();
    cy.sel('error-price').should('have.text', 'Price must be a number');
    cy.sel('save-notice').should('not.exist');
  });

  it('refuses a fractional or negative stock count', () => {
    cy.sel('stock').clear().type('2.5');
    cy.sel('save-product').click();
    cy.sel('error-stock').should('have.text', 'Stock must be a whole number of 0 or more');

    cy.sel('stock').clear().type('-3');
    cy.sel('save-product').click();
    cy.sel('error-stock').should('have.text', 'Stock must be a whole number of 0 or more');
  });

  it('reports every bad field at once', () => {
    cy.sel('name').clear();
    cy.sel('price').clear().type('-1');
    cy.sel('stock').clear().type('nope');
    cy.sel('save-product').click();
    cy.sel('error-name').should('be.visible');
    cy.sel('error-price').should('be.visible');
    cy.sel('error-stock').should('be.visible');
    cy.sel('saved-price').should('have.text', 'Saved price $89.00 · 4 in stock');
  });

  it('reverts the form with Reset', () => {
    cy.sel('name').clear().type('Something else');
    cy.sel('price').clear().type('12');
    cy.sel('reset-product').should('not.be.disabled').click();
    cy.sel('name').should('have.value', 'Ember Speaker');
    cy.sel('price').should('have.value', '89');
    cy.sel('reset-product').should('be.disabled');
  });

  it('saves the changes and shows them in the list', () => {
    cy.sel('name').clear().type('Ember Speaker Mk II');
    cy.sel('price').clear().type('95');
    cy.sel('stock').clear().type('20');
    cy.sel('category').select('Desk');
    cy.sel('save-product').click();
    cy.sel('save-product').should('be.disabled').and('have.text', 'Saving…');
    cy.sel('save-notice').should('have.text', 'Product saved');
    cy.sel('saved-price').should('have.text', 'Saved price $95.00 · 20 in stock');

    cy.sel('back-to-products').click();
    cy.sel('products-row').should('have.length', 14);
    cy.sel('product-filter').type('Mk II');
    cy.sel('products-row').should('have.length', 1);
    cy.sel('product-price').should('have.text', '$95.00');
    cy.sel('product-category').should('have.text', 'Desk');
    cy.sel('product-stock').should('have.text', '20');
  });

  it('says so when the product does not exist', () => {
    cy.visitAsAdmin('/products/p-99');
    cy.sel('not-found').should('contain', 'No product with id "p-99"');
    cy.sel('back-to-products').click();
    cy.location('pathname').should('equal', '/products');
    cy.sel('products-row').should('have.length', 14);
  });
});
