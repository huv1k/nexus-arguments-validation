import { printedGenTyping, printedGenTypingImport } from 'nexus/dist/core'
import { Schema } from 'yup'

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