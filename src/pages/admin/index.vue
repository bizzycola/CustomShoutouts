<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from 'vql'
import Swal from 'sweetalert2'
import { useClipboard, useEventBus } from '@vueuse/core'
import { account } from '~/logic/store'
import { useToast } from '~/composables/useToast'
import type { InviteCode } from '~/types/inviteCode'

const { push } = useRouter()
const { createToast } = useToast()
const { fetching, error, data } = useQuery({})
const { executeMutation, fetching: fetchMutation } = useMutation()
const { copy } = useClipboard()
const bus = useEventBus<string>('codePanelEvents')

const loading = ref(true)
onMounted(() => {
  const accData = JSON.parse(account.value)
  if (!accData.isAdmin)
    push('/')
  else
    loading.value = false
})

const codes = ref<InviteCode[]>([])
watch(data, (nw) => {
  if (!nw || !nw.signupCodes) return

  codes.value = nw.signupCodes.nodes
})

const removeCode = async(code: string) => {
  const resp = await executeMutation({
    code,
  })

  if (resp.error) {
    Swal.fire({
      title: 'Error!',
      text: `${resp.error.message.replace('[GraphQL] ', '')}`,
      icon: 'error',
    })
    return
  }

  codes.value.splice(codes.value.findIndex(item => item.code === code), 1)
  createToast({
    type: 'success',
    title: 'Shoutout Removed',
    message: 'The custom shoutout has been removed.',
    duration: 2,
  })
}

const addCode = async(code: InviteCode) => {
  codes.value.unshift(code)
}

const copyCode = (code: string) => {
  copy(code)

  createToast({
    type: 'success',
    title: 'Code copied',
    message: 'Invite code copied to clipboard.',
    duration: 2,
  })
}

const openAdd = () => {
  bus.emit('openPanel')
}

const formatStat = (n: number) => {
  if (n < 1e3) return n
  if (n >= 1e3 && n < 1e6) return `${+(n / 1e3).toFixed(1)}K`
  if (n >= 1e6 && n < 1e9) return `${+(n / 1e6).toFixed(1)}M`
  if (n >= 1e9 && n < 1e12) return `${+(n / 1e9).toFixed(1)}B`
  if (n >= 1e12) return `${+(n / 1e12).toFixed(1)}T`
}
</script>

<gql>
{
    signupCodes {
        nodes {
            code
            isAdmin
            creatorId
            used
            usedAt
            created
            comment
            user {
                username
                avatarUrl
            }
        }
    }
    siteStats {
        userCount
        customShoutoutCount
        totalShoutoutCalls
    }
}
</gql>
<gql mutation>
mutation($code: String!) {
    removeSignupCode(code: $code)
}
</gql>

