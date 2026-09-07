describe('checkout validation', () => {
  beforeEach(() => {
    cy.addToCart('monitor-arm');
    cy.login();
    cy.visit('/checkout');
    cy.sel('checkout-form').should('be.visible');
  });

  it('reports every missing field at once', () => {
    cy.sel('place-order').click();
    cy.sel('error-fullName').should('have.text', 'Full name is required');
    cy.sel('error-address').should('have.text', 'Address is required');
    cy.sel('error-city').should('have.text', 'City is required');
    cy.sel('error-postcode').should('have.text', 'Postcode must be 6 digits');
  });

  it('stays on the checkout page when invalid', () => {
    cy.sel('place-order').click();
    cy.location('pathname').should('equal', '/checkout');
    cy.sel('order-reference').should('not.exist');
  });

  it('rejects a postcode that is not six digits', () => {
    cy.sel('fullName').type('Ada Lovelace');
    cy.sel('address').type('1 Analytical Way');
    cy.sel('city').type('Singapore');
    cy.sel('postcode').type('0189');
    cy.sel('place-order').click();
    cy.sel('error-postcode').should('be.visible');
  });

  it('rejects a non-numeric postcode', () => {
    cy.sel('fullName').type('Ada Lovelace');
    cy.sel('address').type('1 Analytical Way');
    cy.sel('city').type('Singapore');
    cy.sel('postcode').type('ABC123');
    cy.sel('place-order').click();
    cy.sel('error-postcode').should('be.visible');
  });

  it('treats whitespace as missing', () => {
    cy.sel('fullName').type('   ');
    cy.sel('address').type('   ');
    cy.sel('city').type('   ');
    cy.sel('postcode').type('018956');
    cy.sel('place-order').click();
    cy.sel('error-fullName').should('be.visible');
    cy.sel('error-address').should('be.visible');
    cy.sel('error-city').should('be.visible');
    cy.sel('error-postcode').should('not.exist');
  });

  it('clears the errors once the form is corrected', () => {
    cy.sel('place-order').click();
    cy.sel('error-fullName').should('be.visible');
    cy.sel('fullName').type('Ada Lovelace');
    cy.sel('address').type('1 Analytical Way');
    cy.sel('city').type('Singapore');
    cy.sel('postcode').type('018956');
    cy.sel('place-order').click();
    cy.sel('order-reference').should('be.visible');
  });
});
