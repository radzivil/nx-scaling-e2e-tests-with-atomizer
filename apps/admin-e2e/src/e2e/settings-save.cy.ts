const fillSettings = (name: string, email: string, tax: string, threshold: string) => {
  cy.sel('storeName').clear().type(name);
  cy.sel('supportEmail').clear().type(email);
  cy.sel('taxRate').clear().type(tax);
  cy.sel('lowStockThreshold').clear().type(threshold);
};

describe('saving settings', () => {
  beforeEach(() => {
    cy.visitAsAdmin('/settings');
    cy.sel('settings-form').should('be.visible');
  });

  it('says nothing until the form is submitted', () => {
    cy.sel('storeName').clear().type('Nx Emporium');
    cy.sel('settings-saved').should('not.exist');
    cy.sel('summary-store').should('have.text', 'Nx Shop');
  });

  it('saves the whole form and updates the summary', () => {
    fillSettings('Nx Emporium', 'help@nxshop.test', '12', '6');
    cy.sel('save-settings').click();
    cy.sel('save-settings').should('be.disabled').and('have.text', 'Saving…');
    cy.sel('settings-saved').should('have.text', 'Settings saved');

    cy.sel('summary-store').should('have.text', 'Nx Emporium');
    cy.sel('summary-support').should('have.text', 'help@nxshop.test');
    cy.sel('summary-tax').should('have.text', '12%');
    cy.sel('summary-threshold').should('have.text', '6 units');
  });

  it('renames the back office in the nav bar', () => {
    fillSettings('Nx Emporium', 'help@nxshop.test', '12', '6');
    cy.sel('save-settings').click();
    cy.sel('settings-saved').should('exist');
    cy.sel('brand').should('have.text', 'Nx Emporium Admin');
  });

  it('survives a reload', () => {
    fillSettings('Nx Emporium', 'help@nxshop.test', '12', '6');
    cy.sel('save-settings').click();
    cy.sel('settings-saved').should('exist');

    cy.reload();
    cy.sel('settings-form').should('be.visible');
    cy.sel('storeName').should('have.value', 'Nx Emporium');
    cy.sel('supportEmail').should('have.value', 'help@nxshop.test');
    cy.sel('taxRate').should('have.value', '12');
    cy.sel('lowStockThreshold').should('have.value', '6');
    cy.sel('settings-saved').should('not.exist');
  });

  it('changes how many products the dashboard calls low on stock', () => {
    cy.sel('lowStockThreshold').clear().type('5');
    cy.sel('save-settings').click();
    cy.sel('settings-saved').should('exist');

    cy.sel('nav-dashboard').click();
    cy.sel('stat-low-stock').should('have.text', '2');
    cy.sel('stat-low-stock-detail').should('have.text', 'below 5 units');
    cy.sel('low-stock-row').should('have.length', 2);

    cy.sel('nav-products').click();
    cy.sel('low-stock-flag').should('have.length', 2);
  });

  it('trims the whitespace it stores', () => {
    cy.sel('storeName').clear().type('   Nx Depot   ');
    cy.sel('supportEmail').clear().type('  ops@nxshop.test  ');
    cy.sel('save-settings').click();
    cy.sel('settings-saved').should('exist');
    cy.sel('summary-store').should('have.text', 'Nx Depot');
    cy.sel('summary-support').should('have.text', 'ops@nxshop.test');
    cy.sel('brand').should('have.text', 'Nx Depot Admin');
  });

  it('restores the defaults', () => {
    fillSettings('Nx Emporium', 'help@nxshop.test', '12', '6');
    cy.sel('save-settings').click();
    cy.sel('summary-tax').should('have.text', '12%');

    cy.sel('reset-settings').click();
    cy.sel('storeName').should('have.value', 'Nx Shop');
    cy.sel('taxRate').should('have.value', '8');
    cy.sel('lowStockThreshold').should('have.value', '10');
    cy.sel('summary-threshold').should('have.text', '10 units');
    cy.sel('brand').should('have.text', 'Nx Shop Admin');
  });
});
