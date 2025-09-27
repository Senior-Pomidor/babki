<script setup>
import { ref } from 'vue'
import FormattedInput from './FormattedInput.vue'

const salary = ref('')
const year = ref(new Date().getFullYear())
const firstPayDate = ref('')
const secondPayDate = ref('')
const firstPeriodEnd = ref('')
const isLoading = ref(false)

const emit = defineEmits(['submit'])

const handleSubmit = async () => {
  if (!salary.value || !firstPayDate.value || !secondPayDate.value || !firstPeriodEnd.value) {
    alert('Пожалуйста, заполните все поля')
    return
  }

  isLoading.value = true

  try {
    const data = {
      salary: parseFloat(salary.value),
      year: parseInt(year.value),
      firstPayDate: parseInt(firstPayDate.value),
      secondPayDate: parseInt(secondPayDate.value),
      firstPeriodEnd: parseInt(firstPeriodEnd.value)
    }

    await emit('submit', data)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-green-200 p-6 mb-6">
    <h2 class="text-xl font-semibold text-green-800 mb-4">Настройки зарплаты</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Зарплата в месяц -->
      <div>
        <label for="salary" class="block text-sm font-medium text-gray-700 mb-1">
          Зарплата в месяц (руб.)
        </label>
        <FormattedInput
          id="salary"
          v-model="salary"
          placeholder="Например: 180 000"
        />
      </div>

      <!-- Год расчета -->
      <div>
        <label for="year" class="block text-sm font-medium text-gray-700 mb-1">
          Год для расчета
        </label>
        <select
          id="year"
          v-model="year"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option v-for="y in [2024, 2025, 2026, 2027, 2028]" :key="y" :value="y">
            {{ y }} год
          </option>
        </select>
      </div>

      <!-- Даты выплат -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="firstPayDate" class="block text-sm font-medium text-gray-700 mb-1">
            Первая выплата (день месяца)
          </label>
          <input
            id="firstPayDate"
            v-model="firstPayDate"
            type="number"
            min="1"
            max="31"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Например: 15"
          />
        </div>

        <div>
          <label for="secondPayDate" class="block text-sm font-medium text-gray-700 mb-1">
            Вторая выплата (день месяца)
          </label>
          <input
            id="secondPayDate"
            v-model="secondPayDate"
            type="number"
            min="1"
            max="31"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Например: 30"
          />
        </div>
      </div>

      <!-- Разделение периода -->
      <div>
        <label for="firstPeriodEnd" class="block text-sm font-medium text-gray-700 mb-1">
          Разделение месяца: с 1-го по (день месяца) - первый период
        </label>
        <input
          id="firstPeriodEnd"
          v-model="firstPeriodEnd"
          type="number"
          min="1"
          max="31"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Например: 15"
        />
        <p class="text-xs text-gray-500 mt-1">
          <strong>Логика выплат:</strong><br>
          • Первая дата выплаты ({{ firstPayDate || 'X' }}) → за период {{ (parseInt(firstPeriodEnd) + 1) || 'X+1' }}-31 <strong>предыдущего месяца</strong><br>
          • Вторая дата выплаты ({{ secondPayDate || 'Y' }}) → за период 1-{{ firstPeriodEnd || 'X' }} <strong>текущего месяца</strong>
        </p>
      </div>

      <!-- Кнопка расчета -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Загрузка...
        </span>
        <span v-else>Рассчитать зарплату на год</span>
      </button>
    </form>
  </div>
</template>
