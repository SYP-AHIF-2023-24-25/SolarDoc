import { model, property } from '@loopback/repository'
import {DtoModel} from "../abstract/dto-model";

@model()
export class RenderedSlideDtoModel extends DtoModel<RenderedSlideDtoModel> {
  @property({
    required: true,
    description: 'The name of the presentation (original file name)',
  })
  fileName: string

  constructor(data?: Partial<RenderedSlideDtoModel>) {
    super(data)
  }
}
