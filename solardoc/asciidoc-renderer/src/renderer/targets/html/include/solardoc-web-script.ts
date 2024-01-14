/**
 * SolarDoc web script which adds additional functionality to the SolarDoc HTML presentation.
 *
 * This script is injected into the HTML presentation when rendered. This is done by the {@link HTMLRenderer}.
 * @since 0.3.0
 */
export const solardocJS: string = `
// Ensure if this element is inside an iframe that the URL is taken from the iframe and not the parent window
const url = new URL(document.baseURI);
const params = url.searchParams;

function navigateToSpecifiedSlideIfSpecified() {
  const slide = params.get('slide');
  if (slide !== null) {
    // Create an a tag with the href of the slide and click it
    const a = document.createElement('a');
    a.href = \`#/\${slide}\`;
    a.click();
    console.log(\`[SolarDoc] Navigated to slide '\${slide}'\`);
  }
}

function disableInteractionIfDisabled() {
  if (params.get('disable-interaction') === 'true') {
    const body = document.getElementByTagName('body');
    if (!body) {
      return;
    }
    body.style.pointerEvents = 'none !important';
    console.log("[SolarDoc] Interaction disabled.");
  }
}

/**
 * Disables the scrollbar if the "disable-scrollbar" parameter is set to true.
 * @since 0.3.0
 */
function disableScrollbarIfDisabled() {
  if (params.get('disable-scrollbar') === 'true') {
    function disableScrollbar() {
      const scrollbars = document.getElementsByClassName('scrollbar');
      if (scrollbars.length === 0) {
        return;
      }
      
      for (let scrollbar of scrollbars) {
        // Delete the scrollbar
        scrollbar.remove();
      }
      console.log("[SolarDoc] Scrollbar disabled.");
    }
    disableScrollbar();
    
    // Ensure that the scrollbar is disabled when the window is resized
    document.addEventListener('resize', disableScrollbar);
  }
}

navigateToSpecifiedSlideIfSpecified();
disableScrollbarIfDisabled();
`;
