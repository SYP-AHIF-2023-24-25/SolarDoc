import { model, property } from '@loopback/repository'
import { DtoModel } from '../abstract/dto-model'

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

  @property({
    required: false,
    description:
      'The prepend path for the reveal.js assets (If empty or undefined, ' +
      "the default 'node_modules/reveal.js/dist' will be used).",
  })
  revealJSAssetsPath: string

  constructor(data?: Partial<RenderPresentationDtoModel>) {
    super(data)
  }
}
