import type { RawOTrans } from '@/services/phoenix/ot-trans'

/**
 * Represents a single operation.
 * @since 1.0.0
 */
export class SingleOperation implements RawOTrans {
  constructor(
    public type: 'insert' | 'delete' | 'retain',
    public content?: string,
    public length?: number,
  ) {}

  get isInsert() {
    return this.type === 'insert'
  }

  get isDelete() {
    return this.type === 'delete'
  }

  get isRetain() {
    return this.type === 'retain'
  }

  equals(other: SingleOperation): boolean {
    return (
      this.type === other.type && this.content === other.content && this.length === other.length
    )
  }
}
