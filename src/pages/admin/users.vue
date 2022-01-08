<script lang="ts" setup>
import { Dialog, DialogOverlay, DialogTitle, Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions, Switch, SwitchGroup, SwitchLabel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from 'vql'
import Swal from 'sweetalert2'

import { account } from '~/logic/store'
import { useToast } from '~/composables/useToast'
import type { AppUser } from '~/types/appUser'

const { executeMutation, fetching: fetchMutation } = useMutation()
const { executeMutation: execUpdateUser, fetching: fetchUpdateUser } = useMutation('updateUser')

const labels = [
  { name: 'Info', value: 'info' },
  { name: 'Success', value: 'success' },
  { name: 'Warning', value: 'warning' },
  { name: 'Error', value: 'error' },

]

const filter = ref('')
const filterTemp = ref('')

const { push } = useRouter()
const { fetching, error, data, executeQuery } = useQuery({ variables: { filter }, requestPolicy: 'network-only' })

const { createToast } = useToast()
const loading = ref(true)

const accData = ref<AppUser | undefined>()
onMounted(() => {
  accData.value = JSON.parse(account.value)
  if (!accData.value || !accData.value.isAdmin)
    push('/')
  else
    loading.value = false
})

// Edit Dialog
const editOpen = ref(false)
const selUser = ref<AppUser | undefined>()
const updatedSelMax = ref(0)
const updateIsAdmin = ref(false)

// Notify Dialog
const notifOpen = ref(false)
const notifUser = ref<AppUser | undefined>()
const notifTitle = ref('')
const notifMsg = ref('')
const notifType = ref(labels[0])

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

const openEdit = (user: AppUser) => {
  selUser.value = user
  updatedSelMax.value = user.maxAllowedShoutouts
  updateIsAdmin.value = user.isAdmin
  editOpen.value = true
}

const openNotif = (user: AppUser) => {
  notifUser.value = user
  notifMsg.value = ''
  notifOpen.value = true
}

const updateUser = async() => {
  const resp = await execUpdateUser({
    input: {
      userId: selUser.value?.id,
      maxShoutouts: Number.parseInt(updatedSelMax.value as any),
      isAdmin: updateIsAdmin.value,
    },
  })

  editOpen.value = false

  if (resp.error) {
    Swal.fire({
      title: 'Error!',
      text: `${resp.error.message.replace('[GraphQL] ', '')}`,
      icon: 'error',
    })
    return
  }

  const uInd = users.value.findIndex(item => item.id === selUser.value?.id)
  users.value[uInd].maxAllowedShoutouts = updatedSelMax.value

  createToast({
    type: 'success',
    title: 'Updated',
    message: 'The user has been updated.',
    duration: 2,
  })
}

const sendNotif = async() => {
  if (!notifUser.value) return

  const resp = await executeMutation({
    input: {
      userId: notifUser.value?.id,
      type: notifType.value.value,
      title: notifTitle.value,
      message: notifMsg.value,
    },
  })

  notifOpen.value = false

  if (resp.error) {
    Swal.fire({
      title: 'Error!',
      text: `${resp.error.message.replace('[GraphQL] ', '')}`,
      icon: 'error',
    })
    return
  }

  createToast({
    type: 'success',
    title: 'Notification Sent',
    message: 'The user has been sent the notification.',
    duration: 2,
  })
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

<gql mutation>
mutation($input: SendUserNotificationInput!) {
    sendUserNotification(input: $input) {
        id
        title
        content
        forId
        level
        read
        readAt
        created
    }
}
</gql>

<gql mutation name="updateUser">
mutation($input: UpdateUserInput!) {
    updateUserInput(input: $input)
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
                <div class="flex flex-row justify-start">
                  <ant-design-edit-outlined class="cursor-pointer hover:text-teal-500 mr-2" @click.stop="openEdit(so)" />
                  <akar-icons-bell class="cursor-pointer mr-2 hover:text-blue-500" @click.stop="openNotif(so)" />

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

  <!-- Edit Dialog -->
  <TransitionRoot as="template" :show="editOpen">
    <Dialog as="div" class="fixed z-2000 inset-0 overflow-y-auto" @close="editOpen = false">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-deployr-800 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div class="inline-block align-bottom bg-deployr-600 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
            <div>
              <div class=" text-center sm:mt-2">
                <DialogTitle as="h3" class="text-2xl mb-5 leading-6 font-medium text-gray-100">
                  Update {{ selUser?.username }}
                </DialogTitle>
                <div class="mt-3">
                  <SwitchGroup as="div" class="flex items-center mb-3 ">
                    <Switch v-model="updateIsAdmin" :class="[updateIsAdmin ? 'bg-teal-600' : 'bg-deployr-800', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']">
                      <span aria-hidden="true" :class="[updateIsAdmin ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200']" />
                    </Switch>
                    <SwitchLabel as="span" class="ml-3">
                      <span class="text-sm font-medium text-gray-200">Administrator </span>
                      <span class="text-sm text-gray-500" />
                    </SwitchLabel>
                  </SwitchGroup>
                  <div class="border bg-deployr-800 border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600 text-left">
                    <label for="maxshoutouts" class="block text-xs font-medium text-gray-100">Max Shoutouts</label>
                    <input
                      id="maxshoutouts"
                      v-model="updatedSelMax"
                      type="number"
                      name="maxshoutouts"
                      class="bg-deployr-800 block w-full border-0 p-0 text-gray-100 placeholder-gray-300 focus:ring-0 sm:text-sm"
                      placeholder=""
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6">
              <button type="button" class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm flex flex-row justify-start" @click="updateUser">
                <Spinner v-if="fetchUpdateUser" class="!w-5 !h-5 mr-2" />
                Update
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Notify Dialog -->
  <TransitionRoot as="template" :show="notifOpen">
    <Dialog as="div" class="fixed z-2000 inset-0 overflow-y-auto" @close="notifOpen = false">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-deployr-800 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div class="inline-block align-bottom bg-deployr-600 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle -lg:w-full lg:w-2xl sm:p-6  maxalmost">
            <div>
              <div class=" text-center sm:mt-2">
                <DialogTitle as="h3" class="text-2xl mb-5 leading-6 font-medium text-gray-100">
                  Notify {{ notifUser?.username }}
                </DialogTitle>
                <div class="mt-3">
                  <!-- Type -->
                  <Listbox v-model="notifType" as="div">
                    <ListboxLabel class="block text-sm font-medium text-gray-100 text-left shadow-md" />
                    <div class="mt-1 relative">
                      <ListboxButton class="relative w-full bg-deployr-800 border border-deployr-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-3 hover:cursor-pointer">
                        <span class="flex items-center">
                          <!-- icons -->
                          <ToastIcons :type="notifType.value" />
                          <!-- end icons -->
                          <span class="ml-3 block truncate text-gray-100">{{ notifType.name }}</span>
                        </span>
                        <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <heroicons-outline-selector class="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </ListboxButton>

                      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                        <ListboxOptions class="absolute z-10 mt-1 w-full bg-deployr-800 text-gray-200 shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm shadow-lg">
                          <ListboxOption v-for="person in labels" :key="person.name" v-slot="{ active, selected }" as="template" :value="person">
                            <li :class="[active ? 'text-white bg-indigo-600' : 'text-gray-900', 'cursor-default select-none relative py-2 pl-3 pr-9 hover:cursor-pointer']">
                              <div class="flex items-center">
                                <ToastIcons :type="person.value" />
                                <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate text-gray-100']">
                                  {{ person.name }}
                                </span>
                              </div>

                              <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                                <akar-icons-check class="h-5 w-5" aria-hidden="true" />
                              </span>
                            </li>
                          </ListboxOption>
                        </ListboxOptions>
                      </transition>
                    </div>
                  </Listbox>
                  <!-- Textarea -->
                  <div action="#" class="relative">
                    <div class="border shadow-md bg-deployr-800 border-deployr-600 rounded-lg shadow-sm overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                      <label for="title" class="sr-only">Title</label>
                      <input
                        id="title"
                        v-model="notifTitle"
                        type="text"
                        name="title"
                        class="block w-full border-0 pt-2.5 text-lg font-medium text-gray-200 placeholder-gray-200 bg-deployr-800 focus:ring-0"
                        placeholder="Title"
                      >
                      <label for="description" class="sr-only">Description</label>
                      <textarea
                        id="description"
                        v-model="notifMsg"
                        rows="2"
                        name="description"
                        class="bg-deployr-800 block w-full border-0 text=gray-300 py-0 pl-3 resize-none placeholder-gray-200 focus:ring-0 sm:text-sm"
                        placeholder="Write a message..."
                      />

                      <!-- Spacer element to match the height of the toolbar -->
                      <div aria-hidden="true">
                        <div class="py-2">
                          <div class="h-9" />
                        </div>
                        <div class="h-px" />
                        <div class="py-2">
                          <div class="py-px">
                            <div class="h-9" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="absolute bottom-0 inset-x-px">
                      <!-- Actions: These are just examples to demonstrate the concept, replace/wire these up however makes sense for your project. -->
                      <div class="flex flex-nowrap justify-end py-2 px-2 space-x-2 sm:px-3" />
                      <div class="border-t border-deployr-600 px-2 py-2 flex justify-between items-center space-x-3 sm:px-3">
                        <div class="flex" /> <!-- file -->
                        <div class="flex-shrink-0">
                          <button type="button" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex flex-row justify-start" @click="sendNotif">
                            <akar-icons-send v-if="!fetchMutation" class="mr-2" />
                            <Spinner v-else class="!w-5 !h-5 mr-2" />
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- AAAA -->
                </div>
              </div>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
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

.maxalmost {
    max-width: calc(100% - 25px) !important;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
    -moz-appearance:textfield; /* Firefox */
}
</style>
