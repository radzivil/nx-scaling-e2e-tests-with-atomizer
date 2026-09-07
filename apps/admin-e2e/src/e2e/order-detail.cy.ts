describe('order detail and status transitions', () => {
  it('shows the summary of a pending order', () => {
    cy.visitAsAdmin('/orders/NX-1001');
    cy.sel('page-title').should('have.text', 'Order NX-1001');
    cy.sel('order-customer').should('have.text', 'Ada Lovelace');
    cy.sel('order-placed').should('have.text', '05 Jan 2026');
    cy.sel('order-items').should('have.text', '3 items');
    cy.sel('order-total').should('have.text', '$237.00');
    cy.sel('order-status').should('have.text', 'pending');
  });

  it('lists the line items with their totals', () => {
    cy.visitAsAdmin('/orders/NX-1001');
    cy.sel('order-lines-row').should('have.length', 2);
    cy.sel('line-name').first().should('have.text', 'Aurora Headphones');
    cy.sel('line-price').first().should('have.text', '$199.00');
    cy.sel('line-total').first().should('have.text', '$199.00');
    cy.sel('line-name').last().should('have.text', 'Marble Cable Kit');
    cy.sel('line-qty').last().should('have.text', '2');
    cy.sel('line-total').last().should('have.text', '$38.00');
  });

  it('advances a pending order to paid', () => {
    cy.visitAsAdmin('/orders/NX-1001');
    cy.sel('advance-status').should('have.text', 'Mark as paid').click();
    cy.sel('advance-status').should('be.disabled').and('have.text', 'Updating…');
    cy.sel('order-status').should('have.text', 'paid');
    cy.sel('status-notice').should('have.text', 'Order marked as paid');
    cy.sel('status-event').should('have.length', 2);
    cy.sel('status-event').last().should('have.text', 'paid');
  });

  it('walks an order all the way to delivered', () => {
    cy.visitAsAdmin('/orders/NX-1005');
    cy.sel('order-status').should('have.text', 'pending');
    cy.sel('advance-status').click();
    cy.sel('order-status').should('have.text', 'paid');
    cy.sel('advance-status').should('have.text', 'Mark as shipped').click();
    cy.sel('order-status').should('have.text', 'shipped');
    cy.sel('advance-status').should('have.text', 'Mark as delivered').click();
    cy.sel('order-status').should('have.text', 'delivered');
    cy.sel('advance-status').should('not.exist');
    cy.sel('status-final').should('contain', 'This order is delivered');
    cy.sel('status-event').should('have.length', 4);
  });

  it('keeps a delivered order terminal', () => {
    cy.visitAsAdmin('/orders/NX-1004');
    cy.sel('order-status').should('have.text', 'delivered');
    cy.sel('advance-status').should('not.exist');
    cy.sel('cancel-order').should('not.exist');
    cy.sel('status-final').should('be.visible');
  });

  it('cancels a pending order', () => {
    cy.visitAsAdmin('/orders/NX-1010');
    cy.sel('cancel-order').click();
    cy.sel('order-status').should('have.text', 'cancelled');
    cy.sel('status-notice').should('have.text', 'Order cancelled');
    cy.sel('advance-status').should('not.exist');
    cy.sel('cancel-order').should('not.exist');

    cy.sel('back-to-orders').click();
    cy.sel('status-filter').select('cancelled');
    cy.sel('orders-row').should('have.length', 2);
  });

  it('says so when the reference is unknown', () => {
    cy.visitAsAdmin('/orders/NX-9999');
    cy.sel('not-found').should('contain', 'No order with reference "NX-9999"');
    cy.sel('back-to-orders').click();
    cy.location('pathname').should('equal', '/orders');
    cy.sel('orders-row').should('have.length', 12);
  });
});
