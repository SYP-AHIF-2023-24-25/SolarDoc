import { model, property } from '@loopback/repository'
import { CacheDtoModel } from './cache-dto.model'
import { RenderedPresentationNoCacheDtoModel } from './rendered-presentation-no-cache-dto.model'

@model()
export class RenderedPresentationDtoModel extends RenderedPresentationNoCacheDtoModel {
  @property({
    required: true,
    description: 'The cache metadata',
  })
  cache: CacheDtoModel

  constructor(data?: Partial<RenderedPresentationDtoModel>) {
    super(data)
  }
}
