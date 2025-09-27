<script setup>
import { ref, onMounted } from 'vue'
import { getYearlyStatistics, getMonthlyStatistics } from '../utils/salaryCalculator.js'

const props = defineProps({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    default: null
  }
})

const stats = ref(null)
const isLoading = ref(false)
const error = ref(null)

const loadStats = async () => {
  isLoading.value = true
  error.value = null

  try {
    if (props.month) {
      stats.value = await getMonthlyStatistics(props.year, props.month)
    } else {
      stats.value = await getYearlyStatistics(props.year)
    }
  } catch (err) {
    error.value = 'Ошибка загрузки статистики календаря'
    console.error('Ошибка загрузки статистики:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<template>
  <div class="bg-white rounded-lg border border-blue-200 p-6">
    <h3 class="text-lg font-semibold text-blue-800 mb-4">
      {{ month ? `Статистика за ${stats?.monthName || month} ${year}` : `Статистика за ${year} год` }}
    </h3>

    <div v-if="isLoading" class="text-center py-4">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Загрузка статистики...
      </div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-4">
      {{ error }}
    </div>

    <div v-else-if="stats" class="space-y-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-3 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-700">{{ stats.totalWorkingDays || stats.workingDays || 0 }}</div>
          <div class="text-sm text-blue-600">Рабочих дней</div>
        </div>

        <div class="text-center p-3 bg-red-50 rounded-lg">
          <div class="text-2xl font-bold text-red-700">{{ stats.totalHolidays || stats.holidays || 0 }}</div>
          <div class="text-sm text-red-600">Праздничных дней</div>
        </div>

        <div class="text-center p-3 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-700">{{ stats.totalWeekends || stats.weekends || 0 }}</div>
          <div class="text-sm text-gray-600">Выходных дней</div>
        </div>

        <div class="text-center p-3 bg-green-50 rounded-lg">
          <div class="text-2xl font-bold text-green-700">{{ stats.totalWorkingHours || stats.workingHours || 0 }}</div>
          <div class="text-sm text-green-600">Рабочих часов</div>
        </div>
      </div>

      <div v-if="!month" class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div class="text-center p-2 bg-gray-50 rounded">
          <div class="font-semibold text-gray-700">{{ stats.calendarDays || 0 }}</div>
          <div class="text-gray-600">Календарных дней</div>
        </div>

        <div class="text-center p-2 bg-gray-50 rounded">
          <div class="font-semibold text-gray-700">{{ stats.calendarDaysWithoutHolidays || 0 }}</div>
          <div class="text-gray-600">Дней без праздников</div>
        </div>

        <div class="text-center p-2 bg-gray-50 rounded">
          <div class="font-semibold text-gray-700">{{ stats.shortenedWorkingDays || 0 }}</div>
          <div class="text-gray-600">Сокращенных дней</div>
        </div>
      </div>

      <div class="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
        Данные из официального производственного календаря 2025 года
      </div>
    </div>
  </div>
</template>
