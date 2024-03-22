import { model, property } from '@loopback/repository'
import { DownloadDtoModel } from './download-dto.model'
import { RenderedPresentationNoCacheDtoModel } from './rendered-presentation-no-cache-dto.model'
import { CacheDtoModel } from './cache-dto.model'

@model()
export class RenderedPresentationImagesDtoModel extends RenderedPresentationNoCacheDtoModel {
  @property({
    required: true,
    description: 'Every slide of the presentation mapped to its download object',
  })
  download: Record<number, DownloadDtoModel>

  @property({
    required: true,
    description:
      'The cache metadata in a record with each index mapped to the individual cached image',
  })
  cache: Record<number, CacheDtoModel>

  constructor(data?: Partial<RenderedPresentationImagesDtoModel>) {
    super(data)
  }
}
