import { model, property } from '@loopback/repository'
import { DtoModel } from '../abstract/dto-model'

@model()
export class RenderedPresentationNoCacheDtoModel extends DtoModel<RenderedPresentationNoCacheDtoModel> {
  @property({
    required: true,
    description: 'The name of the presentation (original file name)',
  })
  fileName: string

  @property({
    required: true,
    description: 'The size of the presentation (original file size in KB)',
  })
  rawSize: number

  @property({
    required: true,
    description: 'The number of slides in the presentation',
  })
  slideCount: number

  @property({
    required: true,
    description: 'The number of sub slides in the presentation',
  })
  slideCountInclSubslides: number

  @property.array(Number, {
    required: true,
    description:
      'The number of sub slides per slide in the presentation. The index in the array represents the slide index.',
  })
  subslideCountPerSlide: number[]

  constructor(data?: Partial<RenderedPresentationNoCacheDtoModel>) {
    super(data)
  }
}
