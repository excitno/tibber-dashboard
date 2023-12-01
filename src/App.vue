<script setup lang="ts">
import { useDataStore } from '@/stores/data';

const threshold: number = 5000;

const store = useDataStore();
store.getWebsocketSubscriptionUrl().then((FeedApiUrl: string) => {
  store.getHome().then(() => {
    store.subscribeToLiveMeasurement(FeedApiUrl);
  });
});

const getTimeLastAboveThreshold = function(): string {
  const lastAboveThreshold: Date | null = store.getLastTimestampAboveThreshold(threshold);
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
  const timestamp = store.getLastTimestampAboveThreshold(threshold)?.getTime();
  if (timestamp == undefined) {
    return 'danger';
  }
  const now = new Date().getTime();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours < 2) {
    return 'status-good';
  } else {
    return 'status-danger';
  }
}
</script>

<template>
  <div :class="getClassForTime()">
    <main>
      <div class="card-group">
        <div class="card col-xs-12 col-4" style="border-radius: 0;">
          <div class="card-body">
            <h5 class="card-title">Varmepumpa startet sist</h5>
            <p class="lead card-text">{{ getTimeLastAboveThreshold() }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.card {
  background-color: transparent;
  border: none;
}
</style>
