import type { ValidationError } from 'yup'
import setIn from 'set-value'

export type Maybe<T> = T | null | undefined

export const formatValidationError = (error: ValidationError) => {
  return error.inner.reduce((acc, val) => {
    setIn(acc, val.path, val.message)
    return acc
  }, {})
}
