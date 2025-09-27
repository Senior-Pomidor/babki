import {
  getProductionCalendar,
  getProductionCalendarMonth,
  adjustPayDate,
  countWorkingDaysInPeriod,
  getWorkingDaysInMonth,
  getWorkingTimeStatistics
} from '../services/productionCalendar.js'

// Функция для расчета зарплаты на год
export const calculateYearlySalary = async (salaryData, year = 2024) => {
  const results = []
  const { salary, firstPayDate, secondPayDate, firstPeriodEnd } = salaryData

  // Проходим по всем месяцам года
  for (let month = 0; month < 12; month++) {
    const currentYear = year
    const currentMonth = month

    try {
      // Специальная обработка для января - первая дата = 0 рублей
      if (month === 0) {
        // Получаем данные календаря за январь
        const monthCalendarData = await getProductionCalendarMonth(currentYear, currentMonth + 1)

        // Первая выплата января = 0 (не выплачивается)
        const firstPayDay = adjustPayDate(currentYear, currentMonth, firstPayDate, monthCalendarData)
        results.push({
          date: formatDate(firstPayDay),
          period: `1-${firstPeriodEnd} янв`,
          amount: 0,
          workingDays: 0,
          totalWorkingDays: 0,
          monthStats: {},
          isZeroPayment: true
        })

        // Вторая выплата января - за первый период января
        const monthStats = await getWorkingTimeStatistics(currentYear, currentMonth + 1)
        const totalWorkingDaysInMonth = monthStats.work_days || getWorkingDaysInMonth(currentYear, currentMonth, monthCalendarData)

        // Первый период января
        const firstPeriodStart = new Date(currentYear, currentMonth, 1)
        const firstPeriodEndDate = new Date(currentYear, currentMonth, firstPeriodEnd)
        const firstPeriodWorkingDays = countWorkingDaysInPeriod(firstPeriodStart, firstPeriodEndDate, monthCalendarData)

        // Выплата 25 января за первый период января
        const secondPayDay = adjustPayDate(currentYear, currentMonth, secondPayDate, monthCalendarData)
        const secondPayAmount = (salary / totalWorkingDaysInMonth) * firstPeriodWorkingDays

        results.push({
          date: formatDate(secondPayDay),
          period: `1-${firstPeriodEnd} янв`,
          amount: Math.round(secondPayAmount),
          workingDays: firstPeriodWorkingDays,
          totalWorkingDays: totalWorkingDaysInMonth,
          monthStats: monthStats
        })

        continue // Переходим к следующему месяцу
      }

      // Получаем данные календаря за месяц из API
      const monthCalendarData = await getProductionCalendarMonth(currentYear, currentMonth + 1)

      // Получаем статистику за месяц
      const monthStats = await getWorkingTimeStatistics(currentYear, currentMonth + 1)

      // Количество рабочих дней в месяце из API
      const totalWorkingDaysInMonth = monthStats.work_days || getWorkingDaysInMonth(currentYear, currentMonth, monthCalendarData)

      // ПЕРВЫЙ ПЕРИОД: с 1-го по firstPeriodEnd (выплачивается во второй дате)
      const firstPeriodStart = new Date(currentYear, currentMonth, 1)
      const firstPeriodEndDate = new Date(currentYear, currentMonth, firstPeriodEnd)
      const firstPeriodWorkingDays = countWorkingDaysInPeriod(firstPeriodStart, firstPeriodEndDate, monthCalendarData)

      // ВТОРОЙ ПЕРИОД: с firstPeriodEnd+1 по последнее число (выплачивается в первой дате)
      const secondPeriodStart = new Date(currentYear, currentMonth, firstPeriodEnd + 1)
      const secondPeriodEndDate = new Date(currentYear, currentMonth + 1, 0) // Последний день месяца
      const secondPeriodWorkingDays = countWorkingDaysInPeriod(secondPeriodStart, secondPeriodEndDate, monthCalendarData)

      // Получаем данные предыдущего месяца для первой выплаты
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
      const prevMonthCalendarData = await getProductionCalendarMonth(prevYear, prevMonth + 1)
      const prevMonthStats = await getWorkingTimeStatistics(prevYear, prevMonth + 1)
      const prevMonthTotalWorkingDays = prevMonthStats.work_days || getWorkingDaysInMonth(prevYear, prevMonth, prevMonthCalendarData)

      // Первый период предыдущего месяца
      const prevFirstPeriodStart = new Date(prevYear, prevMonth, 1)
      const prevFirstPeriodEndDate = new Date(prevYear, prevMonth, firstPeriodEnd)
      const prevFirstPeriodWorkingDays = countWorkingDaysInPeriod(prevFirstPeriodStart, prevFirstPeriodEndDate, prevMonthCalendarData)

      // Второй период предыдущего месяца
      const prevSecondPeriodStart = new Date(prevYear, prevMonth, firstPeriodEnd + 1)
      const prevSecondPeriodEndDate = new Date(prevYear, prevMonth + 1, 0)
      const prevSecondPeriodWorkingDays = countWorkingDaysInPeriod(prevSecondPeriodStart, prevSecondPeriodEndDate, prevMonthCalendarData)

      // Первая выплата (первая дата) - за ВТОРОЙ период ПРЕДЫДУЩЕГО месяца
      const firstPayDay = adjustPayDate(currentYear, currentMonth, firstPayDate, monthCalendarData)
      const firstPayAmount = (salary / prevMonthTotalWorkingDays) * prevSecondPeriodWorkingDays

      // Определяем период для первой выплаты (предыдущий месяц)
      const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate()

      results.push({
        date: formatDate(firstPayDay),
        period: `${firstPeriodEnd + 1}-${prevMonthLastDay} ${getMonthName(prevMonth)}`,
        amount: Math.round(firstPayAmount),
        workingDays: prevSecondPeriodWorkingDays,
        totalWorkingDays: prevMonthTotalWorkingDays,
        monthStats: prevMonthStats
      })

      // Вторая выплата (вторая дата) - за ПЕРВЫЙ период ТЕКУЩЕГО месяца
      const secondPayDay = adjustPayDate(currentYear, currentMonth, secondPayDate, monthCalendarData)
      const secondPayAmount = (salary / totalWorkingDaysInMonth) * firstPeriodWorkingDays

      results.push({
        date: formatDate(secondPayDay),
        period: `1-${firstPeriodEnd} ${getMonthName(currentMonth)}`,
        amount: Math.round(secondPayAmount),
        workingDays: firstPeriodWorkingDays,
        totalWorkingDays: totalWorkingDaysInMonth,
        monthStats: monthStats
      })
    } catch (error) {
      console.error(`Ошибка расчета для ${getMonthName(currentMonth)} ${currentYear}:`, error)

      // Fallback к базовому расчету
      const fallbackResult = await calculateMonthFallback(salaryData, currentYear, currentMonth)
      results.push(...fallbackResult)
    }
  }

  // Добавляем остаток в конце года (остаток от первого периода декабря)
  try {
    const decemberCalendarData = await getProductionCalendarMonth(year, 12)
    const decemberStats = await getWorkingTimeStatistics(year, 12)
    const decemberTotalWorkingDays = decemberStats.work_days || getWorkingDaysInMonth(year, 11, decemberCalendarData)

    // Первый период декабря (за который уже заплатили в декабре)
    const decemberFirstPeriodStart = new Date(year, 11, 1)
    const decemberFirstPeriodEndDate = new Date(year, 11, firstPeriodEnd)
    const decemberFirstPeriodWorkingDays = countWorkingDaysInPeriod(decemberFirstPeriodStart, decemberFirstPeriodEndDate, decemberCalendarData)

    // Второй период декабря (за который заплатили в январе следующего года)
    const decemberSecondPeriodStart = new Date(year, 11, firstPeriodEnd + 1)
    const decemberSecondPeriodEndDate = new Date(year, 12, 0)
    const decemberSecondPeriodWorkingDays = countWorkingDaysInPeriod(decemberSecondPeriodStart, decemberSecondPeriodEndDate, decemberCalendarData)

    // Рассчитываем остаток
    // За год должно быть выплачено 12 полных зарплат
    const expectedTotalForYear = salary * 12
    const actualTotalPaid = results.reduce((sum, result) => sum + result.amount, 0)
    const remainder = expectedTotalForYear - actualTotalPaid

    if (remainder > 0) {
      results.push({
        date: '31 дек',
        period: 'Остаток',
        amount: Math.round(remainder),
        workingDays: decemberSecondPeriodWorkingDays,
        totalWorkingDays: decemberTotalWorkingDays,
        monthStats: {},
        isRemainder: true
      })
    }
  } catch (error) {
    console.error('Ошибка расчета остатка:', error)
  }

  return results
}

