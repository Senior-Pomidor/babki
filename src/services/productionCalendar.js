// Сервис для работы с локальными данными производственного календаря
import { getFullCalendarData } from '../data/calendar2025.js'

// Кэш для хранения данных календаря
const calendarCache = new Map()

/**
 * Получает данные производственного календаря из локального источника
 */
const getLocalCalendarData = (year) => {
  if (year === 2025) {
    return getFullCalendarData()
  }

  // Для других лет возвращаем базовые данные
  return getBasicCalendar(year)
}

/**
 * Получает данные производственного календаря для указанного года
 * @param {number} year - Год
 * @returns {Promise<Object>} Данные календаря
 */
export const getProductionCalendar = async (year) => {
  // Проверяем кэш
  if (calendarCache.has(year)) {
    return calendarCache.get(year)
  }

  try {
    // Получаем данные из локального источника
    const calendarData = getLocalCalendarData(year)

    // Сохраняем в кэш
    calendarCache.set(year, calendarData)

    return calendarData
  } catch (error) {
    console.error('Ошибка получения производственного календаря:', error)
    // Возвращаем fallback данные
    return getFallbackCalendar(year)
  }
}


/**
 * Получает данные производственного календаря за месяц
 * @param {number} year - Год
 * @param {number} month - Месяц (1-12)
 * @returns {Promise<Object>} Данные календаря за месяц
 */
export const getProductionCalendarMonth = async (year, month) => {
  const cacheKey = `${year}-${month}`

  if (calendarCache.has(cacheKey)) {
    return calendarCache.get(cacheKey)
  }

  try {
    // Получаем данные за весь год
    const calendarData = getLocalCalendarData(year)

    // Фильтруем данные только за нужный месяц
    const monthData = {
      year,
      month,
      weekends: calendarData.weekends.filter(day => day.month === month),
      holidays: calendarData.holidays.filter(day => day.month === month),
      workingDays: calendarData.workingDays.filter(day => day.month === month),
      statistics: {
        calendar_days: new Date(year, month, 0).getDate(),
        work_days: calendarData.workingDays.filter(day => day.month === month).length,
        holidays: calendarData.holidays.filter(day => day.month === month).length,
        weekends: calendarData.weekends.filter(day => day.month === month).length,
        working_hours: calendarData.workingDays.filter(day => day.month === month).length * 8
      }
    }

    // Сохраняем в кэш
    calendarCache.set(cacheKey, monthData)

    return monthData
  } catch (error) {
    console.error('Ошибка получения календаря за месяц:', error)
    // Возвращаем fallback данные
    return getFallbackCalendarMonth(year, month)
  }
}

/**
 * Получает данные производственного календаря за произвольный период
 * @param {string} startDate - Начальная дата в формате DD.MM.YYYY
 * @param {string} endDate - Конечная дата в формате DD.MM.YYYY
 * @returns {Promise<Object>} Данные календаря за период
 */
export const getProductionCalendarPeriod = async (startDate, endDate) => {
  const cacheKey = `${startDate}-${endDate}`

  if (calendarCache.has(cacheKey)) {
    return calendarCache.get(cacheKey)
  }

  try {
    // Преобразуем даты в формат YYYY-MM-DD
    const startDateFormatted = startDate.split('.').reverse().join('-')
    const endDateFormatted = endDate.split('.').reverse().join('-')
    const year = new Date(startDateFormatted).getFullYear()

    // Получаем данные за год
    const calendarData = getLocalCalendarData(year)

    // Фильтруем данные за нужный период
    const startDateObj = new Date(startDateFormatted)
    const endDateObj = new Date(endDateFormatted)

    const periodData = {
      year,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      weekends: calendarData.weekends.filter(day => {
        const dayDate = new Date(day.date)
        return dayDate >= startDateObj && dayDate <= endDateObj
      }),
      holidays: calendarData.holidays.filter(day => {
        const dayDate = new Date(day.date)
        return dayDate >= startDateObj && dayDate <= endDateObj
      }),
      workingDays: calendarData.workingDays.filter(day => {
        const dayDate = new Date(day.date)
        return dayDate >= startDateObj && dayDate <= endDateObj
      }),
      statistics: {
        calendar_days: Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1,
        work_days: 0, // Будет рассчитано после фильтрации
        holidays: 0, // Будет рассчитано после фильтрации
        weekends: 0, // Будет рассчитано после фильтрации
        working_hours: 0 // Будет рассчитано после фильтрации
      }
    }

    // Пересчитываем статистику
    periodData.statistics.work_days = periodData.workingDays.length
    periodData.statistics.holidays = periodData.holidays.length
    periodData.statistics.weekends = periodData.weekends.length
    periodData.statistics.working_hours = periodData.workingDays.length * 8

    // Сохраняем в кэш
    calendarCache.set(cacheKey, periodData)

    return periodData
  } catch (error) {
    console.error('Ошибка получения календаря за период:', error)
    throw error
  }
}

/**
 * Получает статистику по рабочему времени за период
 * @param {number} year - Год
 * @param {number} month - Месяц (опционально)
 * @returns {Promise<Object>} Статистика
 */
export const getWorkingTimeStatistics = async (year, month = null) => {
  try {
    let calendarData

    if (month) {
      calendarData = await getProductionCalendarMonth(year, month)
    } else {
      calendarData = await getProductionCalendar(year)
    }

    return calendarData.statistics
  } catch (error) {
    console.error('Ошибка получения статистики:', error)
    return {}
  }
}

/**
 * Fallback данные календаря на основе локальных данных
 */
