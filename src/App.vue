<script setup lang="ts">
import { useDataStore } from '@/stores/data';

const store = useDataStore();
store.getWebsocketSubscriptionUrl().then((FeedApiUrl: string) => {
  store.getHome().then(() => {
    store.subscribeToLiveMeasurement(FeedApiUrl);
  });
});

const getTimeLastAboveThreshold = function(): string {
  const lastAboveThreshold: Date | null = store.getLastTimestampAboveThreshold(4000);
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

const getClassForTime = function(): string {
  const timestamp = store.getLastTimestampAboveThreshold(4000)?.getTime();
  if (timestamp == undefined) {
    return 'card col-xs-12 col-4 card text-bg-info';
  }
  const now = new Date().getTime();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours < 1) {
    return 'card col-xs-12 col-4 card text-bg-success';
  } else if (hours < 6) {
    return 'card col-xs-12 col-4 card text-bg-warning';
  } else {
    return 'card col-xs-12 col-4 card text-bg-danger';
  }
}
const today = new Date();

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
      <div class="card-group">
        <div class="card col-xs-12 col-4 card text-bg-info">
          <div class="card-body">
            <h5 class="card-title">Siste avlesning</h5>
            <p class="lead card-text">{{ store.getLatestPower() }}</p>
          </div>
        </div>
        <div :class="getClassForTime()">
          <div class="card-body">
            <h5 class="card-title">Varmepumpa startet sist</h5>
            <p class="lead card-text">{{ getTimeLastAboveThreshold() }}</p>
          </div>
        </div>
        <div class="card col-xs-12 col-4 card text-bg-info">
          <div class="card-body">
            <h5 class="display-1 card-title">{{ today.getHours() }}:{{ today.getMinutes() }}</h5>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>

</style>
