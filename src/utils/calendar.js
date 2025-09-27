// Производственный календарь России на 2024 год
export const holidays2024 = [
  '2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-08',
  '2024-02-23', '2024-03-08', '2024-05-01', '2024-05-09', '2024-06-12', '2024-11-04'
]

// Производственный календарь России на 2025 год
export const holidays2025 = [
  '2025-01-01', '2025-01-02', '2025-01-03', '2025-01-06', '2025-01-07', '2025-01-08',
  '2025-02-23', '2025-03-08', '2025-05-01', '2025-05-09', '2025-06-12', '2025-11-04'
]

// Функция для проверки, является ли дата выходным днем
export const isWeekend = (date) => {
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Воскресенье или суббота
}

// Функция для проверки, является ли дата праздничным днем
export const isHoliday = (date, year) => {
  const holidays = year === 2024 ? holidays2024 : holidays2025
  const dateStr = date.toISOString().split('T')[0]
  return holidays.includes(dateStr)
}

// Функция для проверки, является ли дата рабочим днем
export const isWorkingDay = (date, year) => {
  return !isWeekend(date) && !isHoliday(date, year)
}

// Функция для получения предыдущего рабочего дня
export const getPreviousWorkingDay = (date, year) => {
  let prevDay = new Date(date)
  prevDay.setDate(prevDay.getDate() - 1)

  while (!isWorkingDay(prevDay, year)) {
    prevDay.setDate(prevDay.getDate() - 1)
  }

  return prevDay
}

// Функция для получения следующего рабочего дня
export const getNextWorkingDay = (date, year) => {
  let nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)

  while (!isWorkingDay(nextDay, year)) {
    nextDay.setDate(nextDay.getDate() + 1)
  }

  return nextDay
}

// Функция для подсчета рабочих дней в периоде
export const countWorkingDays = (startDate, endDate, year) => {
  let count = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    if (isWorkingDay(current, year)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

// Функция для получения количества рабочих дней в месяце
export const getWorkingDaysInMonth = (year, month) => {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  return countWorkingDays(startDate, endDate, year)
}

// Функция для корректировки даты выплаты (перенос на предыдущий рабочий день если попадает на выходной/праздник)
export const adjustPayDate = (year, month, day) => {
  const payDate = new Date(year, month, day)

  if (isWorkingDay(payDate, year)) {
    return payDate
  }

  return getPreviousWorkingDay(payDate, year)
}
