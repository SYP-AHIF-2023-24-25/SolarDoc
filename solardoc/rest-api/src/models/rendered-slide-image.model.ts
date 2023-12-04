import {model, property} from '@loopback/repository';
import {DownloadModel} from './download.model';
import {RenderedSlideModel} from './rendered-slide.model';

@model()
export class RenderedSlideImageModel extends RenderedSlideModel {
  @property({
    required: true,
    description:
      'The download object containing the data for downloading the slide of the presentation',
  })
  download: DownloadModel;
}
