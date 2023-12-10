import { model, property } from '@loopback/repository'

@model()
export class RenderPresentationDtoModel {
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
}