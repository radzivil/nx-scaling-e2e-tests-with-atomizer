describe('article pages', () => {
  it('shows a loading state before the content arrives', () => {
    cy.visit('/docs/caching');
    cy.sel('article-loading').should('be.visible');
    cy.sel('article').should('be.visible');
    cy.sel('article-loading').should('not.exist');
  });

  it('renders the title, the category and the summary', () => {
    cy.openArticle('caching');
    cy.sel('article-title').should('have.text', 'Caching Explained');
    cy.sel('article-category').should('have.text', 'Guides');
    cy.sel('article-summary').should('contain.text', 'computation cache');
  });

  it('renders every block of the article body', () => {
    cy.openArticle('caching');
    cy.sel('article-heading').should('have.length', 4);
    cy.sel('article-paragraph').should('have.length', 5);
    cy.sel('code-block').should('have.length', 2);
    cy.sel('code-body').first().should('contain.text', 'npx nx build shop');
  });

  it('gives every heading an id derived from its text', () => {
    cy.openArticle('cli-commands');
    cy.sel('article-heading').should('have.length', 4);
    cy.sel('article-heading').each(($heading) => {
      const expected = ($heading.text() ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      cy.wrap($heading).should('have.attr', 'id', expected);
    });
  });

  it('thanks you for positive feedback', () => {
    cy.openArticle('running-tests');
    cy.sel('feedback-thanks').should('not.exist');
    cy.sel('feedback-yes').click();
    cy.sel('feedback-sending').should('be.visible');
    cy.sel('feedback-yes').should('be.disabled');
    cy.sel('feedback-thanks').should('have.text', 'Thanks — glad it helped.');
    cy.sel('feedback-yes').should('not.exist');
  });

  it('acknowledges negative feedback differently', () => {
    cy.openArticle('running-tests');
    cy.sel('feedback-no').click();
    cy.sel('feedback-thanks').should('have.text', 'Thanks — we will make this page clearer.');
  });

  it('resets the feedback widget on the next article', () => {
    cy.openArticle('installation');
    cy.sel('feedback-yes').click();
    cy.sel('feedback-thanks').should('be.visible');
    cy.sel('next-article').click();
    cy.sel('article').should('have.attr', 'data-slug', 'quick-start');
    cy.sel('feedback-thanks').should('not.exist');
    cy.sel('feedback-yes').should('be.enabled');
  });
});
