import type { Schema } from 'yup'
import {
  printedGenTyping,
  printedGenTypingImport,
} from '@nexus/schema/dist/core'

const FieldValidationResolverImport = printedGenTypingImport({
  module: 'nexus-arguments-validation/dist/fieldDefTypes',
  bindings: ['FieldValidationResolver'],
})

export const fieldDefTypes = printedGenTyping({
  optional: true,
  name: 'validationSchema',
  description:
    'Yup schema or function that returns a Yup schema. This is used for input validation.',
  type: 'FieldValidationResolver',
  imports: [FieldValidationResolverImport],
})

export type FieldValidationResolver = Schema<any> | (() => Schema<any>)
