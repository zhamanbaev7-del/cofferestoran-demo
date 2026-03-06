// ==============================
// Toast уведомления
// ==============================
const toast = document.getElementById('toast');
let toastTimer = null;

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
};

// ==============================
// Настройки Telegram
// ВАЖНО: безопаснее отправлять через backend
// ==============================
const TELEGRAM_BOOKING_CONFIG = {
  botToken: 'PASTE_YOUR_BOT_TOKEN',
  chatId: 'PASTE_YOUR_CHAT_ID'
};

// ==============================
// Мобильное меню
// ==============================
const burger = document.getElementById('burger');
const nav = document.getElementById('main-nav');

if (burger && nav) {
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    const clickInsideNav = nav.contains(event.target);
    const clickBurger = burger.contains(event.target);

    if (!clickInsideNav && !clickBurger && nav.classList.contains('open')) {
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

// ==============================
// Ограничение масштабирования страницы (desktop shortcuts)
// ==============================
window.addEventListener(
  'wheel',
  (event) => {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener('keydown', (event) => {
  if (!event.ctrlKey) return;

  const key = event.key;
  if (key === '+' || key === '-' || key === '=' || key === '_') {
    event.preventDefault();
  }

  // Блокируем Ctrl+0 (сброс масштаба)
  if (key === '0') {
    event.preventDefault();
  }
});

// ==============================
// Фильтрация меню
// ==============================
const filterButtons = document.querySelectorAll('.filter-btn');
const menuCards = document.querySelectorAll('.menu-card');

if (filterButtons.length && menuCards.length) {
  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;

      filterButtons.forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      menuCards.forEach((card) => {
        const cardCategory = card.dataset.category;
        const isVisible = category === 'all' || cardCategory === category;

        card.classList.toggle('hidden', !isVisible);
      });
    });
  });
}

// ==============================
// AOS анимации
// ==============================
if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 900,
    once: true,
    offset: 80
  });
}

// ==============================
// Swiper слайдер
// ==============================
if (typeof Swiper !== 'undefined' && document.querySelector('.aster-swiper')) {
  new Swiper('.aster-swiper', {
    loop: true,
    speed: 900,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  });
}

// ==============================
// Lightbox настройки
// ==============================
if (typeof lightbox !== 'undefined') {
  lightbox.option({
    resizeDuration: 200,
    wrapAround: true,
    albumLabel: 'Изображение %1 из %2',
    fadeDuration: 300,
    imageFadeDuration: 300,
    disableScrolling: true
  });
}

