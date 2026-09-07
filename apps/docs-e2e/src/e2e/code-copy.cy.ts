describe('copy to clipboard on code blocks', () => {
  it('labels every code block with its language', () => {
    cy.openArticle('parallel-execution');
    cy.sel('code-block').should('have.length', 3);
    cy.sel('code-language').then(($labels) => {
      expect([...$labels].map((el) => el.textContent)).to.deep.equal(['shell', 'shell', 'yaml']);
    });
    cy.sel('code-copy').should('have.length', 3).each(($button) => {
      cy.wrap($button).should('have.text', 'Copy');
    });
  });

  it('confirms the copy on the button itself', () => {
    cy.openArticle('caching');
    cy.sel('code-copy').first().click();
    cy.sel('code-copy').first().should('have.text', 'Copied');
  });

  it('goes back to the idle label', () => {
    cy.openArticle('caching');
    cy.sel('code-copy').first().click();
    cy.sel('code-copy').first().should('have.text', 'Copied');
    cy.sel('code-copy').first().should('have.text', 'Copy');
  });

  it('keeps the buttons independent of each other', () => {
    cy.openArticle('parallel-execution');
    cy.sel('code-copy').eq(1).click();
    cy.sel('code-copy').eq(1).should('have.text', 'Copied');
    cy.sel('code-copy').eq(0).should('have.text', 'Copy');
    cy.sel('code-copy').eq(2).should('have.text', 'Copy');
  });

  it('starts fresh on the next article', () => {
    cy.openArticle('running-tests');
    cy.sel('code-block').should('have.length', 3);
    cy.sel('code-copy').last().click();
    cy.sel('code-copy').last().should('have.text', 'Copied');
    cy.sel('next-article').click();
    cy.sel('article').should('have.attr', 'data-slug', 'caching');
    cy.sel('code-copy').should('have.length', 2).each(($button) => {
      cy.wrap($button).should('have.text', 'Copy');
    });
  });

  it('works on the json snippets too', () => {
    cy.openArticle('configuration');
    cy.get('[data-language="json"]').should('have.length', 1);
    cy.get('[data-language="json"]').find('[data-cy="code-body"]').should('contain.text', 'namedInputs');
    cy.get('[data-language="json"]').find('[data-cy="code-copy"]').click();
    cy.get('[data-language="json"]').find('[data-cy="code-copy"]').should('have.text', 'Copied');
  });
});