// Fallback функция для расчета месяца при ошибке API
const calculateMonthFallback = async (salaryData, year, month) => {
  const calendarData = await getProductionCalendar(year)
  const { salary, firstPayDate, secondPayDate, firstPeriodEnd } = salaryData

  const totalWorkingDaysInMonth = getWorkingDaysInMonth(year, month, calendarData)

  const firstPeriodStart = new Date(year, month, 1)
  const firstPeriodEndDate = new Date(year, month, firstPeriodEnd)
  const firstPeriodWorkingDays = countWorkingDaysInPeriod(firstPeriodStart, firstPeriodEndDate, calendarData)

  // Получаем данные предыдущего месяца для первой выплаты
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevMonthCalendarData = await getProductionCalendar(prevYear)
  const prevMonthTotalWorkingDays = getWorkingDaysInMonth(prevYear, prevMonth, prevMonthCalendarData)

  // Второй период предыдущего месяца
  const prevSecondPeriodStart = new Date(prevYear, prevMonth, firstPeriodEnd + 1)
  const prevSecondPeriodEndDate = new Date(prevYear, prevMonth + 1, 0)
  const prevSecondPeriodWorkingDays = countWorkingDaysInPeriod(prevSecondPeriodStart, prevSecondPeriodEndDate, prevMonthCalendarData)

  const firstPayDay = adjustPayDate(year, month, firstPayDate, calendarData)
  const firstPayAmount = (salary / prevMonthTotalWorkingDays) * prevSecondPeriodWorkingDays

  const secondPayDay = adjustPayDate(year, month, secondPayDate, calendarData)
  const secondPayAmount = (salary / totalWorkingDaysInMonth) * firstPeriodWorkingDays

  // Определяем период для первой выплаты (предыдущий месяц)
  const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate()

  return [
    {
      date: formatDate(firstPayDay),
      period: `${firstPeriodEnd + 1}-${prevMonthLastDay} ${getMonthName(prevMonth)}`,
      amount: Math.round(firstPayAmount),
      workingDays: prevSecondPeriodWorkingDays,
      totalWorkingDays: prevMonthTotalWorkingDays,
      monthStats: {}
    },
    {
      date: formatDate(secondPayDay),
      period: `1-${firstPeriodEnd} ${getMonthName(month)}`,
      amount: Math.round(secondPayAmount),
      workingDays: firstPeriodWorkingDays,
      totalWorkingDays: totalWorkingDaysInMonth,
      monthStats: {}
    }
  ]
}

