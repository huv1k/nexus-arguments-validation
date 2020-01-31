<p align="center">
  <h1 align="center">nexus-arguments-validation</h1>
</p>

`nexus-arguments-validation` is a [Nexus](https://github.com/prisma-labs/nexus) plugin for arguments validation with [Yup](https://github.com/jquense/yup).

![build](https://github.com/huv1k/nexus-arguments-validation/workflows/build/badge.svg)
[![downloads](https://img.shields.io/npm/dt/nexus-arguments-validation.svg)](https://npmjs.org/package/nexus-arguments-validation?cacheSeconds=3600)
[![version](https://img.shields.io/npm/v/nexus-arguments-validation.svg)](https://npmjs.org/package/nexus-arguments-validation?cacheSeconds=3600)

## Installation

```bash
yarn add nexus-arguments-validation
```

## Example

```typescript
import { join } from 'path'
import { ApolloServer } from 'apollo-server'
import { makeSchema, mutationField, stringArg } from 'nexus'
import { object, string } from 'yup'
import { nexusArgumentsValidationPlugin } from 'nexus-arguments-validation'

const ValidateUrl = object().shape({
  url: string().url('Your url is not valid!'),
})

const types = [
  mutationField('validateUrl', {
    type: 'String',
    description: 'Validates the url argument as a valid URL via a regex',
    args: {
      url: stringArg(),
    },
    validationSchema: ValidateUrl,
    resolve: (_, { url }) => {
      return `Your url: ${url} is valid!`
    },
  }),
]

const schema = makeSchema({
  types,
  plugins: [nexusArgumentsValidationPlugin()],
  outputs: {
    schema: join(__dirname, 'generated/schema.graphql'),
    typegen: join(__dirname, 'generated/nexus.ts'),
  },
})

new ApolloServer({
  schema,
}).listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at: http://localhost:4000`),
)
```
