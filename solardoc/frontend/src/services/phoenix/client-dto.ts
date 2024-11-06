export interface SelectionDto {
  anchor: number
  head: number
}

export interface ClientDto {
  clientId: string
  selection: SelectionDto
  name: string
}