// ==============================
// Leaflet карта
// Координаты можно поменять под нужный адрес
// ==============================
if (typeof L !== 'undefined' && document.getElementById('map')) {
  const map = L.map('map').setView([44.8488, 65.4823], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  L.marker([44.8488, 65.4823])
    .addTo(map)
    .bindPopup('Aster Lounge Cafe & Kitchen')
    .openPopup();

  const refreshMapSize = () => map.invalidateSize();
  window.addEventListener('load', refreshMapSize);
  window.addEventListener('resize', refreshMapSize);
  window.setTimeout(refreshMapSize, 500);
}

// ==============================
// Система выбора столов для бронирования
// ==============================
const BOOKING_SLOT_DURATION_MINUTES = 120;

const ZONE_LABELS = {
  hall: 'Общий зал',
  lounge: 'Lounge-зона',
  window: 'У окна',
  vip: 'VIP-комната',
  private: 'Закрытый зал'
};

const getDateWithOffset = (daysOffset) => {
  const now = new Date();
  now.setDate(now.getDate() + daysOffset);
  return now.toISOString().split('T')[0];
};

// Редактирование столов:
// id, name, capacity, zone, shape, size, x/y в процентах на плане, status, bookings.
const demoToday = getDateWithOffset(0);
const demoTomorrow = getDateWithOffset(1);

const RESTAURANT_TABLES = [
  { id: 'T1', name: 'Стол 1', capacity: 2, zone: 'window', shape: 'round', size: 'small', x: 18, y: 22, status: 'active', bookings: [] },
  { id: 'T2', name: 'Стол 2', capacity: 4, zone: 'hall', shape: 'round', size: 'medium', x: 18, y: 42, status: 'active', bookings: [] },
  { id: 'T3', name: 'Стол 3', capacity: 6, zone: 'hall', shape: 'rect', size: 'xl', x: 50, y: 22, status: 'active', bookings: [{ date: demoToday, time: '19:00', durationMinutes: 120 }] },
  { id: 'T4', name: 'Стол 4', capacity: 4, zone: 'lounge', shape: 'rect', size: 'large', x: 50, y: 42, status: 'active', bookings: [] },
  { id: 'T5', name: 'Стол 5', capacity: 2, zone: 'window', shape: 'round', size: 'small', x: 82, y: 22, status: 'active', bookings: [{ date: demoToday, time: '18:30', durationMinutes: 120 }] },
  { id: 'T6', name: 'Стол 6', capacity: 6, zone: 'hall', shape: 'rect', size: 'xl', x: 82, y: 42, status: 'active', bookings: [{ date: demoToday, time: '20:00', durationMinutes: 120 }] },
  { id: 'T7', name: 'Стол 7', capacity: 2, zone: 'lounge', shape: 'round', size: 'small', x: 18, y: 64, status: 'active', bookings: [] },
  { id: 'T8', name: 'Стол 8', capacity: 4, zone: 'private', shape: 'rect', size: 'large', x: 50, y: 64, status: 'active', bookings: [] },
  { id: 'T9', name: 'Стол 9', capacity: 2, zone: 'vip', shape: 'round', size: 'small', x: 82, y: 64, status: 'active', bookings: [{ date: demoTomorrow, time: '21:00', durationMinutes: 120 }] },
  { id: 'T10', name: 'Стол 10', capacity: 4, zone: 'vip', shape: 'rect', size: 'large', x: 86, y: 86, status: 'active', bookings: [] }
];

// Плоский индекс броней по столам (удобно для фронта, потом легко заменить backend API).
const tableBookings = RESTAURANT_TABLES.flatMap((table) =>
  (table.bookings || []).map((booking) => ({
    tableId: table.id,
    date: booking.date,
    time: booking.time,
    durationMinutes: booking.durationMinutes || BOOKING_SLOT_DURATION_MINUTES
  }))
);

const bookingForm = document.getElementById('booking-form');
const tableModal = document.getElementById('table-modal');
const openTableModalBtn = document.getElementById('open-table-modal');
const closeTableModalBtn = document.getElementById('close-table-modal');
const closeTableModalBackdrop = document.querySelector('[data-close-table-modal]');
const tableMap = document.getElementById('table-map');
const tableZoneFilter = document.getElementById('table-zone-filter');
const selectedTableInfo = document.getElementById('selected-table-info');
const confirmTableSelectionBtn = document.getElementById('confirm-table-selection');
const clearTableSelectionBtn = document.getElementById('clear-table-selection');
const bookingSummary = document.getElementById('booking-summary');
const tableHint = document.getElementById('table-hint');
const tableContextPanel = document.getElementById('table-context');

let pendingTableId = null;

const parseTimeToMinutes = (time) => {
  if (!time || !time.includes(':')) return NaN;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const hasTimeOverlap = (startA, endA, startB, endB) => startA < endB && startB < endA;

const getBookingContext = () => {
  if (!bookingForm) return null;
  const date = bookingForm.querySelector('[name="date"]')?.value || '';
  const time = bookingForm.querySelector('[name="time"]')?.value || '';
  const guests = Number(bookingForm.querySelector('[name="guests"]')?.value || 0);
  const zone = bookingForm.querySelector('[name="zone"]')?.value || '';
  return { date, time, guests, zone };
};

const getTableById = (tableId) => RESTAURANT_TABLES.find((table) => table.id === tableId);

const isTableOccupiedForSlot = (tableId, date, time) => {
  const targetStart = parseTimeToMinutes(time);
  const targetEnd = targetStart + BOOKING_SLOT_DURATION_MINUTES;
  if (Number.isNaN(targetStart)) return false;

  return tableBookings.some((booking) => {
    if (booking.tableId !== tableId || booking.date !== date) return false;
    const bookingStart = parseTimeToMinutes(booking.time);
    const bookingEnd = bookingStart + (booking.durationMinutes || BOOKING_SLOT_DURATION_MINUTES);
    return hasTimeOverlap(targetStart, targetEnd, bookingStart, bookingEnd);
  });
};

const clearSelectedTable = () => {
  pendingTableId = null;
  if (!bookingForm) return;

  bookingForm.querySelector('#booking-table-id').value = '';
  bookingForm.querySelector('#booking-table-label').value = '';
  bookingForm.querySelector('#booking-table-capacity').value = '';
  bookingForm.querySelector('#booking-table-zone').value = '';
};

const updateBookingSummary = () => {
  if (!bookingForm || !bookingSummary) return;

  const context = getBookingContext();
  const selectedTable = getTableById(bookingForm.querySelector('#booking-table-id')?.value || '');

  const dateNode = bookingSummary.querySelector('[data-summary="date"]');
  const timeNode = bookingSummary.querySelector('[data-summary="time"]');
  const guestsNode = bookingSummary.querySelector('[data-summary="guests"]');
  const zoneNode = bookingSummary.querySelector('[data-summary="zone"]');
  const tableNode = bookingSummary.querySelector('[data-summary="table"]');

  if (dateNode) dateNode.textContent = context.date || '-';
  if (timeNode) timeNode.textContent = context.time || '-';
  if (guestsNode) guestsNode.textContent = context.guests ? `${context.guests}` : '-';
  if (zoneNode) zoneNode.textContent = context.zone ? ZONE_LABELS[context.zone] : '-';

  if (tableNode) {
    tableNode.textContent = selectedTable
      ? `${selectedTable.name} (${selectedTable.capacity} мест, ${ZONE_LABELS[selectedTable.zone]})`
      : 'Стол не выбран';
  }
};

const validateBookingPrerequisites = () => {
  if (!bookingForm) return false;
  const context = getBookingContext();

  const dateInput = bookingForm.querySelector('[name="date"]');
  const timeInput = bookingForm.querySelector('[name="time"]');
  const guestsInput = bookingForm.querySelector('[name="guests"]');

  const hasDate = Boolean(context.date);
  const hasTime = Boolean(context.time);
  const hasGuests = context.guests > 0;

  setFieldError(dateInput, !hasDate);
  setFieldError(timeInput, !hasTime);
  setFieldError(guestsInput, !hasGuests);

  return hasDate && hasTime && hasGuests;
};

const evaluateTableState = (table, context, zoneFilter) => {
  const isZoneFilteredOut = zoneFilter !== 'all' && table.zone !== zoneFilter;
  const capacityLocked = context.guests > 0 && table.capacity < context.guests;
  const occupied = context.date && context.time ? isTableOccupiedForSlot(table.id, context.date, context.time) : false;
  const disabledByStatus = table.status === 'disabled';

  let state = 'free';
  let disabled = false;

  if (disabledByStatus) {
    state = 'disabled';
    disabled = true;
  } else if (occupied) {
    state = 'occupied';
    disabled = true;
  } else if (capacityLocked) {
    state = 'capacity-locked';
    disabled = true;
  }

  return {
    state,
    disabled,
    isZoneFilteredOut
  };
};

const updateModalFooter = () => {
  const selectedTable = getTableById(pendingTableId);
  if (!selectedTable) {
    if (selectedTableInfo) selectedTableInfo.textContent = 'Стол пока не выбран';
    if (confirmTableSelectionBtn) confirmTableSelectionBtn.disabled = true;
    updateTableContextPanel(null);
    return;
  }

  if (selectedTableInfo) {
    selectedTableInfo.textContent = `${selectedTable.name} • ${selectedTable.capacity} мест • ${ZONE_LABELS[selectedTable.zone]}`;
  }
  if (confirmTableSelectionBtn) confirmTableSelectionBtn.disabled = false;
  updateTableContextPanel(selectedTable);
};

const updateTableContextPanel = (table) => {
  if (!tableContextPanel) return;
  const context = getBookingContext();
  const selected = table || getTableById(bookingForm?.querySelector('#booking-table-id')?.value || '');

  const setValue = (key, value) => {
    const node = tableContextPanel.querySelector(`[data-context="${key}"]`);
    if (node) node.textContent = value;
  };

  setValue('date', context?.date || '-');
  setValue('time', context?.time || '-');
  setValue('guests', context?.guests ? `${context.guests}` : '-');
  setValue('table', selected?.name || '-');
  setValue('capacity', selected?.capacity ? `${selected.capacity} мест` : '-');
  setValue('zone', selected?.zone ? ZONE_LABELS[selected.zone] : '-');
};

const renderTableMap = () => {
  if (!tableMap || !bookingForm || !tableZoneFilter) return;
  const context = getBookingContext();
  const zoneFilterValue = tableZoneFilter.value || 'all';

  tableMap.innerHTML = '';

  let freeCount = 0;
  RESTAURANT_TABLES.forEach((table) => {
    const tableButton = document.createElement('button');
    tableButton.type = 'button';
    tableButton.className = `table-node table-node--${table.shape === 'round' ? 'round' : 'rect'} table-node--${table.size}`;
    tableButton.style.setProperty('--x', table.x);
    tableButton.style.setProperty('--y', table.y);

    const { state, disabled, isZoneFilteredOut } = evaluateTableState(table, context, zoneFilterValue);

    tableButton.classList.add(`is-${state}`);
    if (pendingTableId === table.id && !disabled && !isZoneFilteredOut) {
      tableButton.classList.add('is-selected');
    }

    if (isZoneFilteredOut) {
      tableButton.classList.add('is-hidden');
    }

    tableButton.disabled = disabled || isZoneFilteredOut;
    if (!tableButton.disabled && state === 'free') {
      freeCount += 1;
    }

    const stateLabel =
      state === 'occupied'
        ? 'Занят на выбранное время'
        : state === 'capacity-locked'
        ? 'Недоступен по вместимости'
        : state === 'disabled'
        ? 'Временно недоступен'
        : 'Свободен';

    tableButton.title = `${table.name} • ${table.capacity} мест • ${ZONE_LABELS[table.zone]} • ${stateLabel}`;
    tableButton.innerHTML = `<strong>${table.name}</strong><span>${table.capacity} мест</span>`;

    tableButton.addEventListener('click', () => {
      pendingTableId = table.id;
      renderTableMap();
      updateModalFooter();
    });

    tableMap.appendChild(tableButton);
  });

  if (tableHint) {
    const hintText =
      freeCount > 0
        ? 'Бронь действует 2 часа от выбранного времени.'
        : 'На выбранные дату и время подходящих столов не найдено. Измените параметры.';
    tableHint.innerHTML = `Доступно столов: <strong id="table-available-count">${freeCount}</strong>. ${hintText}`;
  }

  updateTableContextPanel(getTableById(pendingTableId));
};

const openTableModal = () => {
  if (!bookingForm || !tableModal) return;

  const prerequisitesOk = validateBookingPrerequisites();
  if (!prerequisitesOk) {
    showToast('Сначала выберите дату, время и количество гостей.');
    return;
  }

  const context = getBookingContext();
  const preferredZone = 'all';
  if (tableZoneFilter) {
    tableZoneFilter.value = preferredZone;
  }

  pendingTableId = bookingForm.querySelector('#booking-table-id').value || null;
  renderTableMap();
  updateModalFooter();

  tableModal.classList.add('open');
  tableModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('table-modal-open');
};

const closeTableModal = () => {
  if (!tableModal) return;
  tableModal.classList.remove('open');
  tableModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('table-modal-open');
};

if (openTableModalBtn) {
  openTableModalBtn.addEventListener('click', openTableModal);
}

if (closeTableModalBtn) {
  closeTableModalBtn.addEventListener('click', closeTableModal);
}

if (closeTableModalBackdrop) {
  closeTableModalBackdrop.addEventListener('click', closeTableModal);
}

if (tableZoneFilter) {
  tableZoneFilter.addEventListener('change', renderTableMap);
}

if (clearTableSelectionBtn) {
  clearTableSelectionBtn.addEventListener('click', () => {
    pendingTableId = null;
    renderTableMap();
    updateModalFooter();
  });
}

if (confirmTableSelectionBtn && bookingForm) {
  confirmTableSelectionBtn.addEventListener('click', () => {
    if (!pendingTableId) return;
    const table = getTableById(pendingTableId);
    if (!table) return;

    bookingForm.querySelector('#booking-table-id').value = table.id;
    bookingForm.querySelector('#booking-table-label').value = table.name;
    bookingForm.querySelector('#booking-table-capacity').value = String(table.capacity);
    bookingForm.querySelector('#booking-table-zone').value = table.zone;

    // Синхронизируем зону формы с выбранным столом.
    const zoneSelect = bookingForm.querySelector('[name="zone"]');
    if (zoneSelect) zoneSelect.value = table.zone;

    bookingSummary?.classList.remove('is-missing');
    updateBookingSummary();
    closeTableModal();
  });
}

if (bookingForm) {
  const contextFields = ['date', 'time', 'guests', 'zone'];
  contextFields.forEach((fieldName) => {
    const field = bookingForm.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    field.addEventListener('change', () => {
      updateBookingSummary();

      // Проверка, что ранее выбранный стол все еще подходит под новый контекст.
      const selectedId = bookingForm.querySelector('#booking-table-id').value;
      const selectedTable = getTableById(selectedId);
      const context = getBookingContext();

      if (selectedTable) {
        const evaluation = evaluateTableState(selectedTable, context, 'all');
        if (evaluation.disabled) {
          clearSelectedTable();
          bookingSummary?.classList.add('is-missing');
          updateBookingSummary();
          showToast('Выбранный стол больше недоступен для новых параметров. Выберите другой.');
        }
      }

      if (tableModal?.classList.contains('open')) {
        renderTableMap();
        updateModalFooter();
      }
    });
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && tableModal?.classList.contains('open')) {
    closeTableModal();
  }
});

// ==============================
// Валидация форм
// ==============================
const setFieldError = (field, hasError) => {
  if (!field) return;
  field.classList.toggle('input-error', hasError);
};

const validateRequiredFields = (form) => {
  const fields = Array.from(form.querySelectorAll('[required]'));
  let isValid = true;

  fields.forEach((field) => {
    const value = field.value.trim();
    const hasError = value.length === 0;

    setFieldError(field, hasError);

    if (hasError) {
      isValid = false;
    }
  });

  return isValid;
};

// Быстрые проверки
const isPhoneLike = (value) => /^[\d+()\s-]{7,}$/.test(value);
const isEmailLike = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// ==============================
// Отправка бронирования в Telegram
// ==============================
const sendBookingToTelegram = async (payload) => {
  const config = window.TELEGRAM_BOOKING_CONFIG || TELEGRAM_BOOKING_CONFIG;
  const { botToken, chatId } = config;

  if (!botToken || !chatId || botToken.includes('PASTE_') || chatId.includes('PASTE_')) {
    throw new Error('Telegram не настроен: заполните botToken и chatId в script.js');
  }

  const text = [
    'Новая заявка на бронирование',
    `Имя: ${payload.name || '-'}`,
    `Телефон: ${payload.phone || '-'}`,
    `Дата: ${payload.date || '-'}`,
    `Время: ${payload.time || '-'}`,
    `Гости: ${payload.guests || '-'}`,
    `Зона: ${ZONE_LABELS[payload.zone] || payload.zone || '-'}`,
    `Стол: ${payload.tableLabel || payload.tableId || '-'}`,
    `Вместимость стола: ${payload.tableCapacity || '-'}`,
    `Комментарий: ${payload.comment || '-'}`
  ].join('\n');

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  if (!response.ok) {
    throw new Error('Не удалось отправить заявку в Telegram');
  }
};

// ==============================
// Универсальная логика отправки формы
// ==============================
const handleFormSubmit = (form, successMessage, customValidation, submitHandler, onSuccess) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const requiredOk = validateRequiredFields(form);
    const customOk = customValidation ? customValidation(form) : true;

    if (!requiredOk || !customOk) {
      showToast('Проверьте обязательные поля формы.');
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    const submitButton = form.querySelector('button[type="submit"]');
    const initialButtonText = submitButton ? submitButton.textContent : '';

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';
      }

      if (submitHandler) {
        await submitHandler(payload);
      } else {
        console.log('Form payload:', payload);
      }

      form.reset();
      form.querySelectorAll('.input-error').forEach((node) => {
        node.classList.remove('input-error');
      });

      if (onSuccess) {
        onSuccess(payload, form);
      }

      showToast(successMessage);
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Ошибка отправки. Попробуйте позже.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = initialButtonText;
      }
    }
  });
};

