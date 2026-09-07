const placeOrder = () => {
  cy.visit('/checkout');
  cy.sel('fullName').type('Ada Lovelace');
  cy.sel('address').type('1 Analytical Way');
  cy.sel('city').type('Singapore');
  cy.sel('postcode').type('018956');
  cy.sel('place-order').click();
  cy.sel('order-reference').should('be.visible');
};

describe('order history', () => {
  it('starts empty', () => {
    cy.visit('/orders');
    cy.sel('empty-orders').should('be.visible');
    cy.sel('order-list').should('not.exist');
  });

  it('links back to the catalog when empty', () => {
    cy.visit('/orders');
    cy.sel('back-to-catalog').click();
    cy.sel('product-grid').should('exist');
  });

  it('records a placed order', () => {
    cy.addToCart('sleep-ring');
    cy.login();
    placeOrder();
    cy.visit('/orders');
    cy.sel('order-row').should('have.length', 1);
    cy.sel('order-items').should('have.text', '1 items');
    cy.sel('order-total').should('have.text', '$179.00');
  });

  it('counts every unit in the order', () => {
    cy.addToCart('noise-meter', 3);
    cy.addToCart('laptop-stand', 2);
    cy.login();
    placeOrder();
    cy.visit('/orders');
    cy.sel('order-items').should('have.text', '5 items');
  });

  it('lists the newest order first', () => {
    cy.addToCart('ergo-mouse');
    cy.login();
    placeOrder();
    cy.addToCart('desk-speaker');
    placeOrder();
    cy.visit('/orders');
    cy.sel('order-row').should('have.length', 2);
    cy.sel('order-total').first().should('have.text', '$98.99');
  });

  it('keeps the history across a reload', () => {
    cy.addToCart('fitness-band');
    cy.login();
    placeOrder();
    cy.visit('/orders');
    cy.reload();
    cy.sel('order-row').should('have.length', 1);
  });
});