const getFallbackCalendar = (year) => {
  if (year === 2025) {
    return getLocalCalendarData(year)
  }

  // Для других лет используем базовую логику
  return getBasicCalendar(year)
}


/**
 * Базовая логика для других лет
 */
const getBasicCalendar = (year) => {
  const weekends = []
  const holidays = []

  // Добавляем все выходные дни года
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()

      // Суббота (6) и воскресенье (0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends.push({
          date: date.toISOString().split('T')[0],
          day,
          month: month + 1,
          year,
          type: dayOfWeek === 0 ? 'воскресенье' : 'суббота'
        })
      }
    }
  }

  // Добавляем официальные праздники России
  const officialHolidays = [
    { month: 1, days: [1, 2, 3, 4, 5, 6, 7, 8], name: 'Новогодние каникулы' },
    { month: 2, days: [23], name: 'День защитника Отечества' },
    { month: 3, days: [8], name: 'Международный женский день' },
    { month: 5, days: [1], name: 'Праздник Весны и Труда' },
    { month: 5, days: [9], name: 'День Победы' },
    { month: 6, days: [12], name: 'День России' },
    { month: 11, days: [4], name: 'День народного единства' }
  ]

  officialHolidays.forEach(holiday => {
    holiday.days.forEach(day => {
      const date = new Date(year, holiday.month - 1, day)
      holidays.push({
        date: date.toISOString().split('T')[0],
        day,
        month: holiday.month,
        year,
        name: holiday.name,
        type: 'праздник'
      })
    })
  })

  return {
    year,
    weekends,
    holidays,
    workingDays: calculateWorkingDays(year, weekends, holidays),
    statistics: {}
  }
}

/**
 * Fallback данные календаря за месяц
 */
const getFallbackCalendarMonth = (year, month) => {
  const fullYearData = getFallbackCalendar(year)

  // Фильтруем данные только за нужный месяц
  const monthData = {
    year,
    month,
    weekends: fullYearData.weekends.filter(day => day.month === month),
    holidays: fullYearData.holidays.filter(day => day.month === month),
    workingDays: fullYearData.workingDays.filter(day => day.month === month),
    statistics: {}
  }

  return monthData
}

/**
 * Вычисляет рабочие дни на основе выходных и праздников
 */
const calculateWorkingDays = (year, weekends, holidays) => {
  const workingDays = []
  const holidayDates = new Set(holidays.map(h => h.date))

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]

      // Проверяем, не является ли день выходным или праздником
      const isWeekend = weekends.some(w => w.date === dateStr)
      const isHoliday = holidayDates.has(dateStr)

      if (!isWeekend && !isHoliday) {
        workingDays.push({
          date: dateStr,
          day,
          month: month + 1,
          year,
          type: 'рабочий'
        })
      }
    }
  }

  return workingDays
}

/**
 * Проверяет, является ли дата выходным днем
 */
export const isWeekend = (date, calendarData) => {
  const dateStr = date.toISOString().split('T')[0]
  return calendarData.weekends.some(w => w.date === dateStr)
}

/**
 * Проверяет, является ли дата праздничным днем
 */
export const isHoliday = (date, calendarData) => {
  const dateStr = date.toISOString().split('T')[0]
  return calendarData.holidays.some(h => h.date === dateStr)
}

/**
 * Проверяет, является ли дата рабочим днем
 */
export const isWorkingDay = (date, calendarData) => {
  const dateStr = date.toISOString().split('T')[0]
  return calendarData.workingDays.some(w => w.date === dateStr)
}

/**
 * Получает информацию о дне из календаря
 */
export const getDayInfo = (date, calendarData) => {
  const dateStr = date.toISOString().split('T')[0]

  // Ищем в рабочих днях
  let dayInfo = calendarData.workingDays.find(w => w.date === dateStr)
  if (dayInfo) {
    return { ...dayInfo, isWorking: true }
  }

  // Ищем в выходных
  dayInfo = calendarData.weekends.find(w => w.date === dateStr)
  if (dayInfo) {
    return { ...dayInfo, isWorking: false }
  }

  // Ищем в праздниках
  dayInfo = calendarData.holidays.find(h => h.date === dateStr)
  if (dayInfo) {
    return { ...dayInfo, isWorking: false }
  }

  return null
}

/**
 * Получает предыдущий рабочий день
 */
export const getPreviousWorkingDay = (date, calendarData) => {
  let prevDay = new Date(date)
  prevDay.setDate(prevDay.getDate() - 1)

  while (!isWorkingDay(prevDay, calendarData)) {
    prevDay.setDate(prevDay.getDate() - 1)
  }

  return prevDay
}

/**
 * Подсчитывает рабочие дни в периоде
 */
export const countWorkingDaysInPeriod = (startDate, endDate, calendarData) => {
  let count = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    if (isWorkingDay(current, calendarData)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

/**
 * Получает количество рабочих дней в месяце
 */
export const getWorkingDaysInMonth = (year, month, calendarData) => {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  return countWorkingDaysInPeriod(startDate, endDate, calendarData)
}

/**
 * Корректирует дату выплаты (перенос на предыдущий рабочий день)
 */
export const adjustPayDate = (year, month, day, calendarData) => {
  const payDate = new Date(year, month, day)

  if (isWorkingDay(payDate, calendarData)) {
    return payDate
  }

  return getPreviousWorkingDay(payDate, calendarData)
}

/**
 * Очищает кэш календаря
 */
export const clearCalendarCache = () => {
  calendarCache.clear()
}

/**
 * Получает размер кэша
 */
export const getCacheSize = () => {
  return calendarCache.size
}
