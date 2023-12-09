import { model, property } from '@loopback/repository'
import { DownloadDtoModel } from './download-dto.model'
import { RenderedSlideDtoModel } from './rendered-slide-dto.model'

@model()
export class RenderedSlideImageDtoModel extends RenderedSlideDtoModel {
  @property({
    required: true,
    description:
      'The download object containing the data for downloading the slide of the presentation',
  })
  download: DownloadDtoModel
}
