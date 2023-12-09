import { RestApiApplication } from '../../application'
import { Client } from '@loopback/testlab'
import { setupApplication } from './test-helper'

describe('Render', () => {
  let app: RestApiApplication
  let client: Client

  before('setupApplication', async () => {
    ;({ app, client } = await setupApplication())
  })

  after(async () => {
    await app.stop()
  })
})
