const numbers = ($cells: JQuery<HTMLElement>) => [...$cells].map((el) => Number(el.textContent?.replace('$', '')));

describe('order list', () => {
  beforeEach(() => {
    cy.visitAsAdmin('/orders');
    cy.sel('orders').should('be.visible');
  });

  it('lists every order, newest first', () => {
    cy.sel('orders-row').should('have.length', 12);
    cy.sel('order-count').should('have.text', '12 orders');
    cy.sel('order-reference').first().should('have.text', 'NX-1012');
    cy.sel('order-reference').last().should('have.text', 'NX-1001');
    cy.sel('filtered-revenue').should('have.text', '$2291.00');
  });

  it('filters down to one status at a time', () => {
    cy.sel('status-filter').select('pending');
    cy.sel('orders-row').should('have.length', 3);
    cy.sel('order-status').each(($badge) => expect($badge.text()).to.equal('pending'));
    cy.sel('filtered-revenue').should('have.text', '$541.00');

    cy.sel('status-filter').select('delivered');
    cy.sel('orders-row').should('have.length', 2);
    cy.sel('filtered-revenue').should('have.text', '$426.00');

    cy.sel('status-filter').select('cancelled');
    cy.sel('orders-row').should('have.length', 1);
    cy.sel('order-count').should('have.text', '1 order');
    cy.sel('filtered-revenue').should('have.text', '$0.00');
  });

  it('goes back to everything', () => {
    cy.sel('status-filter').select('shipped');
    cy.sel('orders-row').should('have.length', 3);
    cy.sel('status-filter').select('all');
    cy.sel('orders-row').should('have.length', 12);
  });

  it('expands a row to show its line items', () => {
    cy.sel('order-lines').should('not.exist');
    cy.row('orders', 'NX-1001').find('[data-cy="toggle-lines"]').click();
    cy.row('orders', 'NX-1001').find('[data-cy="order-line"]').should('have.length', 2);
    cy.row('orders', 'NX-1001').find('[data-cy="line-name"]').first().should('have.text', 'Aurora Headphones');
    cy.row('orders', 'NX-1001').find('[data-cy="line-qty"]').last().should('have.text', '2');
    cy.row('orders', 'NX-1001').find('[data-cy="line-total"]').last().should('have.text', '$38.00');
  });

  it('collapses the row again and only ever expands one', () => {
    cy.row('orders', 'NX-1001').find('[data-cy="toggle-lines"]').click();
    cy.sel('order-lines').should('have.length', 1);
    cy.row('orders', 'NX-1005').find('[data-cy="toggle-lines"]').click();
    cy.sel('order-lines').should('have.length', 1);
    cy.row('orders', 'NX-1005').find('[data-cy="order-line"]').should('have.length', 1);
    cy.row('orders', 'NX-1005').find('[data-cy="toggle-lines"]').should('have.text', 'Hide').click();
    cy.sel('order-lines').should('not.exist');
  });

  it('sorts by total in both directions', () => {
    cy.sel('sort-total').click();
    cy.sel('order-total').first().should('have.text', '$100.00');
    cy.sel('order-total').then(($cells) => {
      const values = numbers($cells);
      expect(values).to.deep.equal([...values].sort((a, b) => a - b));
    });

    cy.sel('sort-total').click();
    cy.sel('order-total').first().should('have.text', '$398.00');
    cy.sel('order-reference').first().should('have.text', 'NX-1011');
  });

  it('sorts by the date it was placed', () => {
    cy.sel('sort-placedAt').click();
    cy.sel('order-reference').first().should('have.text', 'NX-1001');
    cy.sel('order-placed').first().should('have.text', '05 Jan 2026');
    cy.sel('sort-placedAt').click();
    cy.sel('order-reference').first().should('have.text', 'NX-1012');
    cy.sel('order-placed').first().should('have.text', '16 Jan 2026');
  });

  it('shows line items that add up to the order total', () => {
    ['NX-1001', 'NX-1003', 'NX-1007', 'NX-1010', 'NX-1012'].forEach((reference) => {
      cy.row('orders', reference).find('[data-cy="toggle-lines"]').click();
      cy.row('orders', reference).find('[data-cy="order-line"]').should('have.length.at.least', 1);
      cy.row('orders', reference)
        .find('[data-cy="line-total"]')
        .then(($cells) => {
          const sum = numbers($cells).reduce((total, value) => total + value, 0);
          cy.row('orders', reference).find('[data-cy="order-total"]').should('have.text', `$${sum.toFixed(2)}`);
        });
    });
  });

  it('opens an order from its reference', () => {
    cy.row('orders', 'NX-1008').find('[data-cy="order-reference"]').click();
    cy.location('pathname').should('equal', '/orders/NX-1008');
    cy.sel('order-customer').should('have.text', 'Margaret Hamilton');
    cy.sel('order-total').should('have.text', '$258.00');
  });
});
