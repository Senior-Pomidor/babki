import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSalaryStore = defineStore('salary', () => {
  // Состояние
  const salaryData = ref({
    salary: 0,
    year: new Date().getFullYear(),
    firstPayDate: 0,
    secondPayDate: 0,
    firstPeriodEnd: 0
  })

  const results = ref([])

  // Геттеры
  const hasData = computed(() =>
    salaryData.value.salary > 0 &&
    salaryData.value.firstPayDate > 0 &&
    salaryData.value.secondPayDate > 0 &&
    salaryData.value.firstPeriodEnd > 0
  )

  // Действия
  const setSalaryData = (data) => {
    salaryData.value = { ...data }
  }

  const setResults = (newResults) => {
    results.value = newResults
  }

  const clearData = () => {
    salaryData.value = {
      salary: 0,
      year: new Date().getFullYear(),
      firstPayDate: 0,
      secondPayDate: 0,
      firstPeriodEnd: 0
    }
    results.value = []
  }

  return {
    salaryData,
    results,
    hasData,
    setSalaryData,
    setResults,
    clearData
  }
})
