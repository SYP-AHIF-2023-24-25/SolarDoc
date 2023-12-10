import { model, property } from '@loopback/repository'
import {DtoModel} from "../abstract/dto-model";

@model()
export class DownloadDtoModel extends DtoModel<DownloadDtoModel> {
  @property({
    required: true,
    description: 'The download url of the presentation',
  })
  storageURL: string

  @property({
    required: true,
    description: 'The name of the file that can be downloaded',
  })
  fileName: string

  constructor(data?: Partial<DownloadDtoModel>) {
    super(data)
  }
}
