<script lang="ts" setup>
import { useMutation, useQuery } from 'vql'
import Swal from 'sweetalert2'

const { fetching, error, data, executeQuery } = useQuery({})
const { executeMutation, fetching: fetchMutation } = useMutation()

const so = ref('')

const stop = watch(data, (nw) => {
  so.value = nw.defaultSO
  stop()
})

const saveSo = async() => {
  const resp = await executeMutation({
    so: so.value,
  })

  if (resp.error) {
    Swal.fire({
      title: 'Error!',
      text: `${resp.error.message.replace('[GraphQL] ', '')}`,
      icon: 'error',
    })
  }
}
</script>

<gql>
{
    defaultSO
}
</gql>

<gql mutation>
mutation($so: String!) {
    updateDefaultSO(so: $so)
}
</gql>

<template>
  <div class="flex flex-col justify-center items-center">
    <div class="bg-deployr-800 px-4 py-5 border-b border-deployr-600 sm:px-6 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl rounded-t-md">
      <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div class="ml-4 mt-2">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            Settings
          </h3>
        </div>
      </div>
    </div>
    <div
      class="flex-1 p-5 rounded-b-md bg-deployr-800 -lg:w-full -lg:m-2 lg:w-2xl xl:w-4xl flex flex-col items-start justify-start "
      :class="{'items-center': fetching, 'w-full': !fetching}"
    >
      <DataLoader :fetching="fetching" :error="error?.message" message="Loading settings">
        <label for="comment" class="block text-md font-medium text-gray-100">Default Shoutout Message</label>
        <div class="mt-1 w-full ">
          <textarea id="description" v-model="so" name="description" rows="2" class="block w-full shadow-sm sm:text-sm focus:ring-teal-500 focus:border-teal-500 border-deployr-600 rounded-md bg-deployr-700 rounded-md p-3" />
        </div>
        <div class="mt-3 border-t-1 border-t-deployr-400 w-full text-left pt-2 ">
          <button
            v-if="!fetchMutation"
            class="bg-green-800 p-2 hover:bg-green-700 flex flex-row items-center pl-5 pr-5"
            :disabled="so.length < 2 || so.length > 500"
            @click="saveSo"
          >
            <fa-regular-save class="mr-2" />Save
          </button>
          <Spinner v-else />
        </div>
      </DataLoader>
    </div>
  </div>
</template>
