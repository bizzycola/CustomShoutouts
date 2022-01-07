<script setup lang="ts">
import { useEventBus } from '@vueuse/core'
import { useMutation, useQuery } from 'vql'
import Swal from 'sweetalert2'
import type { Shoutout } from '~/types/shoutout'
import { useToast } from '~/composables/useToast'

const { createToast } = useToast()
const { fetching, error, data, executeQuery } = useQuery({})
const { executeMutation, fetching: fetchMutation } = useMutation()

const bus = useEventBus<string>('soPanelEvents')
const openAdd = () => {
  bus.emit('openPanel')
}

const loadShoutouts = async() => {
  executeQuery({})
}

const shoutouts = ref<Shoutout[]>([])
watch(data, (nw) => {
  if (!nw) return

  shoutouts.value = nw.shoutouts.nodes
})

const toUpdate = ref<Shoutout | null>(null)
const updateSO = (shoutout: Shoutout) => {
  const timedUpdate = (!toUpdate.value)

  toUpdate.value = shoutout

  if (timedUpdate)
    setTimeout(() => bus.emit('openUpdatePanel'), 500)
  else
    bus.emit('openUpdatePanel')
}

const removeSO = async(id: string) => {
  const resp = await executeMutation({
    id,
  })

  if (resp.error) {
    Swal.fire({
      title: 'Error!',
      text: `${resp.error.message.replace('[GraphQL] ', '')}`,
      icon: 'error',
    })
    return
  }

  // loadShoutouts()
  shoutouts.value.splice(shoutouts.value.findIndex(item => item.id === id), 1)
  createToast({
    type: 'success',
    title: 'Shoutout Removed',
    message: 'The custom shoutout has been removed.',
    duration: 2,
  })
}

const onAdded = (shoutout: Shoutout) => {
  shoutouts.value.unshift(shoutout)
}
const onUpdated = (shoutout: any) => {
  const so = shoutouts.value.findIndex(item => item.id === shoutout.id)
  shoutouts.value[so].response = shoutout.response
}
</script>

<gql>
{
    shoutouts {
        nodes {
            id
            userId
            username
            response
            avatar
            created
        }
    }
}
</gql>

<gql mutation>
mutation ($id: UUID!) {
  removeShoutout(id: $id)
}
</gql>

<template>
  <div class="flex flex-col justify-center items-center">
    <div class="bg-deployr-800 px-4 py-5 border-b border-deployr-600 sm:px-6 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl rounded-t-md shadow-lg">
      <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div class="ml-4 mt-2">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            Custom Shoutouts
          </h3>
        </div>
        <div class="ml-4 mt-2 flex-shrink-0">
          <button type="button" class="relative inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" @click="openAdd">
            Add Shoutout
          </button>
        </div>
      </div>
    </div>
    <div
      class="flex-1 p-1 bg-deployr-800 -lg:w-full xl:w-4xl -lg:m-2 -lg:mt-0 lg:w-2xl flex flex-col justify-center rounded-b-md shadow-lg"
      :class="{'items-start': !fetching, 'items-center p-15': fetching}"
    >
      <DataLoader :fetching="fetching" :error="error?.message" message="Loading shoutouts">
        <div v-if="shoutouts && shoutouts.length > 0" class="flex flex-col max-h-md overflow-auto gslist w-full -lg:mb-10" style="max-height: 50vh;">
          <ul
            role="list"
            class=" divide-y divide-deployr-600 "
          >
            <li
              v-for="so in shoutouts"
              :key="so.id"

              class="py-4 px-2 hover:bg-deployr-700 hover:cursor-pointer"
              @click.stop="updateSO(so)"
            >
              <div class="flex items-center space-x-4 ">
                <div class="flex-shrink-0">
                  <img class="h-8 w-8 rounded-full" :src="so.avatar" :onerror="`this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(so.username ?? 'unknown')}'`">
                </div>
                <div class="flex-1 min-w-0 text-left">
                  <p class="text-sm font-medium text-gray-200 truncate">
                    {{ so.username }}
                  </p>
                  <p class="text-sm text-gray-400 truncate">
                    <span class="text-deployr-200 overElipse text-left" @click.stop="updateSO(so)">{{ so.response }}</span>
                  </p>
                </div>
                <div>
                  <ant-design-delete-outlined v-if="!fetchMutation" class="cursor-pointer hover:text-red-500" @click.stop="removeSO(so.id)" />
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
              No shoutouts
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Get started by adding a custom shoutout.
            </p>
            <div class="mt-6">
              <button type="button" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-800 p-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" @click="openAdd">
                <!-- Heroicon name: solid/plus -->
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add Shoutout
              </button>
            </div>
          </div>
        </div>
      </DataLoader>
    </div>
  </div>

  <CreateShoutoutDrawer :bus="bus" @refresh-shoutouts="onAdded" />
  <UpdateShoutoutDrawer v-if="toUpdate" :bus="bus" :shoutout="toUpdate" @refresh-shoutouts="onUpdated" />
</template>

<route lang="yaml">
meta:
  layout: default
</route>

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
