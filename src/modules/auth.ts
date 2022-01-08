import type { Auth0Client } from '@auth0/auth0-spa-js'
import createAuth0Client from '@auth0/auth0-spa-js'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { isBoolean, until } from '@vueuse/core'
import urql from '@urql/vue'
import { authExchange } from '@urql/exchange-auth'
import type { ClientOptions } from '@urql/vue'
import { fetchExchange, makeOperation, subscriptionExchange } from '@urql/core'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import type { UserModule } from '~/types'
import { accessToken, account } from '~/logic/store'
import { API_GQL, API_URL, WS_GQL } from '~/config/api'
import { useAccount } from '~/logic/account'

export const authClient: Ref<Auth0Client | undefined> = ref()
const isInitialized = ref(false)

const subscriptionClient = new SubscriptionClient(WS_GQL, {
  reconnect: true,
  connectionParams: async() => {
    await until(isInitialized).toBe(true)

    const user = await authClient.value?.getUser()
    if (user) {
      const token = (await authClient.value?.getIdTokenClaims())?.__raw
      return {
        Authorization: `Bearer ${token}`,
      }
    }
  },
})

export const install: UserModule = ({ router, isClient, app }) => {
  if (!isClient)
    return

  let reDir = (window.location.hostname === 'localhost') ? `http://localhost:${window.location.port}` : 'https://cso.bizzy.live'
  if (window.location.hostname === '192.168.0.213') reDir = `http://192.168.0.213:${window.location.port}`

  createAuth0Client({
    domain: 'bizzylive.us.auth0.com',
    client_id: 'r2uVt9N7ATg9xcyqJHy8xuomWZaIvY5i',
    redirect_uri: `${reDir}/auth/signin`,
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
  }).then(async(auth0) => {
    authClient.value = auth0
    isInitialized.value = true

    accessToken.value = (await auth0.getIdTokenClaims())?.__raw
    // account.value = JSON.stringify(await auth0.getUser())

    // Init urql
    app.use(urql,
      {
        url: API_GQL,
        exchanges: [
          authExchange({
            getAuth() {
              return new Promise<string>((resolve) => {
                if (isInitialized.value) { resolve(accessToken.value) }
                else {
                  const stop = watch(isInitialized, () => {
                    if (isInitialized.value) {
                      resolve(accessToken.value)
                      stop()
                    }
                  })
                }
              })
            },
            willAuthError: () => true,
            addAuthToOperation({ operation, authState }: {operation: any; authState: any}) {
              if (!authState)
                return operation

              const fetchOptions = typeof operation.context.fetchOptions === 'function' ? operation.context.fetchOptions() : operation.context.fetchOptions || {}

              return makeOperation(operation.kind, operation, {
                ...operation.context,
                fetchOptions: {
                  ...fetchOptions,
                  headers: {
                    ...fetchOptions.headers,
                    Authorization: `Bearer ${authState}`,
                  },
                },
              })
            },

          }),
          fetchExchange,
          subscriptionExchange({
            forwardSubscription(operation) {
              return subscriptionClient.request(operation)
            },
          }),
        ],
      } as ClientOptions)
  })

  router.beforeEach(async(to) => {
    await until(isInitialized).toBeTruthy()

    const usr = await authClient.value?.getUser()
    if (usr) {
      const { hasAccount } = useAccount()
      await until(hasAccount).toMatch(v => isBoolean(v))
      console.log('hasAccount', hasAccount.value)

      if (to.name === 'auth-signin')
        return '/'

      if (to.name === 'auth-createaccount' && hasAccount.value)
        return '/'

      if (to.name !== 'auth-createaccount' && !hasAccount.value)
        return '/auth/createaccount'
    }
    else {
      if (to.name !== 'auth-signin')
        return '/auth/signin' // return next({ path: '/auth/signin' })
    }
  })
}
