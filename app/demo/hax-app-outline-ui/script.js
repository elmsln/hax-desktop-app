window.addEventListener('WebComponentsReady', async (e) => {
  const outlineUi = document.querySelector('#outline-ui');

  /**
   * Load the outline
   */
  const getOutline = async () => {
    const outline = await fetch('../assets/outline.json').then((res) => res.json());
    return outline;
  }
  const outline = await getOutline();
  outlineUi.setData(outline);

  /**
   * Set active Page
   */
  const firstPage = outline[0];
  outlineUi.setAttribute('active-page', firstPage.id);

  /**
   * Listen for menu toggle
   */
  window.addEventListener('menu-toggle', (e) => {
    outlineUi.opened = !outlineUi.opened;
  });
});