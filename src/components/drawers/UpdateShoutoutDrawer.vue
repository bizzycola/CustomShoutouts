<script lang="ts" setup>
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import type { UseEventBusReturn } from '@vueuse/core'
import { useMutation } from 'vql'
import Swal from 'sweetalert2'
import { useToast } from '~/composables/useToast'

const { createToast } = useToast()
const { executeMutation } = useMutation()

const open = ref(false)
const loading = ref(false)

const emit = defineEmits(['refreshShoutouts'])
const props = defineProps<{bus: UseEventBusReturn<string>; shoutout: any}>()

const userName = ref<string>(props.shoutout.username)
const msg = ref<string>(props.shoutout.response)

props.bus.on((e) => {
  if (e === 'openUpdatePanel') {
    userName.value = props.shoutout.username
    msg.value = props.shoutout.response

    open.value = true
  }
})

watch(props, (nw) => {
  if (!nw) return
  userName.value = nw.shoutout.username
  msg.value = nw.shoutout.response
}, { deep: true })

const update = async() => {
  loading.value = true
  const resp = await executeMutation({
    input: {
      id: props.shoutout.id,
      response: msg.value,
    },
  })

  if (resp.error) {
    Swal.fire({
      title: 'Error!',
      text: `${resp.error.message.replace('[GraphQL] ', '')}`,
      icon: 'error',
    })
    return
  }

  open.value = false
  loading.value = false
  emit('refreshShoutouts', { id: props.shoutout.id, response: msg.value })

  setTimeout(() => {
    createToast({
      type: 'success',
      title: 'Shoutout Updated',
      message: 'The custom shoutout has been updated.',
      duration: 2,
    })
  }, 1000)
}
</script>

<gql mutation>
mutation($input: UpdateShoutoutInput!) {
    updateShoutout(input: $input) {
        id,
        username,
        response,
        avatar
    }
}
</gql>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="fixed inset-0 overflow-hidden z-900" @close="open = false">
      <div class="fixed inset-0 overflow-hidden opacity-50 bg-deployr-800 z-950" />
      <div class="absolute inset-0 overflow-hidden z-1000">
        <DialogOverlay class="absolute inset-0" />

        <div class="fixed inset-y-0 pl-16 max-w-full right-0 flex">
          <TransitionChild
            as="template"
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enter-from="translate-x-full"
            enter-to="translate-x-0"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leave-from="translate-x-0"
            leave-to="translate-x-full"
          >
            <div class="w-screen max-w-md">
              <div class="h-full divide-y divide-gray-800 flex flex-col bg-deployr-700 shadow-xl">
                <div class="flex-1 h-0 overflow-y-auto mb-5">
                  <div class="py-6 px-4 bg-deployr-800 sm:px-6">
                    <div class="flex items-center justify-between">
                      <DialogTitle class="text-lg font-medium text-white">
                        Update Shoutout
                      </DialogTitle>
                      <div class="ml-3 h-7 flex items-center">
                        <button type="button" class=" rounded-md text-gray-400 hover:text-white focus:outline-none " @click="open = false">
                          <span class="sr-only">Close panel</span>
                          <ant-design-close-circle-outlined class="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="flex-1 flex flex-col justify-between">
                    <div class="px-4 divide-y divide-gray-900 sm:px-6">
                      <div class="space-y-6 pt-6 pb-5">
                        <div>
                          <label for="project-name" class="block text-sm font-medium text-gray-200">
                            Username
                          </label>
                          <div class="mt-1">
                            <input
                              id="project-name"
                              v-model="userName"
                              type="text"
                              name="project-name"
                              readonly
                              class="block w-full shadow-sm sm:text-sm focus:ring-teal-500 focus:border-teal-500 border-deployr-600 rounded-md bg-deployr-800"
                            >
                          </div>
                        </div>
                        <div>
                          <label for="description" class="block text-sm font-medium text-gray-200">
                            Message
                          </label>
                          <div class="mt-1">
                            <textarea id="description" v-model="msg" name="description" rows="2" class="block w-full shadow-sm sm:text-sm focus:ring-teal-500 focus:border-teal-500 border-deployr-600 rounded-md bg-deployr-800 rounded-md p-3" />
                          </div>
                          <p id="email-description" class="mt-2 text-sm text-gray-500">
                            If the rendered shoutout exceeds 500 characters, it will be cut off by Twitch.
                          </p>
                        </div>
                        <div class="text-gray-300 text-sm border-t-1 border-t-deployr-600">
                          <span class="text-md font-bold block font-medium mt-2 mb-1">Variables</span>
                          <strong class="font-bold select-all">{user}</strong>: Returns their username<br>
                          <strong class="font-bold select-all">{title}</strong>: Returns their set stream title<br>
                          <strong class="font-bold select-all">{game}</strong>: Returns their set stream game<br>
                          <strong class="font-bold select-all">{link}</strong>: Returns the twitch link of the user<br>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!loading" class="flex-shrink-0 px-4 py-4 flex justify-end">
                  <button type="button" class="bg-red-800 py-2 px-4 border border-red-900 rounded-md shadow-sm text-sm font-medium text-gray-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" @click="open = false">
                    Cancel
                  </button>
                  <button class="ml-4 inline-flex justify-center py-2 px-4 border border-teal-900 shadow-sm text-sm font-medium rounded-md text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" @click="update">
                    Update
                  </button>
                </div>
                <div v-else class="flex-shrink-0 px-4 py-4 flex justify-end">
                  <Spinner />
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped>
::-webkit-scrollbar {
    width: 5px !important;
}
</style>
