import {model, property} from '@loopback/repository';
import {DownloadDtoModel} from './download-dto.model';

@model()
export class RenderedSlideDtoModel {
  @property({
    required: true,
    description: 'The name of the presentation (original file name)',
  })
  fileName: string;
}
