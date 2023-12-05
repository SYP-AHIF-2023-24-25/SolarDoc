import {model, property} from '@loopback/repository';
import {DownloadDtoModel} from './download-dto.model';
import {CacheDtoModel} from './cache-dto.model';

@model()
export class RenderedPresentationDtoModel {
  @property({
    required: true,
    description: 'The name of the presentation (original file name)',
  })
  fileName: string;

  @property({
    required: true,
    description: 'The cache metadata',
  })
  cache: CacheDtoModel;
}
