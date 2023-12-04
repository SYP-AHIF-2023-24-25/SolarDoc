import {model, property} from '@loopback/repository';
import {DownloadModel} from './download.model';
import {CacheModel} from './cache.model';

@model()
export class RenderedPresentationModel {
  @property({
    required: true,
    description: 'The name of the presentation (original file name)',
  })
  fileName: string;

  @property({
    required: true,
    description: 'The cache metadata',
  })
  cache: CacheModel;
}
