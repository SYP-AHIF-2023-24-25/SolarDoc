import {model, property} from "@loopback/repository";
import {RenderedPresentationModel} from "./rendered-presentation.model";
import {DownloadModel} from "./download.model";

@model()
export class RenderedPresentationImagesModel extends RenderedPresentationModel {
  @property({
    required: true,
    description: 'Every slide of the presentation mapped to its download object',
  })
  download: Record<number, DownloadModel>;
}
