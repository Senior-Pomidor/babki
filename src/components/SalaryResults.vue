<script setup>
import { formatCurrency } from '../utils/numberFormatting.js'
import { computed } from 'vue'

const props = defineProps({
  results: {
    type: Array,
    default: () => []
  }
})

// Вычисляем общую статистику
const totalStats = computed(() => {
  if (props.results.length === 0) return null

  const totalAmount = props.results.reduce((sum, result) => sum + result.amount, 0)
  const totalWorkingDays = props.results.reduce((sum, result) => sum + result.workingDays, 0)
  const uniqueMonths = new Set(props.results.map(r => r.period.split(' ')[1])).size

  return {
    totalAmount,
    totalWorkingDays,
    uniqueMonths,
    averagePerPayment: Math.round(totalAmount / props.results.length)
  }
})
</script>

<template>
  <div class="bg-white rounded-lg border border-green-200 p-6">
    <h2 class="text-xl font-semibold text-green-800 mb-4">Результаты расчета</h2>

    <div v-if="results.length === 0" class="text-gray-500 text-center py-8">
      Введите данные и нажмите "Рассчитать зарплату на год"
    </div>

    <div v-else>
      <!-- Общая статистика -->
      <div v-if="totalStats" class="bg-green-50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold text-green-800 mb-3">Общая статистика</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-700">{{ formatCurrency(totalStats.totalAmount) }}</div>
            <div class="text-gray-600">Общая сумма</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-700">{{ totalStats.totalWorkingDays }}</div>
            <div class="text-gray-600">Рабочих дней</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-700">{{ totalStats.uniqueMonths }}</div>
            <div class="text-gray-600">Месяцев</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-700">{{ formatCurrency(totalStats.averagePerPayment) }}</div>
            <div class="text-gray-600">Средняя выплата</div>
          </div>
        </div>
      </div>

      <!-- Детальные результаты -->
      <div class="space-y-3">
        <div class="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
          <div>Дата выплаты</div>
          <div>Период</div>
          <div>Рабочих дней</div>
          <div>Сумма</div>
        </div>

        <div
          v-for="(result, index) in results"
          :key="index"
          class="grid grid-cols-4 gap-4 py-2 border-b border-gray-100 last:border-b-0"
        >
          <div class="text-green-700 font-medium">
            {{ result.date }}
          </div>
          <div class="text-gray-600 text-sm">
            {{ result.period }}
          </div>
          <div class="text-gray-600 text-sm">
            {{ result.workingDays }}/{{ result.totalWorkingDays }}
          </div>
          <div class="text-green-800 font-semibold">
            {{ formatCurrency(result.amount) }}
          </div>
        </div>
      </div>

      <!-- Информация о календаре -->
      <div v-if="results[0]?.monthStats" class="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-blue-800 mb-3">Информация из производственного календаря</h3>
        <div class="text-sm text-blue-700">
          <p>Данные получены из официального производственного календаря КонсультантПлюс</p>
          <p class="mt-1">Включает актуальную информацию о рабочих днях, праздниках, переносах и сокращенных днях для России</p>
          <p class="mt-1 text-xs text-blue-600">
            <a href="https://www.consultant.ru/law/ref/calendar/proizvodstvennye/2025/" target="_blank" class="underline">Официальный календарь 2025</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
