<script setup lang="ts">
import { useDataStore } from '@/stores/data';

const store = useDataStore();
store.getWebsocketSubscriptionUrl().then((FeedApiUrl: string) => {
  store.getHome().then(() => {
    store.subscribeToLiveMeasurement(FeedApiUrl);
  });
});

const getTimeLastAboveThreshold = function(): string {
  const lastAboveThreshold = store.getLastTimestampAboveThreshold(3500);
  if (lastAboveThreshold == null) {
    return 'Ukjent';
  }
  return getTextualSince(lastAboveThreshold.getTime());
}

const getTextualSince = function(timestamp: number): string {
  if (timestamp == null) {
    return 'Ukjent';
  }
  const now = new Date().getTime();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return `${seconds} sekunder siden`;
  } else if (minutes < 60) {
    return `${minutes} minutter siden`;
  } else if (hours < 24) {
    return `${hours} timer siden`;
  } else if (days < 7) {
    return `${days} dager siden`;
  } else if (weeks < 4) {
    return `${weeks} uker siden`;
  } else if (months < 12) {
    return `${months} måneder siden`;
  } else {
    return `${years} år siden`;
  }
}
</script>

<template>
  <div>
    <header>
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <span class="navbar-brand mb-0 h1">{{ store.home.address.address1 }}, {{ store.home.address.city }}</span>
        </div>
      </nav>
    </header>
    <main>
      <div class="row">
        <div class="card" style="width:30%;margin:1rem;">
          <div class="card-body">
            <h5 class="card-title">Siste avlesning</h5>
            <p class="card-text">{{ store.getLatestPower() }}</p>
          </div>
        </div>
        <div class="card" style="width:30%;margin:1rem;">
          <div class="card-body">
            <h5 class="card-title">Varmepumpa startet sist</h5>
            <p class="card-text">{{ getTimeLastAboveThreshold() }}</p>
          </div>
        </div>
        <div class="card" style="width:30%;margin:1rem;">
          <div class="card-body">
            <h5 class="card-title">Klokka er</h5>
            <p class="card-text">{{ new Date().toLocaleTimeString() }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>

</style>
