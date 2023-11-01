<script setup lang="ts">
import { useDataStore } from '@/stores/Data';

const store = useDataStore();
store.getHomeId().then((HomeId: string) => {
  store.getWebsocketSubscriptionUrl().then((FeedApiUrl: string) => {
    store.subscribeToLiveMeasurement(HomeId, FeedApiUrl);
  });
});
</script>

<template>
  <div>
    <header>
    </header>
    <main>

    </main>
  </div>
</template>

<style scoped>

</style>
