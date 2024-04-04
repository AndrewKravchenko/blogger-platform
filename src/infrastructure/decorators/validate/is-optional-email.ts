import { applyDecorators } from '@nestjs/common'
import { IsEmail, IsOptional } from 'class-validator'
import { Trim } from '../transform/trim'

// Объединение декораторов
// https://docs.nestjs.com/custom-decorators#decorator-composition
export const IsOptionalEmail = () => applyDecorators(IsEmail(), Trim(), IsOptional())
