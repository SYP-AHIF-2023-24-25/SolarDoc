import { model, property } from '@loopback/repository'

@model()
export class DownloadDtoModel {
  @property({
    required: true,
    description: 'The download url of the presentation',
  })
  url: string

  @property({
    required: true,
    description: 'The name of the file that can be downloaded',
  })
  fileName: string
}
