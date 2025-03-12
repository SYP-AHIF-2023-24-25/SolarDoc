/* istanbul ignore file */
import URI from 'urijs'

export const create = (page: any) => new Reveal(page)

class Reveal {
  private page: any

  constructor(page: any) {
    this.page = page
  }

  getName() {
    return 'Reveal JS'
  }

  isActive() {
    // eslint-disable-next-line no-unused-vars
    return this.page.evaluate(() => {
      if (typeof Reveal === 'undefined') {
        return false
      }
      // @ts-ignore
      if (!(typeof Reveal.availableFragments === 'function')) {
        console.log("[Reveal] Reveal JS plugin isn't compatible with reveal.js version < 2.4.0")
        return false
      }
      return true
    })
  }

  configure() {
    return this.page.evaluate(
      (fragments: any) => {
        // @ts-ignore
        Reveal.configure({
          controls: false,
          progress: false,
          fragments: fragments,
          transition: 'none',
        })

        // This is a workaround to disable the open button of the RevealMenu plugin.
        // See the following issue for more details: https://github.com/denehyg/reveal.js-menu/issues/99
        // eslint-disable-next-line no-undef
        const menuOpenButtons = document.getElementsByClassName('slide-menu-button')
        for (let i = 0; i < menuOpenButtons.length; i++) {
          // @ts-ignore
          menuOpenButtons[i].style.display = 'none'
        }
      },
      // It seems passing 'fragments=true' in the URL query string does not take precedence
      // over globally configured 'fragments' and prevents from being able to toggle fragments
      // with ...?fragments=<true|false> so we work around that by parsing the page query string
      (URI(this.page.url()).query(true)['fragments'] || 'false').toLowerCase() === 'true',
    )
  }

  slideCount() {
    // TODO: the getTotalSlides API does not report the number of slides accurately
    // as it does not take stacks and some index-less fragments into account
    // getTotalSlides API is only available starting reveal.js version 3.0.0
    // @ts-ignore
    // eslint-disable-next-line no-unused-vars
    return this.page.evaluate((_: any) =>
      // @ts-ignore
      typeof Reveal.getTotalSlides === 'function' ? Reveal.getTotalSlides() : undefined,
    )
  }

  nextSlide() {
    // @ts-ignore
    // eslint-disable-next-line no-unused-vars
    return this.page.evaluate(() => Reveal.next())
  }
}
