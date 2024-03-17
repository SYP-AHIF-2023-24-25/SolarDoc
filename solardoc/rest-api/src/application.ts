import { BootMixin } from '@loopback/boot'
import { ApplicationConfig } from '@loopback/core'
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer'
import { RepositoryMixin } from '@loopback/repository'
import { RestApplication } from '@loopback/rest'
import { ServiceMixin } from '@loopback/service-proxy'
import { SolardocSequence } from './sequence'
import { isProd } from './env'
import path from 'path'

export { ApplicationConfig }

export class SolardocRestApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options)

    this.sequence(SolardocSequence)

    this.static('/', path.join(__dirname, '../public'))

    if (!isProd) {
      this.configure(RestExplorerBindings.COMPONENT).to({
        path: '/explorer',
      })
      this.component(RestExplorerComponent)
    }

    this.projectRoot = __dirname
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    }
  }
}
