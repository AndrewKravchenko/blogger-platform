import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { applyAppSettings } from './settings/apply-app-setting'
import { Configuration } from './settings/configuration'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  applyAppSettings(app)

  const configService = app.get(ConfigService<Configuration, true>)
  const apiSettings = configService.get('apiSettings', { infer: true })
  const environmentSettings = configService.get('environmentSettings', {
    infer: true,
  })
  const port = apiSettings.PORT

  await app.listen(port, () => {
    console.log('App starting listen port: ', port)
    console.log('ENV: ', environmentSettings.currentEnv)
  })
}

bootstrap()
