// Производственный календарь России на 2025 год
// Данные из официального источника

export const calendar2025 = {
  "year": 2025,
  "months": [
    {
      "month": 1,
      "days": "1,2,3,4,5,6,7,8,11,12,18,19,25,26"
    },
    {
      "month": 2,
      "days": "1,2,8,9,15,16,22,23"
    },
    {
      "month": 3,
      "days": "1,2,7*,8,9,15,16,22,23,29,30"
    },
    {
      "month": 4,
      "days": "5,6,12,13,19,20,26,27,30*"
    },
    {
      "month": 5,
      "days": "1,2+,3,4,8+,9,10,11,17,18,24,25,31"
    },
    {
      "month": 6,
      "days": "1,7,8,11*,12,13+,14,15,21,22,28,29"
    },
    {
      "month": 7,
      "days": "5,6,12,13,19,20,26,27"
    },
    {
      "month": 8,
      "days": "2,3,9,10,16,17,23,24,30,31"
    },
    {
      "month": 9,
      "days": "6,7,13,14,20,21,27,28"
    },
    {
      "month": 10,
      "days": "4,5,11,12,18,19,25,26"
    },
    {
      "month": 11,
      "days": "1*,2,3+,4,8,9,15,16,22,23,29,30"
    },
    {
      "month": 12,
      "days": "6,7,13,14,20,21,27,28,31+"
    }
  ],
  "transitions": [
    {
      "from": "01.04",
      "to": "05.02"
    },
    {
      "from": "02.23",
      "to": "05.08"
    },
    {
      "from": "03.08",
      "to": "06.13"
    },
    {
      "from": "11.01",
      "to": "11.03"
    },
    {
      "from": "01.05",
      "to": "12.31"
    }
  ],
  "statistic": {
    "workdays": 247,
    "holidays": 118,
    "hours40": 1972,
    "hours36": 1774.4,
    "hours24": 1181.6
  }
}

// Функция для парсинга дней из строки
export const parseDays = (daysString) => {
  const days = []
  const dayList = daysString.split(',')

  dayList.forEach(dayStr => {
    const day = parseInt(dayStr.replace(/[+*]/g, ''))
    if (!isNaN(day)) {
      days.push({
        day,
        isShortened: dayStr.includes('*'),
        isTransferred: dayStr.includes('+')
      })
    }
  })

  return days
}

// Функция для получения всех выходных дней года
export const getAllWeekends = () => {
  const weekends = []

  calendar2025.months.forEach(monthData => {
    const days = parseDays(monthData.days)
    days.forEach(dayInfo => {
      const date = new Date(2025, monthData.month - 1, dayInfo.day)
      const dayOfWeek = date.getDay()

      // Если день помечен как *, то это НЕ выходной (рабочий день)
      // Если день помечен как +, то это выходной
      // Все остальные дни в списке - тоже выходные
      if (!dayInfo.isShortened) { // не помечен как *
        weekends.push({
          date: date.toISOString().split('T')[0],
          day: dayInfo.day,
          month: monthData.month,
          year: 2025,
          type: dayOfWeek === 0 ? 'Воскресенье' : 'Суббота',
          typeId: 2,
          isShortened: false,
          isTransferred: dayInfo.isTransferred
        })
      }
    })
  })

  return weekends
}

// Функция для получения всех праздничных дней года
export const getAllHolidays = () => {
  const holidays = []

  // Официальные праздники 2025 года
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
      const date = new Date(2025, holiday.month - 1, day)
      holidays.push({
        date: date.toISOString().split('T')[0],
        day,
        month: holiday.month,
        year: 2025,
        type: 'Государственный праздник',
        typeId: 3,
        name: holiday.name
      })
    })
  })

  return holidays
}

// Функция для получения всех рабочих дней года
export const getAllWorkingDays = () => {
  const workingDays = []
  const weekendDates = new Set(getAllWeekends().map(w => w.date))
  const holidayDates = new Set(getAllHolidays().map(h => h.date))

  // Создаем множество дней, помеченных как * (рабочие дни)
  const markedWorkingDays = new Set()
  calendar2025.months.forEach(monthData => {
    const days = parseDays(monthData.days)
    days.forEach(dayInfo => {
      if (dayInfo.isShortened) { // помечен как *
        const date = new Date(2025, monthData.month - 1, dayInfo.day)
        markedWorkingDays.add(date.toISOString().split('T')[0])
      }
    })
  })

  // Обрабатываем каждый день года
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(2025, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(2025, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()

      // Проверяем, является ли день рабочим
      const isMarkedWorking = markedWorkingDays.has(dateStr)
      const isNotWeekend = !weekendDates.has(dateStr)
      const isNotHoliday = !holidayDates.has(dateStr)
      const isNotWeekendDay = dayOfWeek !== 0 && dayOfWeek !== 6

      if ((isMarkedWorking || (isNotWeekend && isNotHoliday && isNotWeekendDay))) {
        workingDays.push({
          date: dateStr,
          day,
          month: month + 1,
          year: 2025,
          type: isMarkedWorking ? 'Перенесенный рабочий день' : 'Рабочий день',
          typeId: 1,
          workingHours: 8
        })
      }
    }
  }

  return workingDays
}

// Функция для получения полных данных календаря
export const getFullCalendarData = () => {
  const weekends = getAllWeekends()
  const holidays = getAllHolidays()
  const workingDays = getAllWorkingDays()

  return {
    year: 2025,
    weekends,
    holidays,
    workingDays,
    statistics: {
      calendar_days: 365,
      work_days: workingDays.length,
      holidays: holidays.length,
      weekends: weekends.length,
      working_hours_40: workingDays.length * 8,
      working_hours_36: workingDays.length * 7.2,
      working_hours_24: workingDays.length * 4.8
    }
  }
}

