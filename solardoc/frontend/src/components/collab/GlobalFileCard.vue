<script setup lang="ts">
import type { GlobalFile } from '@/services/phoenix/gen/phoenix-rest-service'
import UserRef from '@/components/common/UserRef.vue'
import TimeRef from '@/components/common/TimeRef.vue'

defineProps<{ file: GlobalFile }>()
</script>

<template>
  <div class="global-files-overview-file">
    <div class="file-infos">
      <p>
        <span>Filename:</span><code>{{ file.file_name }}</code>
      </p>
      <p>
        <span>Owner:</span>
        <UserRef :userName="file.owner_name" :id="file.owner_id" />
      </p>
      <p>
        <span>Last Edited:</span>
        <TimeRef :date-time="file.last_edited" />
      </p>
      <p>
        <span>Created:</span>
        <TimeRef :date-time="file.created" />
      </p>
    </div>
    <div>
      <button class="highlighted-button">Join</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

.global-files-overview-file {
  display: flex;
  height: var.$collab-file-card-height;
  width: var.$collab-file-card-width;
  flex-flow: column wrap;
  justify-content: center;
  align-content: space-between;
  border: 0.15rem solid var.$text-color;
  border-radius: 1rem;
  margin: 0 1rem;
  padding: 1rem;
  gap: 1rem;

  button {
    height: 2rem;
  }

  #slide-placeholder {
    $border-width: 3px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;

    // We will simulate the size of a presentation so 2:1 ratio
    width: 100%;
    padding-top: 50%;
    border-radius: $border-width;
    background-color: var.$placeholder-background;

    &::before {
      content: '???';
      color: var.$text-color;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      position: absolute;
      justify-content: center;
      align-content: center;
      flex-wrap: wrap;
      z-index: 101;
      font-size: 0.75rem;
      border-radius: $border-width;
      background-color: var.$placeholder-background;
    }

    &:hover::after {
      z-index: 99;
      position: absolute;
      content: '';
      top: calc(-1 * $border-width);
      left: calc(-1 * $border-width);
      width: calc(100% + $border-width * 2);
      height: calc(100% + $border-width * 2);
      background: linear-gradient(
        60deg,
        hsl(224, 85%, 66%),
        hsl(269, 85%, 66%),
        hsl(314, 85%, 66%),
        hsl(359, 85%, 66%),
        hsl(44, 85%, 66%),
        hsl(89, 85%, 66%),
        hsl(134, 85%, 66%),
        hsl(179, 85%, 66%)
      );
      background-size: 300% 300%;
      background-position: 0 50%;
      border-radius: calc(2 * $border-width);
      animation: moveGradient 4s alternate infinite;
    }

    @keyframes moveGradient {
      50% {
        background-position: 100% 50%;
      }
    }
  }

  .file-infos {
    display: flex;
    flex-flow: column wrap;
    width: calc(var(--profile-file-card-width) - 2 * 1rem);
    overflow: visible;
    gap: 0.4rem;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */

    p,
    p * {
      display: flex;
      white-space: nowrap;
      margin: 0;
    }

    code {
      padding: 0 0 0 0.5rem;
      margin: 0;
    }
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 0 2rem 0 var.$box-shadow-color;
  }
}
</style>
