<template>
    <li class="input">
      <label>{{ label }}</label>
      <div ref="wrapper" data-type="text" style="position: relative;">
        
        <input
          type="text"
          :placeholder="placeholderStart"
          v-model="startDateDisplay"
          @click="openCalendar('start')"
          readonly
          ref="startInput"
        />
        <input
          type="text"
          :placeholder="placeholderEnd"
          v-model="endDateDisplay"
          @click="openCalendar('end')"
          readonly
          ref="endInput"
        />
        <p>{{ note }}</p>
  
        <div v-if="calendarOpen" class="calendar-popup" ref="calendar">
          <div class="calendar-header">
            <button @click="prevMonth">&lt;</button>
            <span>{{ currentMonthLabel }}</span>
            <button @click="nextMonth">&gt;</button>
          </div>
          <div class="calendar-grid">
            <div class="day-name" v-for="day in daysOfWeek" :key="day">{{ day }}</div>
            <div
              v-for="day in daysInMonth"
              :key="day.date"
              class="day"
              @click="selectDate(day)"
            >
              {{ day.day }}
            </div>
          </div>
        </div>
      </div>
    </li>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
  
  const props = defineProps({
    label: { type: String, required: true },
    placeholderStart: { type: String, required: true },
    placeholderEnd: { type: String, required: true },
    note: { type: String, default: '' }
  });
  
  const calendarOpen = ref(false);
  const calendarTarget = ref('start');
  const currentMonth = ref(new Date());
  const startDate = ref(null);
  const endDate = ref(null);
  
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const daysInMonth = computed(() => {
    const start = startOfMonth(currentMonth.value);
    const end = endOfMonth(currentMonth.value);
    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      day: date.getDate()
    }));
  });
  
  const currentMonthLabel = computed(() => format(currentMonth.value, 'MMMM yyyy'));
  const startDateDisplay = computed(() => (startDate.value ? format(startDate.value, 'yyyy-MM-dd') : ''));
  const endDateDisplay = computed(() => (endDate.value ? format(endDate.value, 'yyyy-MM-dd') : ''));
  
  const startInput = ref(null);
  const endInput = ref(null);
  const calendar = ref(null);
  const wrapper = ref(null);
  
  const openCalendar = (target) => {
    calendarTarget.value = target;
    calendarOpen.value = true;
  };
  
  const selectDate = (day) => {
    if (calendarTarget.value === 'start') {
      startDate.value = day.date;
    } else {
      endDate.value = day.date;
    }
    calendarOpen.value = false;
  };
  
  const nextMonth = () => {
    currentMonth.value = addMonths(currentMonth.value, 1);
  };
  
  const prevMonth = () => {
    currentMonth.value = subMonths(currentMonth.value, 1);
  };
  
  const handleClickOutside = (e) => {
    if (wrapper.value && !wrapper.value.contains(e.target)) {
      calendarOpen.value = false;
    }
  };
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
  </script>
  
  
  <style scoped>
  .calendar-popup {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: var(--is-input);
    border: 1px solid var(--is-border);
    padding: 1em;
    border-radius: var(--radius-xs);
    z-index: 20;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    margin-bottom: 0.5em;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25em;
    text-align: center;
  }
  
  .day-name {
    font-family: 'Mono';
    text-transform: uppercase;
    font-size: var(--txt-sm);
  }
  
  .day {
    font-family: 'Mono';
    text-transform: uppercase;
    font-size: var(--txt-sm);
  }
  
  .day:hover {
    background: var(--is-light);
  }
  </style>
  