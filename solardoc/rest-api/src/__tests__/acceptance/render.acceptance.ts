import { SolardocRestApiApplication } from '../../application'
import { Client } from '@loopback/testlab'
import { setupApplication } from './test-helper'

describe('Render', () => {
  let app: SolardocRestApiApplication
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let client: Client

  before('setupApplication', async () => {
    ;({ app, client } = await setupApplication())
  })

  after(async () => {
    await app.stop()
  })
})
