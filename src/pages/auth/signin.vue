<script setup lang="ts">
import { ref } from 'vue'
// import { useRouter } from 'vue-router'
// import { accessToken } from '~/logic/store'
import { useRouter } from 'vue-router'
import { authClient } from '~/modules/auth'
const loading = ref(false)
const { push } = useRouter()
const query = window.location.search
if (query.includes('code=') && query.includes('state=')) {
  loading.value = true
  authClient.value?.handleRedirectCallback()
    .then((res) => {
      window.location.pathname = '/'
    })
    .catch((err) => {
      push(`'/err/${err}'`)
    })
}
const signin = async() => {
  await authClient.value?.loginWithRedirect()
}
</script>

<template>
  <div class="grid h-full place-items-center">
    <div class="grid w-full gap-8 p-8 shadow-2xl max-w-82 rounded-xl bg-deployr-600">
      <h1 class="text-4xl text-counterly-logo text-center">
        Custom Shoutouts
      </h1>
      <span class="text-sm text-center text-gruvbox-300">Sign in to setup custom shoutouts for your Twitch chat.</span>
      <Button v-if="!loading" primary @click="signin">
        <akar-icons-twitch-fill />
        Sign in with Twitch
      </Button>
      <div v-else class="grid w-10 h-10 mx-auto text-green-900 bg-green-500 rounded-full place-items-center">
        <Spinner class="w-5 h-5" />
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: auth
</route>
