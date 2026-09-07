const ADDRESS = { fullName: 'Ada Lovelace', address: '1 Analytical Way', city: 'Singapore', postcode: '018956' };

const fillAddress = () => {
  cy.sel('fullName').type(ADDRESS.fullName);
  cy.sel('address').type(ADDRESS.address);
  cy.sel('city').type(ADDRESS.city);
  cy.sel('postcode').type(ADDRESS.postcode);
};

describe('checkout happy path', () => {
  beforeEach(() => {
    cy.addToCart('wireless-earbuds', 2);
    cy.login();
  });

  it('carries the discounted cart total into checkout', () => {
    cy.visit('/checkout');
    cy.sel('subtotal').should('have.text', '$259.00');
    cy.sel('discount').should('have.text', '−$25.90');
    cy.sel('total').should('have.text', '$233.10');
  });

  it('places the order and confirms the charged amount', () => {
    cy.visit('/checkout');
    fillAddress();
    cy.sel('place-order').click();
    cy.sel('place-order').should('be.disabled').and('have.text', 'Placing order…');
    cy.sel('order-reference').invoke('text').should('match', /^NX-[A-Z0-9]{6}$/);
    cy.sel('order-total').should('have.text', '$233.10');
  });

  it('empties the cart once the order is placed', () => {
    cy.visit('/checkout');
    fillAddress();
    cy.sel('place-order').click();
    cy.sel('order-reference').should('be.visible');
    cy.sel('cart-count').should('have.text', '0');
    cy.sel('nav-cart').click();
    cy.sel('empty-cart').should('be.visible');
  });

  it('links straight through to the order history', () => {
    cy.visit('/checkout');
    fillAddress();
    cy.sel('place-order').click();
    cy.sel('order-reference').invoke('text').as('reference');
    cy.sel('view-orders').click();
    cy.location('pathname').should('equal', '/orders');
    cy.get('@reference').then((reference) => {
      cy.sel('order-reference').should('have.text', reference);
    });
  });

  it('refuses to check out an empty cart', () => {
    cy.visit('/cart');
    cy.sel('line-remove').click();
    cy.sel('empty-cart').should('be.visible');
    cy.visit('/checkout');
    cy.sel('empty-cart').should('be.visible');
    cy.sel('place-order').should('not.exist');
  });
});
