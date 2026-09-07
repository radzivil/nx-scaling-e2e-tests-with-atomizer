const prices = ($cells: JQuery<HTMLElement>) => [...$cells].map((el) => Number(el.textContent?.replace('$', '')));

describe('catalog filters and sorting', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.sel('product-grid').should('exist');
  });

  it('filters down to a single category', () => {
    cy.sel('category-audio').click();
    cy.sel('product-card').should('have.length', 4);
    cy.sel('product-category').each(($cell) => expect($cell.text()).to.equal('Audio'));
  });

  it('marks the active category', () => {
    cy.sel('category-desk').click();
    cy.sel('category-desk').should('have.attr', 'aria-pressed', 'true');
    cy.sel('category-all').should('have.attr', 'aria-pressed', 'false');
    cy.sel('product-card').should('have.length', 5);
  });

  it('returns to everything via All', () => {
    cy.sel('category-wearables').click();
    cy.sel('product-card').should('have.length', 3);
    cy.sel('category-all').click();
    cy.sel('product-card').should('have.length', 12);
  });

  it('sorts price low to high', () => {
    cy.sel('sort-select').select('price-asc');
    cy.sel('product-price').then(($cells) => {
      const values = prices($cells);
      expect(values).to.deep.equal([...values].sort((a, b) => a - b));
      expect(values[0]).to.equal(25);
    });
  });

  it('sorts price high to low', () => {
    cy.sel('sort-select').select('price-desc');
    cy.sel('product-price').then(($cells) => {
      const values = prices($cells);
      expect(values).to.deep.equal([...values].sort((a, b) => b - a));
      expect(values[0]).to.equal(249);
    });
  });

  it('combines a category filter with a sort', () => {
    cy.sel('category-desk').click();
    cy.sel('sort-select').select('price-desc');
    cy.sel('product-name').first().should('have.text', 'Mechanical Keyboard');
    cy.sel('product-name').last().should('have.text', 'Laptop Stand');
  });
});
