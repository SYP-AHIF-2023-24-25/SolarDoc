<script setup lang="ts">
import {getHumanReadablePreciseDate, getHumanReadableTimeInfo} from "@/scripts/format-date";
import PaddedInfoBox from "@/components/common/PaddedInfoBox.vue";
import {ref} from "vue";

const props = defineProps<{ dateTime: Date | number, update?: boolean }>()

const timeProp = ref(getHumanReadableTimeInfo(props.dateTime))
if (props.update) {
  setInterval(() => {
    timeProp.value = getHumanReadableTimeInfo(props.dateTime)
  }, 1000)
}
</script>

<template>
  <span :class="'time-ref-' + String(dateTime).replace(/[^a-zA-Z0-9]/g, '')">
    <code>{{ timeProp }}</code>
    <PaddedInfoBox :infoText="getHumanReadablePreciseDate(dateTime)"/>
  </span>
</template>

<style scoped lang="scss">
code {
  padding: 0 0 0 0.5rem;
  margin: 0;
}
</style>
