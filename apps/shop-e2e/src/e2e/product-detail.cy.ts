describe('product detail', () => {
  it('shows the full product record', () => {
    cy.visit('/product/studio-headphones');
    cy.sel('page-title').should('have.text', 'Studio Headphones');
    cy.sel('product-category').should('have.text', 'Audio');
    cy.sel('product-price').should('have.text', '$249.00');
    cy.sel('product-stock').should('have.text', '8 in stock');
    cy.sel('product-blurb').should('not.be.empty');
  });

  it('steps the quantity up and down', () => {
    cy.visit('/product/ergo-mouse');
    cy.sel('qty-value').should('have.text', '1');
    cy.sel('qty-increment').click().click();
    cy.sel('qty-value').should('have.text', '3');
    cy.sel('qty-decrement').click();
    cy.sel('qty-value').should('have.text', '2');
  });

  it('never drops the quantity below one', () => {
    cy.visit('/product/laptop-stand');
    cy.sel('qty-decrement').click().click();
    cy.sel('qty-value').should('have.text', '1');
  });

  it('caps the quantity at the available stock', () => {
    cy.visit('/product/smart-watch');
    for (let i = 0; i < 8; i++) cy.sel('qty-increment').click();
    cy.sel('qty-value').should('have.text', '6');
  });

  it('adds the chosen quantity to the cart', () => {
    cy.visit('/product/usb-c-hub');
    cy.sel('qty-increment').click().click();
    cy.sel('add-to-cart').click();
    cy.sel('added-notice').should('be.visible');
    cy.sel('cart-count').should('have.text', '3');
  });

  it('handles an unknown product id', () => {
    cy.visit('/product/flying-car');
    cy.sel('not-found').should('be.visible');
    cy.sel('back-to-catalog').click();
    cy.sel('product-grid').should('exist');
  });
});
