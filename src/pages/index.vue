<script setup lang="ts">
import { useEventBus } from '@vueuse/core'
import { useMutation, useQuery } from 'vql'
import Swal from 'sweetalert2'

const { fetching, error, data, executeQuery } = useQuery({})
const { executeMutation, fetching: fetchMutation } = useMutation()

const bus = useEventBus<string>('soPanelEvents')
const openAdd = () => {
  bus.emit('openPanel')
}

const loadShoutouts = async() => {
  executeQuery({})
}

const removeSO = async(id: string) => {
  const resp = await executeMutation({
    id,
  })

  if (resp.error) {
    Swal.fire({
      title: 'Error!',
      text: `${resp.error.message}`,
      icon: 'error',
    })
    return
  }

  loadShoutouts()
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
    <span class="text-2xl">Custom Shoutouts</span>
    <div class="flex-1 p-3 rounded-md bg-deployr-800 -lg:w-full -lg:m-2 lg:w-2xl mt-2">
      <button
        class="bg-green-800 p-2 hover:bg-green-700 flex flex-row items-center"
        @click="openAdd"
      >
        <carbon-add-alt class="mr-2" />Add Shoutout
      </button>
    </div>
    <div
      class="flex-1 p-3 rounded-md bg-deployr-800 -lg:w-full -lg:m-2 lg:w-2xl mt-2 flex flex-col items-start justify-center"
    >
      <DataLoader :fetching="fetching" :error="error?.message" message="Loading shoutouts">
        <div class="flex flex-col max-h-md overflow-auto gslist w-full">
          <div
            v-for="so in data.shoutouts.nodes"
            :key="so.id"
            class="bg-deployr-700 cursor-pointer w-full p-2 mb-2 justify-start flex flex-row items-center justify-start content-center hover:bg-deployr-600 w-full"
          >
            <span class="mr-1">
              <img
                :src="so.avatar"
                class="rounded-full w-5 mr-2"
                :onerror="`this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(so.username ?? 'unknown')}'`"
              >
            </span>
            <span class="mr-2">{{ so.username }}</span>
            <span class="text-deployr-200 overElipse text-left">{{ so.response }}</span>
            <div class="ml-auto flex flex-row">
              <ant-design-delete-outlined v-if="!fetchMutation" class="cursor-pointer hover:text-red-500" @click="removeSO(so.id)" />
              <Spinner v-else class="w-5 h-5" />
            </div>
          </div>
        </div>
      </DataLoader>
    </div>
  </div>

  <CreateShoutoutDrawer :bus="bus" @refresh-shoutouts="loadShoutouts" />
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
</style>
