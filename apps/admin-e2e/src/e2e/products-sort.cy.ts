const numbers = ($cells: JQuery<HTMLElement>) => [...$cells].map((el) => Number(el.textContent?.replace('$', '')));
const texts = ($cells: JQuery<HTMLElement>) => [...$cells].map((el) => el.textContent ?? '');

describe('product list sorting', () => {
  beforeEach(() => {
    cy.visitAsAdmin('/products');
    cy.sel('products-row').should('have.length', 14);
  });

  it('starts sorted by name ascending', () => {
    cy.sel('sort-name').should('contain', '↑');
    cy.sel('product-name').first().should('have.text', 'Aurora Headphones');
    cy.sel('product-name').last().should('have.text', 'Nimbus Noise Meter');
    cy.sel('product-name').then(($cells) => {
      const values = texts($cells);
      expect(values).to.deep.equal([...values].sort());
    });
  });

  it('reverses the name sort on a second click', () => {
    cy.sel('sort-name').click();
    cy.sel('sort-name').should('contain', '↓');
    cy.sel('product-name').first().should('have.text', 'Nimbus Noise Meter');
    cy.sel('product-name').last().should('have.text', 'Aurora Headphones');
  });

  it('sorts by price, cheapest first', () => {
    cy.sel('sort-price').click();
    cy.sel('product-price').first().should('have.text', '$19.00');
    cy.sel('product-price').then(($cells) => {
      const values = numbers($cells);
      expect(values).to.deep.equal([...values].sort((a, b) => a - b));
    });
  });

  it('sorts by price, dearest first', () => {
    cy.sel('sort-price').click();
    cy.sel('product-price').first().should('have.text', '$19.00');
    cy.sel('sort-price').click();
    cy.sel('product-price').first().should('have.text', '$249.00');
    cy.sel('product-name').first().should('have.text', 'Juniper Smart Ring');
    cy.sel('product-price').then(($cells) => {
      const values = numbers($cells);
      expect(values).to.deep.equal([...values].sort((a, b) => b - a));
    });
  });

  it('sorts by how much stock is left', () => {
    cy.sel('sort-stock').click();
    cy.sel('product-stock').first().should('have.text', '3');
    cy.sel('product-stock').last().should('have.text', '200');
    cy.sel('product-stock').then(($cells) => {
      const values = numbers($cells);
      expect(values).to.deep.equal([...values].sort((a, b) => a - b));
    });
  });

  it('sorts by SKU and switches the arrow to the active column', () => {
    cy.sel('sort-sku').click();
    cy.sel('sort-sku').should('contain', '↑');
    cy.sel('sort-name').should('not.contain', '↑').and('not.contain', '↓');
    cy.sel('product-sku').first().should('have.text', 'AUD-001');
    cy.sel('product-sku').last().should('have.text', 'WEA-011');
  });

  it('re-sorts the list after an inline stock edit', () => {
    cy.sel('sort-stock').click();
    cy.sel('product-name').first().should('have.text', 'Juniper Smart Ring');
    cy.row('products', 'p-10').find('[data-cy="stock-increment"]').click();
    cy.row('products', 'p-10').find('[data-cy="product-stock"]').should('have.text', '4');
    cy.row('products', 'p-10').find('[data-cy="stock-increment"]').click();
    cy.row('products', 'p-10').find('[data-cy="product-stock"]').should('have.text', '5');
    cy.sel('product-name').first().should('have.text', 'Ember Speaker');
    cy.sel('product-stock').first().should('have.text', '4');
  });

  it('opens the cheapest product straight from the sorted list', () => {
    cy.sel('sort-price').click();
    cy.sel('product-name').first().should('have.text', 'Marble Cable Kit');
    cy.sel('product-name').first().click();
    cy.location('pathname').should('equal', '/products/p-13');
    cy.sel('name').should('have.value', 'Marble Cable Kit');
    cy.sel('price').should('have.value', '19');
    cy.sel('back-to-products').click();
    cy.sel('products-row').should('have.length', 14);
    cy.sel('product-name').first().should('have.text', 'Aurora Headphones');
  });

  it('keeps the sort while a filter narrows the list', () => {
    cy.sel('sort-price').click();
    cy.sel('sort-price').click();
    cy.sel('category-filter').select('Audio');
    cy.sel('products-row').should('have.length', 4);
    cy.sel('product-price').then(($cells) => {
      expect(numbers($cells)).to.deep.equal([199, 179, 89, 39]);
    });
  });
});
