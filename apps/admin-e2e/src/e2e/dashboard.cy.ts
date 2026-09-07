describe('dashboard summary', () => {
  beforeEach(() => {
    cy.visitAsAdmin('/');
    cy.sel('stat-tiles').should('be.visible');
  });

  it('shows the revenue of every order that was not cancelled', () => {
    cy.sel('stat-revenue').should('have.text', '$2291.00');
    cy.sel('stat-revenue-detail').should('have.text', '11 billable orders');
  });

  it('counts every order and the share that survived', () => {
    cy.sel('stat-orders').should('have.text', '12');
    cy.sel('stat-orders-detail').should('have.text', '92% not cancelled');
  });

  it('counts the products under the low stock threshold', () => {
    cy.sel('stat-low-stock').should('have.text', '5');
    cy.sel('stat-low-stock-detail').should('have.text', 'below 10 units');
    cy.sel('low-stock-row').should('have.length', 5);
  });

  it('counts the active accounts', () => {
    cy.sel('stat-active-users').should('have.text', '6');
    cy.sel('stat-active-users-detail').should('have.text', '75% of 8 accounts');
  });

  it('lists the five newest orders, newest first', () => {
    cy.sel('recent-orders-row').should('have.length', 5);
    cy.sel('recent-reference').first().should('have.text', 'NX-1012');
    cy.sel('recent-reference').last().should('have.text', 'NX-1008');
    cy.sel('recent-placed').first().should('have.text', '16 Jan 2026');
    cy.sel('recent-total').first().should('have.text', '$167.00');
  });

  it('orders the low stock table by how little is left', () => {
    cy.sel('low-stock-name').first().should('have.text', 'Juniper Smart Ring');
    cy.sel('low-stock-qty').first().should('have.text', '3 units');
    cy.sel('low-stock-name').last().should('have.text', 'Lumen Ring Light');
    cy.sel('low-stock-qty').last().should('have.text', '9 units');
  });

  it('re-fetches the numbers on refresh', () => {
    cy.sel('refresh-stats').click();
    cy.sel('loading').should('be.visible');
    cy.sel('stat-revenue').should('have.text', '$2291.00');
  });

  it('links through to the full order and product lists', () => {
    cy.sel('view-all-orders').click();
    cy.location('pathname').should('equal', '/orders');
    cy.sel('orders-row').should('have.length', 12);

    cy.sel('nav-dashboard').click();
    cy.sel('view-all-products').click();
    cy.location('pathname').should('equal', '/products');
    cy.sel('products-row').should('have.length', 14);
  });
});
