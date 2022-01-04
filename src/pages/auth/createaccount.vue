<script lang="ts" setup>
import { useAxios } from '@vueuse/integrations/useAxios'
import { until } from '@vueuse/core'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { API_URL } from '~/config/api'
import { authClient } from '~/modules/auth'
import { account } from '~/logic/store'

const { push } = useRouter()

const signupCode = ref('')
const loading = ref(false)

const instance = axios.create({
  baseURL: `${API_URL}/api`,
})

const signup = async() => {
  loading.value = true

  const { data, isFinished, error } = useAxios('/account/create',
    {
      method: 'POST',
      data: {
        signupCode: signupCode.value,
      },
      headers: {
        Authorization: `Bearer ${(await authClient.value?.getIdTokenClaims())?.__raw}`,
      },
    }, instance)

  await until(isFinished).toBeTruthy()
  loading.value = false

  if (data.value?.success) {
    account.value = JSON.stringify(data.value?.user)
    push('/')
  }
  else {
    console.log(data.value?.error, ', ', error.value)
    Swal.fire({
      title: 'Error!',
      text: `${data.value?.error ?? error ?? 'An unknown error occurred.'}`,
      icon: 'error',
    })
  }
}
</script>

<template>
  <div class="grid h-full place-items-center">
    <div class="grid w-full gap-3 p-8 shadow-2xl max-w-90 rounded-xl bg-deployr-600">
      <h1 class="text-4xl text-counterly-logo text-center">
        Custom Shoutouts
      </h1>
      <span class="text-sm text-center text-gruvbox-300 ">Please provide your signin code to continue.</span>
      <!-- FORM START-->
      <input v-model="signupCode" placeholder="Invite Code" type="text" class="py-3 px-4 pr-8 bg-deployr-700 border-dark-600 focus:border-teal-900 shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline">
      <!-- FORM END -->
      <Button v-if="!loading" primary @click="signup">
        Create Account
      </Button>
      <div v-else class="grid w-10 h-10 mx-auto text-green-900 bg-green-500 rounded-full place-items-center">
        <Spinner class="w-7 h-7" />
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: auth
</route>
