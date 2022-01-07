<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from 'vql'
import Swal from 'sweetalert2'
import { account } from '~/logic/store'
import { useToast } from '~/composables/useToast'
import type { AppUser } from '~/types/appUser'

const filter = ref('')
const filterTemp = ref('')

const { push } = useRouter()
const { fetching, error, data, executeQuery } = useQuery({ variables: { filter }, requestPolicy: 'network-only' })

const { createToast } = useToast()
const loading = ref(true)
onMounted(() => {
  const accData = JSON.parse(account.value)
  if (!accData.isAdmin)
    push('/')
  else
    loading.value = false
})

const users = ref<AppUser[]>([])
watch(data, (nw) => {
  if (!nw || !nw.userList) return

  users.value = nw.userList.nodes
})

const removeUser = async(id: string) => {

}

const doSearch = (e: any) => {
  if (e.key === 'Enter') {
    filter.value = filterTemp.value
    filterTemp.value = ''
  }
}
</script>

<gql>
query($filter: String!) {
    userList(filter: $filter) {
        nodes {
            id
            username
            avatarUrl
            isAdmin
            maxAllowedShoutouts
            created
            updated
        }
    }
}
</gql>

<template>
  <div v-if="!loading" class="flex flex-col justify-center items-center">
    <div class="bg-deployr-800 px-4 py-5 border-b border-deployr-600 sm:px-6 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl rounded-t-md shadow-lg">
      <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div class="ml-4 mt-2">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            Users
          </h3>
        </div>
        <div class="ml-4 mt-2 flex-shrink-0">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ant-design-search-outlined class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              v-model="filterTemp"
              name="search"
              class="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-deployr-600 text-gray-300 placeholder-gray-400 focus:outline-none  focus:border-white focus:ring-white focus:text-gray-200 sm:text-sm"
              placeholder="Search"
              type="search"
              :onkeypress="doSearch"
            >
          </div>
        </div>
      </div>
    </div>
    <div
      class="flex-1 p-1 bg-deployr-800 -lg:w-full xl:w-4xl -lg:m-2 -lg:mt-0 lg:w-2xl flex flex-col justify-center rounded-b-md shadow-lg"
      :class="{'items-start': !fetching, 'items-center p-15': fetching}"
    >
      <DataLoader :fetching="fetching" :error="error?.message" message="Loading users">
        <div v-if="users && users.length > 0" class="flex flex-col max-h-md overflow-auto gslist w-full -lg:mb-10" style="max-height: 50vh;">
          <ul
            role="list"
            class=" divide-y divide-deployr-600 "
          >
            <li
              v-for="so in users"
              :key="so.id"

              class="py-4 px-2 hover:bg-deployr-700 hover:cursor-pointer"
              @click.stop="push(`/admin/user/${so.id}`)"
            >
              <div class="flex items-center space-x-4 ">
                <div class="flex-shrink-0">
                  <img class="h-8 w-8 rounded-full" :src="`${so.avatarUrl ?? `this.src='https://ui-avatars.com/api/?name=${so.username}`}`" :onerror="`this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(so.username ?? 'unknown')}'`">
                </div>
                <div class="flex-1 min-w-0 text-left">
                  <p class="text-sm font-medium text-gray-200 truncate flex flex-row items-center">
                    <eos-icons-admin-outlined v-if="so.isAdmin" class="mr-1 text-green-500" />{{ so.username }}
                  </p>
                  <p class="text-sm text-gray-400 truncate">
                    <span class="text-deployr-200 overElipse text-left"><strong>{{ so.maxAllowedShoutouts }} allowed shoutouts</strong></span>
                  </p>
                </div>
                <div>
                  <ant-design-delete-outlined class="cursor-pointer hover:text-red-500" @click.stop="removeUser(so.id)" />
                  <!--<Spinner v-else class="w-5 h-5" />-->
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="flex flex-col w-full justify-center items-center">
          <div class="text-center">
            <ant-design-exclamation-circle-outlined class="mx-auto h-12 w-12" />
            <h3 class="mt-2 text-sm font-medium text-gray-200">
              No users found
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Perhaps try a different search query?
            </p>
          </div>
        </div>
      </DataLoader>
    </div>
  </div>
  <div v-else class="flex flex-col justify-center items-center">
    <Spinner />
  </div>
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
