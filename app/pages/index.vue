<script setup lang="ts">
type Offer = {
  id: string
  title: string
  subtitle: string
  priceLabel: string
  badge?: string
}

type PurchaseStatus = 'idle' | 'loading' | 'success' | 'error'

const USER_ID_KEY = 'paywall_user_id'
const PURCHASE_ERROR_TEXT
  = 'Не удалось оформить покупку. Проверьте соединение и попробуйте ещё раз.'

// SSR: страница ждёт ответ на сервере — отдельный loading в UI не нужен
const { data: offers, error, refresh } = await useFetch<Offer[]>('/api/offers')

const selectedId = ref('year')
const purchaseStatus = ref<PurchaseStatus>('idle')

watch(offers, (list) => {
  if (!list?.length) {
    return
  }
  if (!list.some(o => o.id === selectedId.value)) {
    selectedId.value = list[0]!.id
  }
}, { immediate: true })

function getOrCreateUserId(): string {
  const existing = localStorage.getItem(USER_ID_KEY)
  if (existing) {
    return existing
  }
  const id = crypto.randomUUID()
  localStorage.setItem(USER_ID_KEY, id)
  return id
}

async function onPurchase() {
  if (purchaseStatus.value === 'loading' || !selectedId.value) {
    return
  }

  purchaseStatus.value = 'loading'

  // Минимальная пауза, чтобы успел отрисоваться Loading из макета
  const minDelay = new Promise(resolve => setTimeout(resolve, 800))

  try {
    await Promise.all([
      $fetch('/api/purchase', {
        method: 'POST',
        body: {
          offerId: selectedId.value,
          userId: getOrCreateUserId(),
        },
      }),
      minDelay,
    ])
    purchaseStatus.value = 'success'
  }
  catch {
    await minDelay
    purchaseStatus.value = 'error'
  }
}

const ctaLabel = computed(() => {
  if (purchaseStatus.value === 'loading') {
    return 'Оформляем…'
  }
  if (purchaseStatus.value === 'error') {
    return 'Попробовать снова'
  }
  return 'Продолжить'
})
</script>

<template>
  <main class="paywall">
    <!-- 05 Success -->
    <template v-if="purchaseStatus === 'success'">
      <header class="hero">
        <div
          class="success-icon"
          aria-hidden="true"
        >
          <svg
            class="success-icon__check"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 16.5 13.5 22 24 10"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="title">
          Готово!
        </h1>
        <p class="subtitle">
          Полный доступ открыт. Приятных приключений в Meadow Tales.
        </p>
      </header>

      <div class="actions">
        <button
          type="button"
          class="cta"
        >
          Начать играть
        </button>
      </div>
    </template>

    <!-- 01 Default / 02 Loading / 03 Error -->
    <template v-else>
      <header class="hero">
        <div
          class="logo"
          aria-hidden="true"
        >
          <svg
            class="logo__leaf"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 4c-1.5 4-6 7.5-6 13a6 6 0 0 0 12 0c0-5.5-4.5-9-6-13Z"
              fill="currentColor"
            />
            <path
              d="M14 10v11"
              stroke="currentColor"
              stroke-opacity="0.35"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <p class="brand">
          Meadow Tales
        </p>
        <h1 class="title">
          Открой полный доступ
        </h1>
        <p class="subtitle">
          Все уровни, персонажи и спокойные приключения — без ограничений.
        </p>
      </header>

      <section
        class="offers"
        aria-label="Тарифы"
      >
        <div
          v-if="error"
          class="offers-status"
          role="alert"
        >
          <p>Не удалось загрузить тарифы.</p>
          <button
            type="button"
            class="offers-retry"
            @click="refresh()"
          >
            Повторить
          </button>
        </div>
        <template v-else>
          <button
            v-for="offer in offers"
            :key="offer.id"
            type="button"
            class="offer"
            :class="{ 'offer--selected': selectedId === offer.id }"
            :aria-pressed="selectedId === offer.id"
            :disabled="purchaseStatus === 'loading'"
            @click="selectedId = offer.id"
          >
            <span class="offer__info">
              <span class="offer__title-row">
                <span class="offer__title">{{ offer.title }}</span>
                <span
                  v-if="offer.badge"
                  class="offer__badge"
                >{{ offer.badge }}</span>
              </span>
              <span class="offer__subtitle">{{ offer.subtitle }}</span>
            </span>
            <span class="offer__price">{{ offer.priceLabel }}</span>
          </button>
        </template>
      </section>

      <div class="actions">
        <p
          v-if="purchaseStatus === 'error'"
          class="error-banner"
          role="alert"
        >
          {{ PURCHASE_ERROR_TEXT }}
        </p>

        <button
          type="button"
          class="cta"
          :class="{ 'cta--loading': purchaseStatus === 'loading' }"
          :disabled="!!error || !offers?.length || purchaseStatus === 'loading'"
          @click="onPurchase"
        >
          <span
            v-if="purchaseStatus === 'loading'"
            class="cta__spinner"
            aria-hidden="true"
          />
          {{ ctaLabel }}
        </button>
        <button
          type="button"
          class="restore"
        >
          Восстановить покупки
        </button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.paywall {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-24);
  width: 100%;
  max-width: var(--size-screen-w);
  min-height: 100dvh;
  margin: 0 auto;
  padding: var(--space-32) var(--space-24) var(--space-32);
  background: var(--color-bg);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-12);
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}

