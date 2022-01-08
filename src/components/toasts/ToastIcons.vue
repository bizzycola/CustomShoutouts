<script lang="ts" setup>
defineProps<{type: string}>()
</script>

<template>
  <akar-icons-circle-check
    v-if="type === 'success'"
    class="h-6 w-6 text-green-400"
    aria-hidden="true"
  />
  <akar-icons-triangle-alert
    v-if="type === 'warning'"
    class="h-6 w-6 text-yellow-400"
  />
  <bx-bx-error-circle v-if="type === 'error'" class="h-6 w-6 text-red-400" />
  <akar-icons-info v-if="type === 'info'" class="h-6 w-6 text-blue-400" />
</template>