<template>
  <div v-if="!loading" class="flex flex-col justify-center items-center">
    <!-- stats -->
    <div class="pt-12 sm:pt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-extrabold text-gray-200 sm:text-4xl">
            Statistics
          </h2>
        </div>
      </div>
      <div class="mt-10 pb-12 sm:pb-16 ">
        <div class="relative">
          <div class="absolute inset-0 h-1/2" />
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="max-w-4xl mx-auto">
              <dl class="rounded-lg bg-deployr-800 shadow-lg sm:grid sm:grid-cols-3 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl">
                <div class="flex flex-col border-b border-deployr-600 p-6 text-center sm:border-0 sm:border-r">
                  <dt class="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                    Users
                  </dt>
                  <dd class="order-1 text-5xl font-extrabold text-indigo-600">
                    {{ formatStat(data?.siteStats?.userCount) }}
                  </dd>
                </div>
                <div class="flex flex-col border-t border-b border-deployr-600 p-6 text-center sm:border-0 sm:border-l sm:border-r">
                  <dt class="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                    Custom Shoutouts
                  </dt>
                  <dd class="order-1 text-5xl font-extrabold text-indigo-600">
                    {{ formatStat(data?.siteStats?.customShoutoutCount) }}
                  </dd>
                </div>
                <div class="flex flex-col border-t border-deployr-600 p-6 text-center sm:border-0 sm:border-l">
                  <dt class="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                    Total Shoutouts Called
                  </dt>
                  <dd class="order-1 text-5xl font-extrabold text-indigo-600">
                    {{ formatStat(data?.siteStats?.totalShoutoutCalls) }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- codes -->
    <div class="bg-deployr-800 px-4 py-5 border-b border-deployr-600 sm:px-6 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl rounded-t-md shadow-lg">
      <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div class="ml-4 mt-2">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            Invite Codes
          </h3>
        </div>
        <div class="ml-4 mt-2 flex-shrink-0">
          <button type="button" class="mr-2 relative inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" @click="openAdd">
            Add Code
          </button>
          <router-link class="relative inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-800 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" to="/admin/users">
            Users
          </router-link>
        </div>
      </div>
    </div>
    <div
      class="flex-1 p-1 bg-deployr-800 -lg:w-full xl:w-4xl -lg:m-2 -lg:mt-0 lg:w-2xl flex flex-col justify-center rounded-b-md shadow-lg"
      :class="{'items-start': !fetching, 'items-center p-15': fetching}"
    >
      <DataLoader :fetching="fetching" :error="error?.message" message="Loading codes">
        <div v-if="codes && codes.length > 0" class="flex flex-col max-h-md overflow-auto gslist w-full -lg:mb-10" style="max-height: 50vh;">
          <ul
            role="list"
            class=" divide-y divide-deployr-600 "
          >
            <li
              v-for="so in codes"
              :key="so.code"

              class="py-4 px-2 hover:bg-deployr-700 hover:cursor-pointer"
              @click.stop="copyCode(so.code)"
            >
              <div class="flex items-center space-x-4 ">
                <div class="flex-shrink-0">
                  <img class="h-8 w-8 rounded-full" :src="`${so.user?.avatarUrl ?? `this.src='https://ui-avatars.com/api/?name=${so.code}`}`" :onerror="`this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(so.user?.username ?? so.code)}'`">
                </div>
                <div class="flex-1 min-w-0 text-left">
                  <p class="text-sm font-medium text-gray-200 truncate">
                    {{ so.user?.username ?? so.code }}
                  </p>
                  <p class="text-sm text-gray-400 truncate">
                    <span class="text-deployr-200 overElipse text-left">{{ so.comment }}</span>
                  </p>
                </div>
                <div>
                  <ant-design-delete-outlined v-if="!fetchMutation" class="cursor-pointer hover:text-red-500" @click.stop="removeCode(so.code)" />
                  <Spinner v-else class="w-5 h-5" />
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="flex flex-col w-full justify-center items-center">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-200">
              No codes
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Get started by generating a new invite code.
            </p>
            <div class="mt-6 mb-2">
              <button type="button" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-800 p-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" @click="openAdd">
                <!-- Heroicon name: solid/plus -->
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Create Code
              </button>
            </div>
          </div>
        </div>
      </DataLoader>
    </div>
  </div>
  <div v-else class="flex flex-col justify-center items-center">
    <Spinner />
  </div>
  <CreateInviteCodeDrawer :bus="bus" @refresh-codes="addCode" />
</template>

<style scoped>
.gslist::-webkit-scrollbar {
  width: 3px; /* width of the entire scrollbar */
}
.gslist::-webkit-scrollbar-track {
  background: #1d1a23; /* color of the tracking area */
}
.gslist::-webkit-scrollbar-thumb {
  background-color: #27232f; /* color of the scroll thumb */
  border-radius: 2px; /* roundness of the scroll thumb */
  border: 3px solid rgb(84, 84, 84); /* creates padding around scroll thumb */
}
.overElipse {
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  white-space: nowrap !important;
  width: calc(100%) !important;
  display: inline-block !important;
}

@media (max-width: 1024px) {
  .maxlist {
    height: 90vh !important;
  }
}
</style>
