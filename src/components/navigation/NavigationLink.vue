<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const props = defineProps<{
  to: string
}>()
const isActive = computed(() => {
  if (props.to === '/' && route.path === '/')
    return true
  else if (props.to === '/')
    return false
  if (route.path.includes(props.to))
    return true
  return false
})
</script>

<template>
  <router-link
    :to="to"
    flex="~ row 1"
    items="center"
    space="x-2"
    p="x-4 y-2"
    border="rounded"
    bg="hover:(counterly-logo-light opacity-10)"
    :class="{ '!bg-counterly-logo-light !bg-opacity-20 text-counterly-logo-lighter': isActive }"
  >
    <span class="flex flex-col items-center justify-center block">
      <slot name="icon" />
    </span>
    <span display="hidden lg:block">
      <slot />
    </span>
  </router-link>
</template>
