describe('cart totals', () => {
  it('charges flat shipping under the free-shipping threshold', () => {
    cy.addToCart('laptop-stand');
    cy.visit('/cart');
    cy.sel('subtotal').should('have.text', '$39.00');
    cy.sel('discount').should('have.text', '−$0.00');
    cy.sel('shipping').should('have.text', '$9.99');
    cy.sel('total').should('have.text', '$48.99');
  });

  it('gives free shipping at exactly the threshold', () => {
    cy.addToCart('noise-meter', 4);
    cy.visit('/cart');
    cy.sel('subtotal').should('have.text', '$100.00');
    cy.sel('shipping').should('have.text', 'Free');
    cy.sel('total').should('have.text', '$100.00');
  });

  it('applies the 10% bulk discount over $200', () => {
    cy.addToCart('wireless-earbuds', 2);
    cy.visit('/cart');
    cy.sel('subtotal').should('have.text', '$259.00');
    cy.sel('discount').should('have.text', '−$25.90');
    cy.sel('shipping').should('have.text', 'Free');
    cy.sel('total').should('have.text', '$233.10');
  });

  it('scales the discount with the cart, not the line count', () => {
    cy.addToCart('mechanical-keyboard', 2);
    cy.addToCart('ergo-mouse', 2);
    cy.visit('/cart');
    cy.sel('subtotal').should('have.text', '$436.00');
    cy.sel('discount').should('have.text', '−$43.60');
    cy.sel('total').should('have.text', '$392.40');
  });

  it('recalculates when a quantity changes', () => {
    cy.addToCart('smart-watch');
    cy.visit('/cart');
    cy.sel('total').should('have.text', '$199.00');
    cy.sel('line-increment').click();
    cy.sel('line-qty').should('have.text', '2');
    cy.sel('subtotal').should('have.text', '$398.00');
    cy.sel('discount').should('have.text', '−$39.80');
    cy.sel('total').should('have.text', '$358.20');
  });

  it('empties when the last line is removed', () => {
    cy.addToCart('usb-c-hub');
    cy.visit('/cart');
    cy.sel('line-remove').click();
    cy.sel('empty-cart').should('be.visible');
    cy.sel('cart-count').should('have.text', '0');
  });
});
