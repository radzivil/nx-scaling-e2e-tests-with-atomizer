describe('settings validation', () => {
  beforeEach(() => {
    cy.visitAsAdmin('/settings');
    cy.sel('settings-form').should('be.visible');
  });

  it('starts from the saved settings with no errors', () => {
    cy.sel('storeName').should('have.value', 'Nx Shop');
    cy.sel('supportEmail').should('have.value', 'support@nxshop.test');
    cy.sel('taxRate').should('have.value', '8');
    cy.sel('lowStockThreshold').should('have.value', '10');
    cy.sel('settings-saved').should('not.exist');
    cy.sel('error-storeName').should('not.exist');
  });

  it('requires a store name of a sensible length', () => {
    cy.sel('storeName').clear();
    cy.sel('save-settings').click();
    cy.sel('error-storeName').should('have.text', 'Store name is required');

    cy.sel('storeName').type('Nx');
    cy.sel('save-settings').click();
    cy.sel('error-storeName').should('have.text', 'Store name must be at least 3 characters');
    cy.sel('summary-store').should('have.text', 'Nx Shop');
  });

  it('requires a real looking support address', () => {
    cy.sel('supportEmail').clear().type('support-at-nxshop');
    cy.sel('save-settings').click();
    cy.sel('error-supportEmail').should('have.text', 'Support email must be a valid address');

    cy.sel('supportEmail').clear().type('support@nxshop');
    cy.sel('save-settings').click();
    cy.sel('error-supportEmail').should('have.text', 'Support email must be a valid address');

    cy.sel('supportEmail').clear();
    cy.sel('save-settings').click();
    cy.sel('error-supportEmail').should('have.text', 'Support email is required');
  });

  it('keeps the tax rate between 0 and 100', () => {
    cy.sel('taxRate').clear().type('101');
    cy.sel('save-settings').click();
    cy.sel('error-taxRate').should('have.text', 'Tax rate must be between 0 and 100');

    cy.sel('taxRate').clear().type('-1');
    cy.sel('save-settings').click();
    cy.sel('error-taxRate').should('have.text', 'Tax rate must be between 0 and 100');

    cy.sel('taxRate').clear().type('lots');
    cy.sel('save-settings').click();
    cy.sel('error-taxRate').should('have.text', 'Tax rate must be a number');
    cy.sel('summary-tax').should('have.text', '8%');
  });

  it('wants a whole number for the low stock threshold', () => {
    cy.sel('lowStockThreshold').clear().type('2.5');
    cy.sel('save-settings').click();
    cy.sel('error-lowStockThreshold').should('have.text', 'Threshold must be a whole number of 1 or more');

    cy.sel('lowStockThreshold').clear().type('0');
    cy.sel('save-settings').click();
    cy.sel('error-lowStockThreshold').should('have.text', 'Threshold must be a whole number of 1 or more');
  });

  it('reports every bad field in one go and saves nothing', () => {
    cy.sel('storeName').clear();
    cy.sel('supportEmail').clear().type('nope');
    cy.sel('taxRate').clear().type('250');
    cy.sel('lowStockThreshold').clear().type('-4');
    cy.sel('save-settings').click();

    cy.sel('error-storeName').should('be.visible');
    cy.sel('error-supportEmail').should('be.visible');
    cy.sel('error-taxRate').should('be.visible');
    cy.sel('error-lowStockThreshold').should('be.visible');
    cy.sel('settings-saved').should('not.exist');
    cy.sel('summary-store').should('have.text', 'Nx Shop');
    cy.sel('summary-threshold').should('have.text', '10 units');
  });

  it('clears the errors once the form is fixed', () => {
    cy.sel('storeName').clear();
    cy.sel('taxRate').clear().type('900');
    cy.sel('save-settings').click();
    cy.sel('error-storeName').should('be.visible');
    cy.sel('error-taxRate').should('be.visible');

    cy.sel('storeName').type('Nx Emporium');
    cy.sel('taxRate').clear().type('12');
    cy.sel('save-settings').click();
    cy.sel('settings-saved').should('have.text', 'Settings saved');
    cy.sel('error-storeName').should('not.exist');
    cy.sel('error-taxRate').should('not.exist');
    cy.sel('summary-tax').should('have.text', '12%');
  });
});
