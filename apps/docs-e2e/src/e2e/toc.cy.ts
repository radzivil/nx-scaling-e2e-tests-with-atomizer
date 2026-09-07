describe('in-page table of contents', () => {
  it('counts the sections of the article', () => {
    cy.openArticle('cli-commands');
    cy.sel('toc-title').should('have.text', 'On this page');
    cy.sel('toc-count').should('have.text', '4 sections');
    cy.sel('toc-item').should('have.length', 4);
  });

  it('mirrors the headings in document order', () => {
    cy.openArticle('caching');
    cy.sel('article-heading').then(($headings) => {
      const headings = [...$headings].map((el) => el.textContent);
      cy.sel('toc-item').then(($items) => {
        expect([...$items].map((el) => el.textContent)).to.deep.equal(headings);
      });
    });
  });

  it('points every entry at a heading that exists', () => {
    cy.openArticle('configuration');
    cy.sel('toc-item').each(($item) => {
      const target = $item.attr('data-target') as string;
      expect($item.attr('href')).to.equal(`/docs/configuration#${target}`);
      cy.get(`#${target}`).should('have.attr', 'data-cy', 'article-heading');
    });
  });

  it('scrolls to a section when an entry is clicked', () => {
    // A short viewport guarantees the article overflows, so the jump is real.
    cy.viewport(900, 400);
    cy.openArticle('cli-commands');
    cy.window().its('scrollY').should('equal', 0);
    cy.sel('toc-item').last().click();
    cy.location('pathname').should('equal', '/docs/cli-commands');
    cy.location('hash').should('equal', '#exit-codes');
    cy.sel('article').should('have.attr', 'data-slug', 'cli-commands');
    cy.window().its('scrollY').should('be.greaterThan', 0);
    cy.get('#exit-codes').should('be.visible');
    cy.get('#exit-codes').then(($heading) => {
      expect($heading[0].getBoundingClientRect().top).to.be.lessThan(200);
    });
  });

  it('rebuilds itself when you move to another article', () => {
    cy.openArticle('cli-commands');
    cy.sel('toc-count').should('have.text', '4 sections');
    cy.get('[data-cy="sidebar-link"][data-slug="quick-start"]').click();
    cy.sel('article').should('have.attr', 'data-slug', 'quick-start');
    cy.sel('toc-count').should('have.text', '3 sections');
    cy.sel('toc-item').first().should('have.attr', 'data-target', 'serve-the-app');
  });

  it('agrees with the headings of every article', () => {
    const slugs = [
      'installation',
      'quick-start',
      'project-structure',
      'running-tests',
      'caching',
      'parallel-execution',
      'cli-commands',
      'configuration',
    ];
    slugs.forEach((slug) => {
      cy.openArticle(slug);
      cy.sel('article-heading').then(($headings) => {
        const texts = [...$headings].map((el) => el.textContent);
        cy.sel('toc-count').should('have.text', `${texts.length} sections`);
        cy.sel('toc-item').should('have.length', texts.length);
        cy.sel('toc-item').then(($items) => {
          expect([...$items].map((el) => el.textContent)).to.deep.equal(texts);
        });
      });
    });
  });

  it('is absent while the article is loading', () => {
    cy.visit('/docs/caching');
    cy.sel('article-loading').should('be.visible');
    cy.sel('toc').should('not.exist');
    cy.sel('toc').should('be.visible');
  });
});
