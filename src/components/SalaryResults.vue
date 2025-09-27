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

  // Фильтруем только реальные выплаты (не нулевые и не остаток)
  const realPayments = props.results.filter(r => !r.isZeroPayment && !r.isRemainder)
  const remainderPayments = props.results.filter(r => r.isRemainder)

  const totalAmount = props.results.reduce((sum, result) => sum + result.amount, 0)
  const totalWorkingDays = props.results.reduce((sum, result) => sum + result.workingDays, 0)
  const uniqueMonths = new Set(props.results.map(r => r.period.split(' ')[1])).size

  return {
    totalAmount,
    totalWorkingDays,
    uniqueMonths,
    averagePerPayment: realPayments.length > 0 ? Math.round(totalAmount / realPayments.length) : 0,
    realPaymentsCount: realPayments.length,
    remainderAmount: remainderPayments.length > 0 ? remainderPayments[0].amount : 0
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
            <div class="text-2xl font-bold text-green-700">{{ totalStats.realPaymentsCount }}</div>
            <div class="text-gray-600">Выплат</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-700">{{ formatCurrency(totalStats.averagePerPayment) }}</div>
            <div class="text-gray-600">Средняя выплата</div>
          </div>
        </div>

        <div v-if="totalStats.remainderAmount > 0" class="mt-4 p-3 bg-yellow-100 rounded-lg">
          <div class="text-center">
            <div class="text-lg font-bold text-yellow-800">{{ formatCurrency(totalStats.remainderAmount) }}</div>
            <div class="text-yellow-700 text-sm">Остаток от декабря (выплачивается до конца года)</div>
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
          :class="{
            'bg-red-50': result.isZeroPayment,
            'bg-yellow-50': result.isRemainder
          }"
        >
          <div class="font-medium" :class="{
            'text-red-700': result.isZeroPayment,
            'text-yellow-700': result.isRemainder,
            'text-green-700': !result.isZeroPayment && !result.isRemainder
          }">
            {{ result.date }}
          </div>
          <div class="text-sm" :class="{
            'text-red-600': result.isZeroPayment,
            'text-yellow-600': result.isRemainder,
            'text-gray-600': !result.isZeroPayment && !result.isRemainder
          }">
            {{ result.period }}
            <span v-if="result.isZeroPayment" class="text-xs text-red-500 block">(не выплачивается)</span>
            <span v-if="result.isRemainder" class="text-xs text-yellow-600 block">(остаток от декабря)</span>
          </div>
          <div class="text-sm" :class="{
            'text-red-600': result.isZeroPayment,
            'text-yellow-600': result.isRemainder,
            'text-gray-600': !result.isZeroPayment && !result.isRemainder
          }">
            {{ result.workingDays }}/{{ result.totalWorkingDays }}
          </div>
          <div class="font-semibold" :class="{
            'text-red-800': result.isZeroPayment,
            'text-yellow-800': result.isRemainder,
            'text-green-800': !result.isZeroPayment && !result.isRemainder
          }">
            {{ result.amount === 0 ? '0 ₽' : formatCurrency(result.amount) }}
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
