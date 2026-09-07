describe('changelog', () => {
  beforeEach(() => {
    cy.visit('/changelog');
    cy.sel('page-title').should('have.text', 'Changelog');
    cy.sel('changelog-loading').should('not.exist');
  });

  it('lists every release, newest first', () => {
    cy.sel('release').should('have.length', 5);
    cy.sel('release-version').then(($versions) => {
      expect([...$versions].map((el) => el.textContent)).to.deep.equal(['3.2.0', '3.1.0', '3.0.0', '2.4.1', '2.4.0']);
    });
    cy.sel('release-date').first().should('have.text', '2026-08-14');
    cy.sel('filter-count').should('have.text', '16 changes in 5 releases');
  });

  it('tags every change with its type', () => {
    cy.sel('change-item').should('have.length', 16);
    cy.sel('change-item').each(($item) => {
      const type = $item.attr('data-type') as string;
      expect(['feature', 'fix', 'breaking']).to.include(type);
      cy.wrap($item).find('[data-cy="change-type"]').should('have.text', type);
      cy.wrap($item).find('[data-cy="change-text"]').should('not.have.text', '');
    });
  });

  it('filters down to the new features', () => {
    cy.sel('filter-feature').click();
    cy.sel('filter-feature').should('have.attr', 'aria-pressed', 'true');
    cy.sel('filter-all').should('have.attr', 'aria-pressed', 'false');
    cy.sel('change-item').should('have.length', 6);
    cy.sel('release').should('have.length', 4);
    cy.sel('filter-count').should('have.text', '6 changes in 4 releases');
    cy.get('[data-cy="change-item"][data-type="fix"]').should('not.exist');
  });

  it('filters down to the breaking changes', () => {
    cy.sel('filter-breaking').click();
    cy.sel('change-item').should('have.length', 3);
    cy.sel('release').should('have.length', 2);
    cy.sel('filter-count').should('have.text', '3 changes in 2 releases');
    cy.sel('release-version').then(($versions) => {
      expect([...$versions].map((el) => el.textContent)).to.deep.equal(['3.1.0', '3.0.0']);
    });
  });

  it('filters down to the fixes', () => {
    cy.sel('filter-fix').click();
    cy.sel('change-item').should('have.length', 7);
    cy.sel('release').should('have.length', 4);
    cy.sel('filter-count').should('have.text', '7 changes in 4 releases');
    cy.get('[data-cy="change-item"][data-type="breaking"]').should('not.exist');
  });

  it('gives the same answer after a reload', () => {
    const expected: [string, number, number][] = [
      ['feature', 6, 4],
      ['fix', 7, 4],
      ['breaking', 3, 2],
      ['all', 16, 5],
    ];
    expected.forEach(([type, changes, releases]) => {
      cy.reload();
      cy.sel('changelog-loading').should('not.exist');
      cy.sel(`filter-${type}`).click();
      cy.sel('change-item').should('have.length', changes);
      cy.sel('release').should('have.length', releases);
      cy.sel('filter-count').should('have.text', `${changes} changes in ${releases} releases`);
    });
  });

  it('restores the whole list', () => {
    cy.sel('filter-breaking').click();
    cy.sel('change-item').should('have.length', 3);
    cy.sel('filter-all').click();
    cy.sel('filter-all').should('have.attr', 'aria-pressed', 'true');
    cy.sel('change-item').should('have.length', 16);
    cy.sel('release').should('have.length', 5);
    cy.sel('changelog-empty').should('not.exist');
  });
});
