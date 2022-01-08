import { ref } from 'vue'
import { isObject, until, useFetch } from '@vueuse/core'
import { account } from './store'
import { API_URL } from '~/config/api'
import { authClient } from '~/modules/auth'

interface Me {
  success: boolean
  me?: {
    userId: string
    username: string
    isAdmin: boolean
    created: string
    updated: string
  }
}

export function useAccount(doCheck = false) {
  if (account.value && !doCheck) {
    return {
      hasAccount: ref(true),
      account,
    }
  }

  const hasAccount = ref<boolean | null>(null)

  const _execute = async() => {
    // const user = await authClient.value?.getUser()
    const idTok = (await authClient.value?.getIdTokenClaims())?.__raw

    const { data, isFinished } = useFetch(`${API_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${idTok}`,
      },
    }).json<Me>()

    await until(isFinished).toBe(true)

    if (isObject(data.value) && 'success' in data.value) {
      hasAccount.value = data.value.success
      account.value = JSON.stringify(data.value.me)
    }
    else {
      hasAccount.value = false
    }
  }

  _execute()

  return {
    hasAccount,
    account,
  }
}
