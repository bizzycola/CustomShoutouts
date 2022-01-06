<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from 'vql'
import Swal from 'sweetalert2'
import { UseEventBus, useClipboard } from '@vueuse/core'
import { account } from '~/logic/store'
import { useToast } from '~/composables/useToast'
import type { InviteCode } from '~/types/inviteCode'

const { push } = useRouter()
const { createToast } = useToast()
const { fetching, error, data, executeQuery } = useQuery({})
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

  console.log(nw)
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
}
</gql>
<gql mutation>
mutation($code: String!) {
    removeSignupCode(code: $code)
}
</gql>

<template>
  <div v-if="!loading" class="flex flex-col justify-center items-center">
    <div class="bg-deployr-800 px-4 py-5 border-b border-deployr-600 sm:px-6 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl rounded-t-md">
      <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div class="ml-4 mt-2">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            Invite Codes
          </h3>
        </div>
        <div class="ml-4 mt-2 flex-shrink-0">
          <button type="button" class="relative inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" @click="openAdd">
            Add Code
          </button>
        </div>
      </div>
    </div>
    <div
      class="flex-1 p-1 bg-deployr-800 -lg:w-full xl:w-4xl -lg:m-2 -lg:mt-0 lg:w-2xl flex flex-col justify-center rounded-b-md"
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
