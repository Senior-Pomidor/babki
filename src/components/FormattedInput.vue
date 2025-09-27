<script setup>
import { ref, watch, onMounted } from 'vue'
import { formatNumber, parseFormattedNumber } from '../utils/numberFormatting.js'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: Infinity
  },
  step: {
    type: [String, Number],
    default: 'any'
  },
  id: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const displayValue = ref('')

// Инициализация отформатированного значения
onMounted(() => {
  if (props.modelValue) {
    displayValue.value = formatNumber(props.modelValue)
  }
})

// Отслеживаем изменения modelValue извне
watch(() => props.modelValue, (newValue) => {
  if (newValue !== parseFormattedNumber(displayValue.value)) {
    displayValue.value = formatNumber(newValue)
  }
})

// Обработчик ввода
const handleInput = (event) => {
  const inputValue = event.target.value
  const formatted = formatNumber(inputValue)
  const parsed = parseFormattedNumber(formatted)

  // Обновляем отображаемое значение
  displayValue.value = formatted

  // Эмитим числовое значение
  emit('update:modelValue', parsed)
}

// Обработчик фокуса
const handleFocus = () => {
  // При фокусе показываем число без форматирования для удобства редактирования
  if (displayValue.value) {
    displayValue.value = String(parseFormattedNumber(displayValue.value))
  }
}

// Обработчик потери фокуса
const handleBlur = () => {
  // При потере фокуса возвращаем форматирование
  if (displayValue.value) {
    displayValue.value = formatNumber(displayValue.value)
  }
}
</script>

<template>
  <input
    :ref="inputRef"
    :id="id"
    :value="displayValue"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :step="step"
    type="text"
    inputmode="numeric"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
  />
</template>