// ==============================
// Форма бронирования
// ==============================
if (bookingForm) {
  const dateInput = bookingForm.querySelector('[name="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  updateBookingSummary();

  const validateBookingForm = (form) => {
    const phone = form.querySelector('[name="phone"]');
    const phoneValue = phone.value.trim();
    const phoneOk = isPhoneLike(phoneValue);
    setFieldError(phone, !phoneOk);

    const tableId = form.querySelector('#booking-table-id').value;
    const zoneSelect = form.querySelector('[name="zone"]');

    if (!tableId) {
      bookingSummary?.classList.add('is-missing');
      showToast('Выберите стол на схеме зала.');
      return false;
    }

    const selectedTable = getTableById(tableId);
    const context = getBookingContext();
    if (!selectedTable || !context) {
      bookingSummary?.classList.add('is-missing');
      showToast('Не удалось определить параметры бронирования. Проверьте форму.');
      return false;
    }

    const tableStillAvailable = !evaluateTableState(selectedTable, context, 'all').disabled;
    const zoneMatches = !context.zone || selectedTable.zone === context.zone;
    setFieldError(zoneSelect, !zoneMatches);

    if (!tableStillAvailable || !zoneMatches) {
      clearSelectedTable();
      bookingSummary?.classList.add('is-missing');
      updateBookingSummary();
      showToast('Стол недоступен на выбранное время. Выберите другой.');
      return false;
    }

    bookingSummary?.classList.remove('is-missing');
    return phoneOk;
  };

  const submitBookingReservation = async (payload) => {
    await sendBookingToTelegram(payload);

    const newBooking = {
      tableId: payload.tableId,
      date: payload.date,
      time: payload.time,
      durationMinutes: BOOKING_SLOT_DURATION_MINUTES
    };

    tableBookings.push(newBooking);

    const targetTable = getTableById(payload.tableId);
    if (targetTable) {
      targetTable.bookings = targetTable.bookings || [];
      targetTable.bookings.push({
        date: payload.date,
        time: payload.time,
        durationMinutes: BOOKING_SLOT_DURATION_MINUTES
      });
    }
  };

  handleFormSubmit(
    bookingForm,
    'Заявка на бронирование отправлена. Стол успешно закреплен за вами.',
    validateBookingForm,
    submitBookingReservation,
    () => {
      clearSelectedTable();
      bookingSummary?.classList.remove('is-missing');
      updateBookingSummary();
      renderTableMap();
      updateModalFooter();
    },
  );
}

// ==============================
// Форма предложений и жалоб
// ==============================
const feedbackForm = document.getElementById('feedback-form');

if (feedbackForm) {
  handleFormSubmit(
    feedbackForm,
    'Обращение принято. Благодарим за обратную связь.',
    (form) => {
      const contact = form.querySelector('[name="contact"]');
      const value = contact.value.trim();
      const ok = isPhoneLike(value) || isEmailLike(value);

      setFieldError(contact, !ok);
      return ok;
    },
    async (payload) => {
      console.log('Feedback payload:', payload);
      // Сюда позже можно подключить Telegram / Email / Backend
    }
  );
}