// Вспомогательная функция для форматирования даты
const formatDate = (date) => {
  const months = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ]

  return `${date.getDate()} ${months[date.getMonth()]}`
}

// Вспомогательная функция для получения названия месяца
const getMonthName = (month) => {
  const months = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ]

  return months[month]
}

// Функция для получения детальной статистики по году
export const getYearlyStatistics = async (year) => {
  try {
    const calendarData = await getProductionCalendar(year)
    const statistics = await getWorkingTimeStatistics(year)

    return {
      year,
      totalWorkingDays: statistics.work_days || 0,
      totalHolidays: statistics.holidays || 0,
      totalWeekends: statistics.weekends || 0,
      totalWorkingHours: statistics.working_hours_40 || statistics.working_hours || 0,
      calendarDays: statistics.calendar_days || 365,
      calendarDaysWithoutHolidays: (statistics.calendar_days || 365) - (statistics.holidays || 0),
      shortenedWorkingDays: 0
    }
  } catch (error) {
    console.error('Ошибка получения статистики за год:', error)
    return {
      year,
      totalWorkingDays: 0,
      totalHolidays: 0,
      totalWeekends: 0,
      totalWorkingHours: 0,
      calendarDays: 365,
      calendarDaysWithoutHolidays: 365,
      shortenedWorkingDays: 0
    }
  }
}

// Функция для получения статистики по месяцу
export const getMonthlyStatistics = async (year, month) => {
  try {
    const monthStats = await getWorkingTimeStatistics(year, month)

    return {
      year,
      month,
      monthName: getMonthName(month - 1),
      workingDays: monthStats.work_days || 0,
      holidays: monthStats.holidays || 0,
      weekends: monthStats.weekends || 0,
      workingHours: monthStats.working_hours || 0,
      calendarDays: monthStats.calendar_days || 0,
      shortenedWorkingDays: monthStats.shortened_working_days || 0
    }
  } catch (error) {
    console.error('Ошибка получения статистики за месяц:', error)
    return {
      year,
      month,
      monthName: getMonthName(month - 1),
      workingDays: 0,
      holidays: 0,
      weekends: 0,
      workingHours: 0,
      calendarDays: 0,
      shortenedWorkingDays: 0
    }
  }
}
