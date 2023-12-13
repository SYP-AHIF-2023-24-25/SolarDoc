import {RenderPresentationDtoModel} from "./render-presentation-dto.model";
import {model, property} from "@loopback/repository";

@model()
export class RenderPresentationRjsHtmlDtoModel extends RenderPresentationDtoModel {
  @property({
    required: false,
    description:
      "The prepend path for the reveal.js assets (If empty or undefined, " +
      "the default 'node_modules/reveal.js/dist' will be used).",
  })
  revealJSAssetsPath: string

  constructor(data?: Partial<RenderPresentationRjsHtmlDtoModel>) {
    super(data)
  }
}
