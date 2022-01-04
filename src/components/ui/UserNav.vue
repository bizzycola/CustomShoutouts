<script lang="ts" setup>
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { account } from '~/logic/store'
import { authClient } from '~/modules/auth'

const accountData = JSON.parse(account.value)

let reDir = (window.location.hostname === 'localhost') ? `http://localhost:${window.location.port}` : 'https://cso.bizzy.live'
if (window.location.hostname === '192.168.0.213') reDir = `http://192.168.0.213:${window.location.port}`

const signIn = async() => {
  await authClient.value?.loginWithRedirect()
}
const signOut = () => {
  authClient.value?.logout({
    returnTo: reDir,
  })
}
</script>

<template>
  <div v-if="accountData" class="fixed top-0 right-0 rounded-full m-3 z-1000 mr-12 focus:outline-none select-none">
    <!---->
    <Menu as="div" class="relative inline-block text-left outline-none select-none">
      <div>
        <MenuButton
          class="text-sm font-medium rounded-md flex flex-row items-center text-left p-3 text-white focus:outline-none select-none"
        >
          <img
            class="flex-3 display-inline w-10 rounded-full cursor-pointer mr-2 hover:opacity-75"
            :src="accountData?.avatarUrl"
          >
        </MenuButton>
      </div>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="outline-none select-none absolute right-0 w-56 mt-2 origin-top-right bg-deployr-800 divide-y divide-deployr-100 rounded-md shadow-lg ring-1 ring-white ring-opacity-5 focus:outline-none"
        >
          <div class="px-1 py-1">
            <MenuItem v-slot="{ active }">
              <button
                :class="[
                  active ? '!bg-teal-500 !bg-opacity-20 text-teal-200' : 'text-gray-200',
                  'group flex rounded-md items-center w-full px-2 py-2 text-sm',
                ]"
                bg="hover:(teal-500 opacity-10)"
                @click="signOut"
              >
                <bytesize-sign-out
                  :active="active"
                  class="w-5 h-5 mr-2"
                  aria-hidden="true"
                />
                Sign Out
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>
  </div>
  <div v-else class="fixed top-0 right-0 rounded-full shadow-md m-5  z-1000 text-white bg-deployr-700 hover:bg-dca-800 cursor-pointer p-3" @click="signIn">
    <teenyicons-signin-outline />
  </div>
</template>

<style>
.select-none {
    user-select: none;
}
</style>
