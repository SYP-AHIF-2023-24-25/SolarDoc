import { model, property } from '@loopback/repository'
import { DtoModel } from '../abstract/dto-model'
import { CacheDtoModel } from './cache-dto.model'

@model()
export class RenderedSlideDtoModel extends DtoModel<RenderedSlideDtoModel> {
  @property({
    required: true,
    description: 'The name of the presentation (original file name)',
  })
  fileName: string

  @property({
    required: true,
    description: 'The cache metadata',
  })
  cache: CacheDtoModel

  constructor(data?: Partial<RenderedSlideDtoModel>) {
    super(data)
  }
}
