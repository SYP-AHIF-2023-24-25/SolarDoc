declare module "@asciidoctor/reveal.js" {
  /**
   * Registers the reveal.js converter with the asciidoctor instance. It will automatically find the
   * {@link Asciidoctor asciidoctor} library and register the converter with it.
   */
  function register(): void;

  /**
   * Returns the version of the reveal.js converter.
   */
  function getVersion(): string;

  /**
   * The facade for the reveal.js converter.
   */
  const facade: { register: typeof register, getVersion: typeof getVersion };

  export default facade;
}
