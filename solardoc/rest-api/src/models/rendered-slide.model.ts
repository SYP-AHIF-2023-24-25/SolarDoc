import {model, property} from '@loopback/repository';
import {DownloadModel} from './download.model';

@model()
export class RenderedSlideModel {
  @property({
    required: true,
    description: 'The name of the presentation (original file name)',
  })
  fileName: string;
}
