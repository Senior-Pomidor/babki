// Функция для форматирования числа с разделителями тысяч
export const formatNumber = (value) => {
  if (!value && value !== 0) return ''

  // Убираем все нецифровые символы кроме точки и запятой
  const cleanValue = String(value).replace(/[^\d.,]/g, '')

  // Заменяем запятую на точку для правильной обработки
  const normalizedValue = cleanValue.replace(',', '.')

  // Разделяем на целую и дробную части
  const parts = normalizedValue.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]

  // Добавляем пробелы как разделители тысяч
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  // Возвращаем отформатированное число
  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`
  }

  return formattedInteger
}

// Функция для парсинга отформатированного числа обратно в число
export const parseFormattedNumber = (formattedValue) => {
  if (!formattedValue) return 0

  // Убираем все пробелы и заменяем запятую на точку
  const cleanValue = String(formattedValue).replace(/[\s,]/g, '').replace(',', '.')

  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

// Функция для форматирования суммы в рублях
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₽'

  const formatted = Math.round(amount).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  return `${formatted} ₽`
}
