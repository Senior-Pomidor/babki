<script setup>
import { ref, computed } from 'vue'
import { useSalaryStore } from './stores/salary.js'
import { calculateYearlySalary } from './utils/salaryCalculator.js'
import SalaryForm from './components/SalaryForm.vue'
import SalaryResults from './components/SalaryResults.vue'
import CalendarStats from './components/CalendarStats.vue'

const salaryStore = useSalaryStore()
const showCalendarStats = ref(false)

const currentYear = computed(() => salaryStore.salaryData.year || new Date().getFullYear())

const handleSalarySubmit = async (data) => {
  salaryStore.setSalaryData(data)

  try {
    // Рассчитываем зарплату на год
    const results = await calculateYearlySalary(data, data.year)
    salaryStore.setResults(results)
    showCalendarStats.value = true
  } catch (error) {
    console.error('Ошибка расчета зарплаты:', error)
    alert('Произошла ошибка при расчете зарплаты. Попробуйте еще раз.')
  }
}
</script>

<template>
  <div class="min-h-screen bg-green-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-green-800 mb-2">Бабки</h1>
        <p class="text-green-600">Калькулятор зарплаты с учетом рабочих дней</p>
        <p class="text-sm text-gray-500 mt-1">Использует официальный производственный календарь 2025 года</p>
      </div>

      <!-- Форма ввода данных -->
      <SalaryForm @submit="handleSalarySubmit" />

      <!-- Статистика календаря -->
      <CalendarStats v-if="showCalendarStats" :year="currentYear" class="mb-6" />

      <!-- Результаты -->
      <SalaryResults :results="salaryStore.results" />
    </div>
  </div>
</template>

<style scoped>
/* Локальные данные календаря */
</style>
