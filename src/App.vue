<script setup lang="ts">
import { useMutation, useQuery, useSubscription } from 'vql'
import { useAccount } from './logic/account'
import { useToast } from '~/composables/useToast'

const useAcc = useAccount(true)

const { createToast } = useToast()

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'Custom Shoutouts',
  meta: [
    { name: 'description', content: 'Setup custom shoutout messages for your favourite Twitch chatbot' },
  ],
})

const { executeMutation } = useMutation()

/** Notification Subscription */
console.log('[Info] Subscribing to notifications')
const userNotifs = useSubscription({}, (d: any = [], response: any) => {
  console.log('dresp', d, response)
  return [response.onNotification]
})

const sendNotifToast = (notif) => {
  createToast({
    type: notif.level,
    title: notif.title,
    message: notif.content,
    duration: 3,
  })

  setTimeout(async() => {
    executeMutation({ ids: [notif.id] })
  }, 3)
}

watch(userNotifs.data, (nw) => {
  if (!nw) return

  console.log('got notif', nw)

  for (let i = 0; i < nw.length; i++) {
    if (i === 0)
      sendNotifToast(nw[i])

    else
      setTimeout(() => sendNotifToast(nw[i]), 3 * i)
  }
})

watch(userNotifs.error, (nw) => {
  console.log('notif error', nw)
})

/** Notification Initial Load */
const { data } = useQuery({})
watch(data, (nw) => {
  console.log('data', nw)
  if (!nw.unreadNotifications) return

  for (let i = 0; i < nw.unreadNotifications.length; i++) {
    if (i === 0)
      sendNotifToast(nw.unreadNotifications[i])

    else
      setTimeout(() => sendNotifToast(nw.unreadNotifications[i]), 3 * i)
  }
})
</script>

<gql subscription>
subscription {
  onNotification {
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

<gql>
{
  unreadNotifications {
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

<gql mutation>
mutation($ids: [UUID!]!) {
  markNotificationsRead(ids: $ids)
}
</gql>

<template>
  <router-view />
  <ToastDispatcher />
</template>
