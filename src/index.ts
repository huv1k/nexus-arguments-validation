import { plugin } from 'nexus'
import { fieldDefTypes } from './fieldDefTypes'
import { fieldResolver } from './fieldResolver'

export const nexusArgumentsValidationPlugin = () => {
  return plugin({
    name: 'nexus-arguments-validation',
    description: 'Validation of arguments with Yup object shape.',
    fieldDefTypes,
    onCreateFieldResolver: config => fieldResolver(config),
  })
}
