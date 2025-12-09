<script lang="ts" setup>
import {onMounted, onUnmounted, ref, watch} from 'vue';

const altchaWidget = ref<HTMLElement | null>(null);
const props = defineProps({
  payload: {
    type: String,
    required: false,
  }
});
const emit = defineEmits<{
  (e: 'update:payload', value: string): void;
}>();
const internalValue = ref(props.payload);

watch(internalValue, (v) => {
  emit('update:payload', v || '');
});

const onStateChange = (ev: CustomEvent | Event) => {
  if ('detail' in ev) {
    const {payload, state} = ev.detail;
    if (state === 'verified' && payload) {
      internalValue.value = payload;
    } else {
      internalValue.value = '';
    }
  }
};

onMounted(async () => {
  await import('altcha');
  await import('altcha/i18n/all');
  if (altchaWidget.value) {
    altchaWidget.value.addEventListener('statechange', onStateChange);
  }
});

onUnmounted(() => {
  if (altchaWidget.value) {
    altchaWidget.value.removeEventListener('statechange', onStateChange);
  }
});
</script>

<template>
  <!-- Configure your `challengeurl` and remove the `test` attribute, see docs: https://altcha.org/docs/v2/widget-integration/ -->
  <altcha-widget ref="altchaWidget" test debug style="--altcha-max-width:100%"/>
</template>