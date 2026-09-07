describe('catalog search', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.sel('product-grid').should('exist');
  });

  it('narrows the grid as you type', () => {
    cy.sel('search-input').type('watch');
    cy.sel('product-card').should('have.length', 1);
    cy.sel('product-name').should('have.text', 'Smart Watch');
  });

  it('matches on the description as well as the name', () => {
    cy.sel('search-input').type('wrist');
    cy.sel('product-card').should('have.length', 1);
    cy.sel('product-name').should('have.text', 'Ergo Mouse');
  });

  it('ignores case', () => {
    cy.sel('search-input').type('KEYBOARD');
    cy.sel('product-card').should('have.length', 1);
    cy.sel('product-name').should('have.text', 'Mechanical Keyboard');
  });

  it('reports when nothing matches', () => {
    cy.sel('search-input').type('typewriter');
    cy.sel('product-grid').should('not.exist');
    cy.sel('empty-results').should('be.visible');
    cy.sel('result-count').should('have.text', '0 products');
  });

  it('restores the full grid when cleared', () => {
    cy.sel('search-input').type('sleep');
    cy.sel('product-card').should('have.length', 1);
    cy.sel('search-input').clear();
    cy.sel('product-card').should('have.length', 12);
  });
});
