import { BootMixin } from '@loopback/boot';
import { ApplicationConfig, BindingKey } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import { SolardocSequence } from './sequence';
import { isProd } from './env';
import path from 'path';
import { CacheService } from './services';

export { ApplicationConfig };

export const CACHE_SERVICE_KEY = BindingKey.create<CacheService>('services.CacheService');

export class SolardocRestApiApplication extends BootMixin(
    ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    console.log("in application config");

    this.sequence(SolardocSequence);
    this.static('/', path.join(__dirname, '../public'));

    if (!isProd) {
      this.configure(RestExplorerBindings.COMPONENT).to({
        path: '/explorer',
      });
      this.component(RestExplorerComponent);
    }

    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.bind(CACHE_SERVICE_KEY).toClass(CacheService);
  }

  async boot(): Promise<void> {
    await super.boot();

    const cacheService = await this.get(CACHE_SERVICE_KEY);
    await cacheService.start();
  }
}
