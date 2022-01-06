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

const emit = defineEmits(['refreshCodes'])
const props = defineProps<{bus: UseEventBusReturn<string>}>()
props.bus.on((e) => {
  if (e === 'openPanel')
    open.value = true
})

const admin = ref(false)
const msg = ref('')

const add = async() => {
  loading.value = true
  const resp = await executeMutation({
    input: {
      admin: admin.value,
      comment: msg.value,
    },
  })

  if (resp.error) {
    Swal.fire({
      title: 'Error!',
      text: `${resp.error.message.replace('[GraphQL] ', '')}`,
      icon: 'error',
    })

    loading.value = false
    return
  }

  open.value = false
  loading.value = false

  admin.value = false
  msg.value = ''
  emit('refreshCodes', resp.data.createSignupCode)

  setTimeout(() => {
    createToast({
      type: 'success',
      title: 'Code generated',
      message: 'The code has been generated.',
      duration: 2,
    })
  }, 1000)
}
</script>

<gql mutation>
mutation($input: CreateSignupCodeInput!) {
    createSignupCode(input: $input) {
        code
        isAdmin
        creatorId
        used
        usedAt
        created
        comment
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
                        Add Shoutout
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
                        <div class="relative flex items-start">
                          <div class="flex items-center h-5">
                            <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                          </div>
                          <div class="ml-3 text-sm">
                            <label for="candidates" class="font-medium text-gray-300">Admin</label>
                            <p id="candidates-description" class="text-gray-500">
                              Whether the user who uses this code will be made admin.
                            </p>
                          </div>
                        </div>
                        <div>
                          <label for="description" class="block text-sm font-medium text-gray-200">
                            Comment <span class="text-gray-400">({{ msg.length }}/500)</span>
                          </label>
                          <div class="mt-1">
                            <textarea
                              id="description"
                              v-model="msg"
                              maxlength="500"
                              name="description"
                              rows="2"
                              class="block w-full shadow-sm sm:text-sm focus:ring-teal-500 focus:border-teal-500 border-deployr-600 rounded-md bg-deployr-800 rounded-md p-3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!loading" class="flex-shrink-0 px-4 py-4 flex justify-end">
                  <button type="button" class="bg-red-800 py-2 px-4 border border-red-900 rounded-md shadow-sm text-sm font-medium text-gray-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" @click="open = false">
                    Cancel
                  </button>
                  <button class="ml-4 inline-flex justify-center py-2 px-4 border border-teal-900 shadow-sm text-sm font-medium rounded-md text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" @click="add">
                    Add
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
