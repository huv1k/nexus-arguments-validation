import type { ObjectSchema, ValidationError } from 'yup'
import { MiddlewareFn, plugin, CreateFieldResolverInfo } from '@nexus/schema/dist/core'
import { ArgumentsValidationError } from './error'
import { FieldValidationResolver } from './fieldDefTypes'

export const fieldResolver = (
  config: CreateFieldResolverInfo,
): MiddlewareFn | undefined => {
  const validationConfig = config.fieldConfig.extensions?.nexus?.config

  // If the field doesn't have validation schema field, skip wrapping resolver
  if (validationConfig.validationSchema === undefined) {
    return
  }

  let {
    validationSchema,
  }: { validationSchema: FieldValidationResolver } = validationConfig

  if (typeof validationSchema === 'function') {
    validationSchema = validationSchema()
  }

  // Check if its Yup schema with `validate` function
  if (typeof validationSchema !== 'object' || !validationSchema.validate) {
    // console.log(validationSchema, config.fieldConfig)
    console.error(
      new Error(
        `The validationSchema property provided to ${
          validationConfig.type
        } should be a Yup schema, saw ${typeof validationSchema}`,
      ),
    )
    return
  }

  return (root, args, ctx, info, next): MiddlewareFn => {
    let validationResult
    try {
      validationResult = (validationSchema as ObjectSchema<any>).validate(
        args,
        { abortEarly: false },
      )
    } catch (e) {
      validationResult = Promise.reject(e)
    }

    return plugin.completeValue(
      validationResult,
      () => {
        return next(root, args, ctx, info)
      },
      (err: ValidationError) => {
        throw new ArgumentsValidationError('Bad user input', err)
      },
    )
  }
}
