import { GraphQLError, Source, SourceLocation, ASTNode } from 'graphql'
import { Maybe, formatValidationError } from './utils'
import { ValidationError } from 'yup'

export class ArgumentsValidationError extends Error implements GraphQLError {
  public extensions: Record<string, any>
  public message: string
  readonly locations: ReadonlyArray<SourceLocation> | undefined
  readonly path: ReadonlyArray<string | number> | undefined
  readonly nodes: ReadonlyArray<ASTNode> | undefined
  readonly source: Source | undefined
  readonly positions: ReadonlyArray<number> | undefined
  readonly originalError: Maybe<Error>

  constructor(
    message: string,
    error: ValidationError,
    code: string = 'ARGUMENTS_VALIDATION_ERROR',
  ) {
    super()

    this.message = message
    this.extensions = {
      code,
      argumentsValidations: formatValidationError(error),
    }
  }
}