.logo__leaf {
  width: 28px;
  height: 28px;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border: var(--stroke-selected) solid var(--color-accent);
  border-radius: var(--radius-full);
  background: var(--color-surface-selected);
  color: var(--color-accent);
}

.success-icon__check {
  width: 32px;
  height: 32px;
}

.brand {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.title {
  margin: 0;
  color: var(--color-text);
  font-family: var(--font-family-display);
  font-size: var(--font-size-title);
  font-weight: 700;
  line-height: 1.2;
}

.subtitle {
  margin: 0;
  max-width: 28em;
  color: var(--color-text-muted);
  font-size: var(--font-size-body);
  line-height: 1.45;
}

.offers {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.offers-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-12);
  margin: 0;
  padding: var(--space-16);
  color: var(--color-text);
  font-size: var(--font-size-body);
  line-height: 1.45;
  text-align: center;
}

.offers-status p {
  margin: 0;
}

.offers-retry {
  padding: var(--space-8) var(--space-16);
  border: var(--stroke-selected) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-caption);
  font-weight: 600;
  cursor: pointer;
}

.offer {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  width: 100%;
  /* Fixed stroke so selected/unselected don't change card size */
  padding: var(--space-16);
  border: var(--stroke-selected) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.offer:disabled {
  cursor: default;
}

.offer--selected {
  border-color: var(--color-border-selected);
  background: var(--color-surface-selected);
}

.offer__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
}

.offer__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-8);
}

.offer__title {
  font-size: var(--font-size-body);
  font-weight: 600;
  line-height: 1.4;
}

.offer__badge {
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  font-size: var(--font-size-caption);
  font-weight: 600;
  line-height: 1.1;
}

.offer__subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  line-height: 1.3;
}

.offer__price {
  flex-shrink: 0;
  font-size: var(--font-size-price);
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-16);
}

.error-banner {
  width: 100%;
  margin: 0;
  padding: var(--space-12);
  border-radius: var(--radius-sm);
  background: var(--color-error-bg);
  color: var(--color-error);
  font-size: var(--font-size-caption);
  font-weight: 500;
  line-height: 1.3;
  text-align: left;
}

.cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
  width: 100%;
  min-height: var(--size-tap-min);
  padding: var(--space-12) var(--space-16);
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  font-family: var(--font-family-body);
  font-size: var(--font-size-cta);
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
}

.cta:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.cta:disabled {
  cursor: not-allowed;
}

.cta--loading {
  opacity: 0.7;
}

.cta__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgb(255 255 255 / 35%);
  border-top-color: var(--color-text-on-accent);
  border-radius: var(--radius-full);
  animation: cta-spin 0.7s linear infinite;
}

@keyframes cta-spin {
  to {
    transform: rotate(360deg);
  }
}

.restore {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-family: var(--font-family-body);
  font-size: var(--font-size-caption);
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
