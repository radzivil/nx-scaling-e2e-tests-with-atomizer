describe('search with nothing to show', () => {
  it('invites you to type when there is no query', () => {
    cy.visit('/search');
    cy.sel('page-title').should('have.text', 'Search');
    cy.sel('search-prompt').should('contain.text', 'Type a word or two');
    cy.sel('result-count').should('not.exist');
    cy.sel('search-results').should('not.exist');
  });

  it('says so when nothing matches', () => {
    cy.searchFor('typewriter');
    cy.sel('result-count').should('have.text', '0 results for "typewriter"');
    cy.sel('search-empty').should('contain.text', 'No articles match "typewriter".');
    cy.sel('search-results').should('not.exist');
  });

  it('clears back to the prompt', () => {
    cy.searchFor('typewriter');
    cy.sel('clear-search').click();
    cy.sel('search-prompt').should('be.visible');
    cy.sel('search-empty').should('not.exist');
    cy.sel('result-count').should('not.exist');
    cy.location('search').should('equal', '');
    cy.sel('search-input').should('have.value', '');
  });

  it('treats a whitespace query as no query at all', () => {
    cy.visit('/search');
    cy.sel('search-input').type('   ');
    cy.sel('search-submit').click();
    cy.sel('search-prompt').should('be.visible');
    cy.sel('result-count').should('not.exist');
  });

  it('recovers when you search again for something real', () => {
    cy.searchFor('typewriter');
    cy.sel('search-empty').should('be.visible');
    cy.sel('search-input').clear().type('doctor');
    cy.sel('search-submit').click();
    cy.sel('search-empty').should('not.exist');
    cy.sel('result-count').should('have.text', '1 result for "doctor"');
    cy.sel('search-result-title').should('have.text', 'Installation');
  });

  it('stays empty for anything outside the corpus', () => {
    ['typewriter', 'kubernetes', 'zzzzz', 'photosynthesis'].forEach((term) => {
      cy.searchFor(term);
      cy.sel('result-count').should('have.text', `0 results for "${term}"`);
      cy.sel('search-empty').should('contain.text', `No articles match "${term}".`);
      cy.sel('search-results').should('not.exist');
    });
  });

  it('reads the query straight out of the url', () => {
    cy.visit('/search?q=typewriter');
    cy.sel('search-input').should('have.value', 'typewriter');
    cy.sel('search-empty').should('be.visible');
    cy.visit('/search?q=remote%20cache');
    cy.sel('result-count').should('have.text', '1 result for "remote cache"');
  });
});
