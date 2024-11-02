<script setup lang="ts">
import type {FilePermissions} from "@/services/phoenix/gen/phoenix-rest-service";

const props = defineProps<{ permission: FilePermissions }>()
console.log(`props:`, props.permission)
</script>

<template>
  <div>
    <p>
      <span>User:</span><code>{{ permission.user_id }}</code>
    </p>
    <p>
      <span>Permission:</span><code>{{ permission.permission }}</code>
    </p>
  </div>
</template>

<style scoped lang="scss">

</style>