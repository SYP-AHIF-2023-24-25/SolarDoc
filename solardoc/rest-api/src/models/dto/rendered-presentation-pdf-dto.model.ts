import { model, property } from '@loopback/repository'
import { RenderedPresentationDtoModel } from './rendered-presentation-dto.model'
import { DownloadDtoModel } from './download-dto.model'

@model()
export class RenderedPresentationPdfDtoModel extends RenderedPresentationDtoModel {
  @property({
    required: true,
    description: 'The download object containing the data for downloading the presentation',
  })
  download: DownloadDtoModel

  constructor(data?: Partial<RenderedPresentationPdfDtoModel>) {
    super(data)
  }
}
