import setIn from 'set-value'
import { ValidationError } from 'yup'

export type Maybe<T> = T | null | undefined

export const formatValidationError = (error: ValidationError) => {
  return error.inner.reduce((acc, val) => {
    setIn(acc, val.path, val.message)
    return acc
  }, {})
}
