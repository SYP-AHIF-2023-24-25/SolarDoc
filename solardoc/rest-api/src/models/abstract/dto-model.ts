/**
 * Base class for all DTO models.
 * @since 0.2.0
 */
export abstract class DtoModel<ModelT> {
  protected constructor(data?: Partial<ModelT>) {
    Object.assign(this, data)
  }
}
