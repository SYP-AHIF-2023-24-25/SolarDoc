// Check what type of environment we are running in
export const envType: 'development' | 'production' =
  import.meta.env.MODE === 'production' ? 'production' : 'development'
export const isDev = envType === 'development'
export const isProd = envType === 'production'

// All variables prefixed with 'PROD' are only available in production mode
export type ProductionEnv<Name extends string> = {
  [Key in keyof ImportMetaEnv]: Key extends `PROD_${Name}` ? ImportMetaEnv[Key] : undefined
}[`PROD_${Name}`]

// All variables prefixed with 'DEV' are only available in development mode
export type DevelopmentEnv<Name extends string> = {
  [Key in keyof ImportMetaEnv]: Key extends `DEV_${Name}` ? ImportMetaEnv[Key] : undefined
}[`DEV_${Name}`]
