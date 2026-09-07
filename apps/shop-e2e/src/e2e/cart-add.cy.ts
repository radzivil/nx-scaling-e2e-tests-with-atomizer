describe('adding items to the cart', () => {
  it('adds a single product', () => {
    cy.addToCart('desk-speaker');
    cy.sel('cart-count').should('have.text', '1');
    cy.sel('nav-cart').click();
    cy.sel('cart-line').should('have.length', 1);
    cy.sel('line-name').should('have.text', 'Desk Speaker');
    cy.sel('line-qty').should('have.text', '1');
  });

  it('keeps separate products on separate lines', () => {
    cy.addToCart('desk-speaker');
    cy.addToCart('ergo-mouse');
    cy.addToCart('laptop-stand');
    cy.sel('cart-count').should('have.text', '3');
    cy.sel('nav-cart').click();
    cy.sel('cart-line').should('have.length', 3);
  });

  it('merges a repeated product into one line', () => {
    cy.addToCart('fitness-band', 2);
    cy.addToCart('fitness-band', 3);
    cy.sel('cart-count').should('have.text', '5');
    cy.sel('nav-cart').click();
    cy.sel('cart-line').should('have.length', 1);
    cy.sel('line-qty').should('have.text', '5');
  });

  it('survives a page reload', () => {
    cy.addToCart('monitor-arm', 2);
    cy.visit('/cart');
    cy.sel('line-qty').should('have.text', '2');
    cy.reload();
    cy.sel('line-qty').should('have.text', '2');
    cy.sel('cart-count').should('have.text', '2');
  });

  it('shows the per-line total', () => {
    cy.addToCart('noise-meter', 4);
    cy.visit('/cart');
    cy.sel('line-price').should('have.text', '$25.00');
    cy.sel('line-total').should('have.text', '$100.00');
  });
});
