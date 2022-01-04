<script setup lang="ts">

</script>

<template>
  <nav
    text="light-900 opacity-80"
    position="fixed top-auto lg:top-0 bottom-0 lg:bottom-full left-0 right-0 lg:right-d"
    z="500"
    p="lg:b-10"
    overflow="x-hidden y-auto"
    transition="~ origin-left transform"
    bg="deployr-800"
    w="lg:60 full"
    h="lg:full 15"
    flex="~ row lg:col"
    shadow="lg"
  >
    <h1 class="sm:text-2xl text-2xl font-medium mr-2 lg:mb-2 lg:mr-0 text-gray-400 lg:flex items-center px-4 py-4 lg:block hover:bg-dca-600 lg:hover:bg-transparent">
      <router-link to="/" class="lg:flex lg:flex-row m-auto">
        <span class="lg:hidden inline">CSO</span><span class="hidden lg:inline"> Custom Shoutouts</span>
      </router-link>
    </h1>

    <div p="x-4" space="lg:y-2 x-2 lg:x-0" flex="~ lg:col row" items="-lg:center">
      <NavigationLink to="/">
        <template #icon>
          <ant-design-home-outlined />
        </template>
        Dashboard
      </Navigationlink>
      <NavigationLink to="/howto">
        <template #icon>
          <bx-bx-help-circle />
        </template>
        How To
      </Navigationlink>
    </div>
    <!--<router-link
      to="/profile"
      class="text-gray-500 absolute bottom-0 lg:flex items-center text-left bg-deployr-700 w-full p-3 hover:bg-deployr-600 cursor-pointer hidden"
    >
      <img class="rounded-full w-8 h-8 bg-dark-500" :src="user?.photoURL ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(getAcc()?.username)}`" />
      <span class="ml-2">{{ getAcc()?.username }}</span>
      <a href="#signOut" class="hover:bg-deployr-800 rounded-full ml-auto p-2" @click="signOut"><bytesize-sign-out /></a>
    </router-link>
    <router-link
      to="/profile"
      class="h-full text-gray-500 absolute right-0 inline text-left bg-deployr-700 p-3 hover:bg-deployr-600 cursor-pointer lg:hidden mr-auto pt-3"
    >
      <img class="rounded-full w-8 h-8 bg-dark-500" :src="user?.photoURL ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(getAcc()?.username)}`" />
    </router-link>-->
  </nav>
  <!-- Primary Loading Dialog -->
  <!--<PageLoader v-if="fetching" />-->
</template>
