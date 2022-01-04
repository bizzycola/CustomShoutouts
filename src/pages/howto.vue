<script lang="ts" setup>
import { account } from '~/logic/store'
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <span class="text-2xl">Creating Shoutouts</span>
    <div class="flex-1 p-3 rounded-md bg-deployr-800 -lg:w-full -lg:m-2 lg:w-2xl mt-2 text-left mb-2">
      When creating a new custom shoutout, you're given a few special parameters you can use to get the game, title, username and twitch link of the user you are shouting out.<br>
      <br>
      The variables can use are as follows:<br>
      <div class="bg-deployr-600 p-2 w-full block">
        <strong class="font-bold">{user}</strong>: Returns their username<br>
        <strong class="font-bold">{title}</strong>: Returns their set stream title<br>
        <strong class="font-bold">{game}</strong>: Returns their set stream game<br>
        <strong class="font-bold">{link}</strong>: Returns the twitch link of the user<br>
      </div><br>
      Here's an example custom shoutout:<br> <strong class="bg-deployr-600 p-2 w-full block">Hey, check out {user}! They last played {game} at {link}.</strong><br>
      This could then become:<br><strong class="bg-deployr-600 p-2 w-full block">Hey, check out BizzyColah! They last played Banjo-Kazooie at https://twitch.tv/bizzycolah</strong>
      <br><br>
      <strong>Remember</strong>: You can head over to the Settings page to set the default shoutout for any users not in your custom list.
    </div>

    <span class="text-2xl">StreamElements</span>
    <div class="flex-1 p-3 rounded-md bg-deployr-800 -lg:w-full -lg:m-2 lg:w-2xl mt-2 text-left">
      To setup your new custom shoutouts with the StreamElements chat bot, set your shoutout command to the following:<br>
      <strong class="bg-deployr-600 p-2 w-full block">${urlfetch https://csoapi.bizzy.live/api/shoutouts/{{ JSON.parse(account).id }}/${1}}</strong>
    </div>
  </div>
</template>
