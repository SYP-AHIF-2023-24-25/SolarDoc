import { RestApiApplication } from '../..'
import { Client, createRestAppClient, givenHttpServerConfig } from '@loopback/testlab'

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  })

  const app = new RestApiApplication({
    rest: restConfig,
  })

  await app.boot()
  await app.start()

  const client = createRestAppClient(app)

  return { app, client }
}

export interface AppWithClient {
  app: RestApiApplication
  client: Client
}
