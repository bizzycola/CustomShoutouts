<script lang="ts" setup>
import { account } from '~/logic/store'
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <div class="pb-5 border-b border-deployr-600 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl mb-3">
      <h3 class="text-2xl leading-6 font-medium text-gray-200">
        Setup Guide
      </h3>
    </div>

    <div class="bg-deployr-800 px-4 py-5 border-b border-deployr-600 sm:px-6 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl rounded-t-md shadow-lg">
      <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div class="ml-4 mt-2">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            StreamElements
          </h3>
        </div>
      </div>
    </div>
    <div class="flex-1 p-3 rounded-md bg-deployr-800 -lg:w-full -lg:m-2 lg:w-2xl text-left xl:w-4xl shadow-lg">
      To setup your new custom shoutouts with the StreamElements chat bot, set your shoutout command to the following:<br>
      <strong class="bg-deployr-600 p-2 w-full block select-all">${urlfetch https://csoapi.bizzy.live/api/shoutouts/{{ JSON.parse(account).id }}/${1}}</strong>
    </div>

    <hr class="mb-3 mt-3 border-b-deployr-600 border-0 border-b-1 -lg:w-full -lg:m-2 lg:w-2xl xl:w-4xl">

    <div class="bg-deployr-800 px-4 py-5 border-b border-deployr-600 sm:px-6 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl rounded-t-md shadow-lg">
      <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div class="ml-4 mt-2">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            StreamLabs
          </h3>
        </div>
      </div>
    </div>
    <div class="flex-1 p-3 rounded-md bg-deployr-800 -lg:w-full -lg:m-2 lg:w-2xl xl:w-4xl text-left shadow-lg">
      To setup your new custom shoutouts with the StreamLabs CloudBot, set your shoutout command to the following:<br>
      <strong class="bg-deployr-600 p-2 w-full block select-all">{readapi.https://csoapi.bizzy.live/api/shoutouts/{{ JSON.parse(account).id }}/{target.name}}</strong>
    </div>

    <hr class="mb-3 mt-3 border-b-deployr-600 border-0 border-b-1 -lg:w-full -lg:m-2 lg:w-2xl xl:w-4xl">

    <div class="bg-deployr-800 px-4 py-5 border-b border-deployr-600 sm:px-6 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl rounded-t-md shadow-lg">
      <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div class="ml-4 mt-2">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            NightBot
          </h3>
        </div>
      </div>
    </div>
    <div class="flex-1 p-3 rounded-md bg-deployr-800 -lg:w-full -lg:m-2 lg:w-2xl xl:w-4xl text-left shadow-lg">
      To setup your new custom shoutouts with NightBot, set your shoutout command Message to the following:<br>
      <strong class="bg-deployr-600 p-2 w-full block select-all">$(urlfetch https://csoapi.bizzy.live/api/shoutouts/{{ JSON.parse(account).id }}/$(1))</strong>
    </div>

    <hr class="mb-3 mt-3 border-b-deployr-600 border-0 border-b-1 -lg:w-full -lg:m-2 lg:w-2xl xl:w-4xl">

    <div class="bg-deployr-800 px-4 py-5 border-b border-deployr-600 sm:px-6 xl:w-4xl -lg:w-full -lg:mt-5 lg:w-2xl rounded-t-md shadow-lg">
      <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div class="ml-4 mt-2">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            Creating Shoutouts
          </h3>
        </div>
      </div>
    </div>
    <div class="flex-1 p-3 rounded-md bg-deployr-800 -lg:w-full -lg:m-2 lg:w-2xl xl:w-4xl text-left mb-2 shadow-lg">
      When creating a new custom shoutout, you're given a few special parameters you can use to get the game, title, username and twitch link of the user you are shouting out.<br>
      <br>
      The variables can use are as follows:<br>
      <div class="bg-deployr-600 p-2 w-full block">
        <strong class="font-bold select-all">{user}</strong>: Returns their username<br>
        <strong class="font-bold select-all">{title}</strong>: Returns their set stream title<br>
        <strong class="font-bold select-all">{game}</strong>: Returns their set stream game<br>
        <strong class="font-bold select-all">{link}</strong>: Returns the twitch link of the user<br>
      </div><br>
      Here's an example custom shoutout:<br> <strong class="bg-deployr-600 p-2 w-full block select-all">Hey, check out {user}! They last played {game} at {link}.</strong><br>
      This could then become:<br><strong class="bg-deployr-600 p-2 w-full block select-all">Hey, check out BizzyColah! They last played Banjo-Kazooie at https://twitch.tv/bizzycolah</strong>
      <br><br>
      <strong>Remember</strong>: You can head over to the Settings page to set the default shoutout for any users not in your custom list.
    </div>
  </div>
</template>

<style scoped>

</style>
