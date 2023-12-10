import { model, property } from '@loopback/repository'
import {DtoModel} from "../abstract/dto-model";

@model()
export class RenderPresentationDtoModel extends DtoModel<RenderPresentationDtoModel> {
  @property({
    required: true,
    description: 'The name of the file to upload',
  })
  fileName: string

  @property({
    required: true,
    description: 'The file to upload',
  })
  fileContent: string

  constructor(data?: Partial<RenderPresentationDtoModel>) {
    super(data)
  }
}
