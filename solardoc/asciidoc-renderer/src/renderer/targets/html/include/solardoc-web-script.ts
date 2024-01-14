/**
 * SolarDoc web script which adds additional functionality to the SolarDoc HTML presentation.
 *
 * This script is injected into the HTML presentation when rendered. This is done by the {@link HTMLRenderer}.
 * @since 0.3.0
 */
export const solardocJS: string = `
const params = new URL(window.location.toLocaleString()).searchParams;

/**
 * Disables the scrollbar if the "disable-scrollbar" parameter is set to true.
 * @since 0.3.0
 */
function disableScrollbarIfDisabled() {
  if (params.get('disable-scrollbar') === 'true') {
    const scrollbars = document.getElementsByClassName('scrollbar');
    if (scrollbars.length === 0) {
      console.warn("[SolarDoc] Could not find any scrollbars to disable.");
      return;
    }
    
    for (let scrollbar of scrollbars) {
      scrollbar.style.display = 'none';
    }
    console.log("[SolarDoc] Scrollbar disabled.");
  }
}

disableScrollbarIfDisabled();
`;
