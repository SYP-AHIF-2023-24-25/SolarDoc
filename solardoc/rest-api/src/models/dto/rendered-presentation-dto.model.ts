import { model, property } from '@loopback/repository'
import { CacheDtoModel } from './cache-dto.model'
import {DtoModel} from "../abstract/dto-model";

@model()
export class RenderedPresentationDtoModel extends DtoModel<RenderedPresentationDtoModel> {
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

  constructor(data?: Partial<RenderedPresentationDtoModel>) {
    super(data)
  }
}
