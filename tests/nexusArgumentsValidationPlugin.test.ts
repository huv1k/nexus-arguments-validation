import {
  makeSchema,
  objectType,
  queryField,
  mutationField,
  stringArg,
} from '@nexus/schema'
import { nexusArgumentsValidationPlugin } from '../src'
import { graphql } from 'graphql'
import { object, string } from 'yup'

describe('nexusInputValidationPlugin', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    jest.resetAllMocks()
  })

  const UserValidation = object().shape({
    email: string().email('Email is not in valid format!'),
    password: string().min(8, 'Password too short!'),
  })

  const types = [
    objectType({
      name: 'User',
      definition: t => {
        t.string('email')
        t.string('password')
      },
    }),
    queryField('user', {
      type: 'User',
      resolve: () => {
        return { email: 'input@plugin.com', password: 'password' }
      },
    }),
    mutationField('signup', {
      type: 'User',
      args: {
        email: stringArg(),
        password: stringArg(),
      },
      // @ts-ignore
      validationSchema: UserValidation,
      resolve: (_, { email, password }) => {
        return { email, password }
      },
    }),
    mutationField('callback', {
      type: 'User',
      args: {
        email: stringArg(),
        password: stringArg(),
      },
      // @ts-ignore
      validationSchema: () => UserValidation,
      resolve: (_, { email, password }) => {
        return { email, password }
      },
    }),
  ]

  const nexusSchema = makeSchema({
    types,
    outputs: false,
    plugins: [nexusArgumentsValidationPlugin()],
  })

  const query = (field: string) => {
    return graphql(
      nexusSchema,
      `{
        ${field}{
          email
        }
      }`,
    )
  }

  const mutation = (
    field: string,
    variables: { [key: string]: any },
    schema = nexusSchema,
  ) => {
    return graphql(
      schema,
      `mutation ($email: String! $password: String!){
        ${field}(email: $email, password: $password){ 
          email
          password
        }
      }`,
      {},
      {},
      variables,
    )
  }

  test('query user', async () => {
    const { data, errors = [] } = await query('user')
    expect(consoleError).not.toHaveBeenCalled()
    expect(data!.user.email).toBe('input@plugin.com')
    expect(errors.length).toBe(0)
  })

  test('mutation with validationSchema object', async () => {
    const variables = {
      email: 'input@plugin.com',
      password: 'password',
    }
    const { data, errors = [] } = await mutation('signup', variables)

    expect(consoleError).not.toHaveBeenCalled()
    expect(data!.signup).toEqual({
      email: 'input@plugin.com',
      password: 'password',
    })
    expect(errors.length).toBe(0)
  })

  test('mutation with validationSchema object callback', async () => {
    const variables = {
      email: 'input@plugin.com',
      password: 'password',
    }
    const { data, errors = [] } = await mutation('callback', variables)

    expect(consoleError).not.toHaveBeenCalled()
    expect(data!.callback).toEqual({
      email: 'input@plugin.com',
      password: 'password',
    })
    expect(errors.length).toBe(0)
  })

  test('error validation with single input field', async () => {
    const variables = {
      email: 'input@plugin.com',
      password: 'pass',
    }
    const { data, errors = [] } = await mutation('signup', variables)

    expect(consoleError).not.toHaveBeenCalled()
    expect(data).toBe(null)
    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe('Bad user input')
    expect(errors[0].extensions!.code).toBe('ARGUMENTS_VALIDATION_ERROR')
    expect(errors[0].extensions!.argumentsValidations).toEqual({
      password: 'Password too short!',
    })
  })

  test('error validation with multiple input field', async () => {
    const variables = {
      email: 'input@plugin',
      password: 'pass',
    }
    const { data, errors = [] } = await mutation('signup', variables)

    expect(consoleError).not.toHaveBeenCalled()
    expect(data).toBe(null)
    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe('Bad user input')
    expect(errors[0].extensions!.code).toBe('ARGUMENTS_VALIDATION_ERROR')
    expect(errors[0].extensions!.argumentsValidations).toEqual({
      email: 'Email is not in valid format!',
      password: 'Password too short!',
    })
  })

  test('incorrect validationSchema shape', async () => {
    const variables = {
      email: 'input@plugin.com',
      password: 'password',
    }

    const nexusSchema = makeSchema({
      types: [
        ...types,
        mutationField('wrongValidationSchema', {
          type: 'User',
          args: {
            email: stringArg({ required: true }),
            password: stringArg(),
          },
          // @ts-ignore
          validationSchema: () => ({}),
          resolve: async (_, { email, password }) => {
            return { email, password }
          },
        }),
      ],
      outputs: false,
      plugins: [nexusArgumentsValidationPlugin()],
    })

    const { data, errors = [] } = await mutation(
      'wrongValidationSchema',
      variables,
      nexusSchema,
    )

    expect(consoleError.mock.calls[0]).toMatchSnapshot()
    expect(errors.length).toEqual(0)
    expect(data!.wrongValidationSchema).toEqual(variables)
  })

  // test('signup user without errors', async () => {
  //   const variables = {
  //     email: 'input@plugin.com',
  //     password: 'password',
  //   }
  //   const { data, errors = [] } = await mutation(
  //     'wrongValidationSchema',
  //     variables
  //   )

  //   expect(consoleError).not.toHaveBeenCalled();
  //   console.log(data, errors)
  // })

  // Console warn
})
