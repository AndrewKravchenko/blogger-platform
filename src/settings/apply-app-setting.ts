import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from '../infrastructure/exception-filters/http-exception-filter'
import { LoggerMiddlewareFunc } from '../infrastructure/middlewares/logger.middleware'
import { useContainer } from 'class-validator'
import { AppModule } from '../app.module'
import cookieParser from 'cookie-parser'

export const applyAppSettings = (app: INestApplication) => {
  // app.useGlobalInterceptors()
  //  app.useGlobalGuards(new AuthGuard())
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.use(cookieParser())
  app.use(LoggerMiddlewareFunc)
  app.enableCors()

  setAppPipes(app)
  setAppExceptionsFilters(app)
}

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const customErrors: { key: string; message?: string }[] = []

        errors.forEach((e) => {
          const constraintKeys = Object.keys(e.constraints || {})

          constraintKeys.forEach((cKey) => {
            const message = e.constraints?.[cKey]

            customErrors.push({ key: e.property, message })
          })
        })

        // Error 400
        throw new BadRequestException(customErrors)
      },
    }),
  )
}

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter())
}
