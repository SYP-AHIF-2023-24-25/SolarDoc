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

navigateToSpecifiedSlideIfSpecified();
`;
