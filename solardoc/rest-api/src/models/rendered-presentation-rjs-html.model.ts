import {model, property} from '@loopback/repository';
import {RenderedPresentationModel} from './rendered-presentation.model';
import {DownloadModel} from './download.model';

@model()
export class RenderedPresentationRjsHtmlModel extends RenderedPresentationModel {
  @property({
    required: true,
    description:
      'The download object containing the data for downloading the presentation',
  })
  download: DownloadModel;
}
