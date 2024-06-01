<script lang="ts" setup>
import {useLoadingStore} from '@/stores/loading'

defineProps<{
  to: string
}>()

const loadingStore = useLoadingStore()

function setLoading(state: boolean): void {
  loadingStore.setLoading(state)
}
</script>

<template>
  <RouterLink :to="to" @click="setLoading(true)">
    <slot />
  </RouterLink>
</template>
