describe('user administration', () => {
  beforeEach(() => {
    cy.visitAsAdmin('/users');
    cy.sel('users').should('be.visible');
  });

  it('lists every account with its role', () => {
    cy.sel('users-row').should('have.length', 8);
    cy.sel('user-count').should('have.text', '8 users');
    cy.sel('user-name').first().should('have.text', 'Ada Admin');
    cy.sel('user-email').first().should('have.text', 'ada@nxshop.test');
    cy.sel('user-role').filter(':contains("admin")').should('have.length', 2);
    cy.sel('user-role').filter(':contains("editor")').should('have.length', 3);
    cy.sel('user-role').filter(':contains("viewer")').should('have.length', 3);
  });

  it('summarises how many accounts are active', () => {
    cy.sel('active-summary').should('have.text', '6 of 8 active (75%)');
    cy.sel('user-status').filter(':contains("Active")').should('have.length', 6);
    cy.sel('user-status').filter(':contains("Inactive")').should('have.length', 2);
  });

  it('filters by role', () => {
    cy.sel('role-filter').select('editor');
    cy.sel('users-row').should('have.length', 3);
    cy.sel('user-count').should('have.text', '3 users');
    cy.sel('user-role').each(($badge) => expect($badge.text()).to.equal('editor'));

    cy.sel('role-filter').select('admin');
    cy.sel('users-row').should('have.length', 2);
    cy.sel('role-filter').select('all');
    cy.sel('users-row').should('have.length', 8);
  });

  it('hides the deactivated accounts on request', () => {
    cy.sel('only-active').check();
    cy.sel('users-row').should('have.length', 6);
    cy.sel('user-status').each(($badge) => expect($badge.text()).to.equal('Active'));
    cy.sel('only-active').uncheck();
    cy.sel('users-row').should('have.length', 8);
  });

  it('combines the role filter with the active toggle', () => {
    cy.sel('role-filter').select('editor');
    cy.sel('only-active').check();
    cy.sel('users-row').should('have.length', 2);
    cy.sel('user-name').first().should('have.text', 'Cleo Clerk');
    cy.sel('user-name').last().should('have.text', 'Eli Editor');
    cy.sel('no-users').should('not.exist');
  });

  it('deactivates and reactivates an account', () => {
    cy.row('users', 'u-3').find('[data-cy="user-status"]').should('have.text', 'Active');
    cy.row('users', 'u-3').find('[data-cy="toggle-user"]').should('have.text', 'Deactivate').click();
    cy.row('users', 'u-3').find('[data-cy="user-status"]').should('have.text', 'Inactive');
    cy.sel('active-summary').should('have.text', '5 of 8 active (63%)');

    cy.row('users', 'u-3').find('[data-cy="toggle-user"]').should('have.text', 'Activate').click();
    cy.row('users', 'u-3').find('[data-cy="user-status"]').should('have.text', 'Active');
    cy.sel('active-summary').should('have.text', '6 of 8 active (75%)');
  });

  it('can stand every account down', () => {
    ['u-1', 'u-2', 'u-3', 'u-5', 'u-7', 'u-8'].forEach((id) => {
      cy.row('users', id).find('[data-cy="toggle-user"]').click();
      cy.row('users', id).find('[data-cy="user-status"]').should('have.text', 'Inactive');
    });
    cy.sel('active-summary').should('have.text', '0 of 8 active (0%)');
    cy.sel('user-status').filter(':contains("Active")').should('have.length', 0);
    cy.sel('only-active').check();
    cy.sel('no-users').should('be.visible');
  });

  it('keeps a deactivation after a reload and empties a filter that no longer matches', () => {
    cy.row('users', 'u-1').find('[data-cy="toggle-user"]').click();
    cy.row('users', 'u-1').find('[data-cy="user-status"]').should('have.text', 'Inactive');
    cy.row('users', 'u-8').find('[data-cy="toggle-user"]').click();
    cy.row('users', 'u-8').find('[data-cy="user-status"]').should('have.text', 'Inactive');
    cy.sel('active-summary').should('have.text', '4 of 8 active (50%)');

    cy.reload();
    cy.sel('users').should('be.visible');
    cy.sel('active-summary').should('have.text', '4 of 8 active (50%)');

    cy.sel('role-filter').select('admin');
    cy.sel('only-active').check();
    cy.sel('no-users').should('be.visible');
    cy.sel('user-count').should('have.text', '0 users');
  });
});
