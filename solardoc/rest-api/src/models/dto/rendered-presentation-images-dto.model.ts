import {model, property} from '@loopback/repository';
import {RenderedPresentationDtoModel} from './rendered-presentation-dto.model';
import {DownloadDtoModel} from './download-dto.model';

@model()
export class RenderedPresentationImagesDtoModel extends RenderedPresentationDtoModel {
  @property({
    required: true,
    description:
      'Every slide of the presentation mapped to its download object',
  })
  download: Record<number, DownloadDtoModel>;
}
