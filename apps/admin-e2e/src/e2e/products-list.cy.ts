describe('product list filtering', () => {
  beforeEach(() => {
    cy.visitAsAdmin('/products');
    cy.sel('products').should('be.visible');
  });

  it('lists the whole catalogue', () => {
    cy.sel('products-row').should('have.length', 14);
    cy.sel('product-count').should('have.text', '14 products');
    cy.sel('product-sku').first().should('have.text', 'AUD-001');
  });

  it('filters by product name', () => {
    cy.sel('product-filter').type('lamp');
    cy.sel('products-row').should('have.length', 1);
    cy.sel('product-count').should('have.text', '1 product');
    cy.sel('product-name').should('have.text', 'Basalt Desk Lamp');
  });

  it('filters by category from the dropdown', () => {
    cy.sel('category-filter').select('Audio');
    cy.sel('products-row').should('have.length', 4);
    cy.sel('product-category').each(($cell) => expect($cell.text()).to.equal('Audio'));

    cy.sel('category-filter').select('Wearables');
    cy.sel('products-row').should('have.length', 2);
    cy.sel('product-category').each(($cell) => expect($cell.text()).to.equal('Wearables'));
  });

  it('matches the category name from the text box too', () => {
    cy.sel('product-filter').type('wearables');
    cy.sel('products-row').should('have.length', 2);
    cy.sel('product-name').first().should('have.text', 'Juniper Smart Ring');
  });

  it('shows an empty state when nothing matches', () => {
    cy.sel('product-filter').type('zzz');
    cy.sel('products').should('not.exist');
    cy.sel('no-products').should('be.visible');
    cy.sel('product-count').should('have.text', '0 products');

    cy.sel('clear-filters').click();
    cy.sel('no-products').should('not.exist');
    cy.sel('products-row').should('have.length', 14);
  });

  it('combines the text box with the category dropdown', () => {
    cy.sel('category-filter').select('Desk');
    cy.sel('products-row').should('have.length', 6);
    cy.sel('product-filter').type('cable');
    cy.sel('products-row').should('have.length', 1);
    cy.sel('product-name').should('have.text', 'Marble Cable Kit');

    cy.sel('product-filter').clear().type('ring');
    cy.sel('no-products').should('be.visible');
  });

  it('flags every product under the low stock threshold', () => {
    cy.sel('low-stock-flag').should('have.length', 5);
    cy.row('products', 'p-10').find('[data-cy="low-stock-flag"]').should('exist');
    cy.row('products', 'p-01').find('[data-cy="low-stock-flag"]').should('not.exist');
  });

  it('edits stock inline and keeps it after a reload', () => {
    cy.row('products', 'p-05').find('[data-cy="product-stock"]').should('have.text', '4');
    cy.row('products', 'p-05').find('[data-cy="stock-increment"]').click();
    cy.row('products', 'p-05').find('[data-cy="product-stock"]').should('have.text', '5');
    cy.row('products', 'p-05').find('[data-cy="stock-increment"]').click();
    cy.row('products', 'p-05').find('[data-cy="product-stock"]').should('have.text', '6');
    cy.row('products', 'p-05').find('[data-cy="stock-decrement"]').click();
    cy.row('products', 'p-05').find('[data-cy="product-stock"]').should('have.text', '5');

    cy.reload();
    cy.row('products', 'p-05').find('[data-cy="product-stock"]').should('have.text', '5');
  });
});
