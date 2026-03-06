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
// Anti-crash guards
// ==============================
const runSafely = (scope, fn) => {
  try {
    return fn();
  } catch (error) {
    console.error(`[${scope}]`, error);
    showToast('Произошла техническая ошибка. Интерфейс продолжает работу.');
    return null;
  }
};

window.addEventListener('error', (event) => {
  console.error('[window.error]', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[unhandledrejection]', event.reason);
});

// ==============================
// Vintage hero typing animation
// ==============================
const initHeroTyping = () => {
  const heroTitle = document.querySelector('.hero-title[data-typing-text]');
  if (!heroTitle) return;

  const titleText = (heroTitle.dataset.typingText || '').trim();
  const subtitleText = (heroTitle.dataset.typingSubtitle || '').trim();
  if (!titleText) return;

  const renderFinal = () => {
    heroTitle.innerHTML = '';

    const titleMain = document.createElement('span');
    titleMain.className = 'hero-title-main';
    titleMain.textContent = titleText;
    titleMain.style.clipPath = 'inset(0 0 0 0)';
    titleMain.style.filter = 'blur(0)';
    heroTitle.appendChild(titleMain);

    if (subtitleText) {
      const subtitle = document.createElement('span');
      subtitle.className = 'hero-title-sub';
      subtitle.textContent = subtitleText;
      heroTitle.appendChild(subtitle);
    }
    heroTitle.classList.remove('is-writing');
    window.requestAnimationFrame(() => {
      heroTitle.classList.add('done');
    });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderFinal();
    return;
  }

  heroTitle.innerHTML = '';
  heroTitle.classList.add('is-writing');

  const titleMain = document.createElement('span');
  titleMain.className = 'hero-title-main';
  titleMain.textContent = titleText;
  titleMain.style.clipPath = 'inset(-12% 100% -20% 0)';
  heroTitle.appendChild(titleMain);

  const pen = document.createElement('span');
  pen.className = 'hero-pen';
  heroTitle.appendChild(pen);

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const duration = 2600;
  const startAt = performance.now();
  let measuredWidth = 0;

  const tick = (now) => {
    if (!measuredWidth) {
      measuredWidth = Math.max(titleMain.getBoundingClientRect().width, 1);
    }

    const raw = Math.min((now - startAt) / duration, 1);
    const eased = easeInOutCubic(raw);
    const rightInset = Math.max(0, 100 - eased * 100);
    const wobbleY = Math.sin(raw * 18) * 1.8;
    const wobbleRot = Math.sin(raw * 9) * 2.2;

    titleMain.style.clipPath = `inset(-12% ${rightInset}% -20% 0)`;
    titleMain.style.filter = `blur(${(1 - eased) * 1.2}px)`;

    const penX = measuredWidth * eased;
    pen.style.transform = `translate(${penX}px, calc(-45% + ${wobbleY}px)) rotate(${(0.5 - eased) * 6 + wobbleRot}deg)`;

    if (raw < 1) {
      window.requestAnimationFrame(tick);
    } else {
      pen.remove();
      renderFinal();
    }
  };

  window.requestAnimationFrame(tick);
};

runSafely('initHeroTyping', initHeroTyping);

// ==============================
// Настройки Telegram
// ВАЖНО: для продакшена безопаснее отправлять через backend.
// Здесь runtime-конфиг берется из config.local.js (window.APP_CONFIG).
// ==============================
const TELEGRAM_BOOKING_CONFIG = {
  botToken: 'PASTE_YOUR_BOT_TOKEN',
  chatId: 'PASTE_YOUR_CHAT_ID'
};

const isPlaceholderConfigValue = (value) => {
  if (!value) return true;
  return String(value).includes('PASTE_');
};

const pickFirstValidConfigValue = (...values) => {
  for (const rawValue of values) {
    const value = String(rawValue || '').trim();
    if (!value || isPlaceholderConfigValue(value)) continue;
    return value;
  }
  return '';
};

const getTelegramConfig = () => {
  const appConfig = window.APP_CONFIG?.telegram || {};
  const metaBotToken = document
    .querySelector('meta[name="telegram-bot-token"]')
    ?.getAttribute('content')
    ?.trim() || '';
  const metaChatId = document
    .querySelector('meta[name="telegram-chat-id"]')
    ?.getAttribute('content')
    ?.trim() || '';

  return {
    botToken: pickFirstValidConfigValue(appConfig.botToken, metaBotToken, TELEGRAM_BOOKING_CONFIG.botToken),
    chatId: pickFirstValidConfigValue(appConfig.chatId, metaChatId, TELEGRAM_BOOKING_CONFIG.chatId)
  };
};

const validateTelegramConfig = (config) => {
  if (!config.botToken || !config.chatId) return false;
  if (isPlaceholderConfigValue(config.botToken) || isPlaceholderConfigValue(config.chatId)) return false;
  return true;
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
// Lazy background images (menu cards)
// ==============================
const lazyBgNodes = document.querySelectorAll('.lazy-bg[data-bg]');
if (lazyBgNodes.length) {
  const applyBackground = (node) => {
    const imageUrl = node.dataset.bg;
    if (!imageUrl) return;
    node.style.backgroundImage = `url('${imageUrl}')`;
    node.removeAttribute('data-bg');
  };

  if ('IntersectionObserver' in window) {
    const bgObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          applyBackground(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '220px 0px' }
    );
    lazyBgNodes.forEach((node) => bgObserver.observe(node));
  } else {
    lazyBgNodes.forEach(applyBackground);
  }
}

// ==============================
// AOS анимации
// ==============================
const revealAOSFallback = () => {
  // Если библиотека анимаций не загрузилась, не оставляем секции скрытыми.
  document.querySelectorAll('[data-aos]').forEach((node) => {
    node.classList.add('aos-animate');
    node.style.opacity = '1';
    node.style.transform = 'none';
  });
};

const initScrollAnimations = () => {
  if (typeof AOS === 'undefined') {
    revealAOSFallback();
    return;
  }

  let initialized = false;
  runSafely('AOS.init', () => {
    AOS.init({
      duration: 750,
      once: true,
      offset: 24,
      easing: 'ease-out-cubic'
    });
    initialized = true;
  });

  if (!initialized) {
    revealAOSFallback();
    return;
  }

  // Поддержка динамического контента/ленивой загрузки.
  window.setTimeout(() => {
    if (typeof AOS !== 'undefined' && typeof AOS.refreshHard === 'function') {
      AOS.refreshHard();
    }
  }, 350);
};

initScrollAnimations();

// ==============================
// Swiper слайдер
// ==============================
if (typeof Swiper !== 'undefined' && document.querySelector('.aster-swiper')) {
  runSafely('Swiper.init', () => {
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
  });
}

// ==============================
// Lightbox настройки
// ==============================
if (typeof lightbox !== 'undefined') {
  runSafely('lightbox.option', () => {
    lightbox.option({
      resizeDuration: 200,
      wrapAround: true,
      albumLabel: 'Изображение %1 из %2',
      fadeDuration: 300,
      imageFadeDuration: 300,
      disableScrolling: true
    });
  });
}

// ==============================
// Leaflet карта
// Координаты можно поменять под нужный адрес
// ==============================
const mapNode = document.getElementById('map');
let leafletMapInstance = null;

const showMapFallback = () => {
  if (!mapNode) return;
  mapNode.innerHTML = `
    <div style="display:grid;place-items:center;height:100%;min-height:320px;color:#dbcfbe;background:rgba(20,20,22,.35);text-align:center;padding:16px;">
      Карта временно недоступна. Нажмите «Построить маршрут» выше.
    </div>
  `;
};

const initLeafletMap = () => {
  if (!mapNode || leafletMapInstance || typeof L === 'undefined') return false;

  const initialized = runSafely('Leaflet.init', () => {
    leafletMapInstance = L.map('map', { zoomControl: true }).setView([44.8488, 65.4823], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(leafletMapInstance);

    L.marker([44.8488, 65.4823])
      .addTo(leafletMapInstance)
      .bindPopup('Aster Lounge Cafe & Kitchen')
      .openPopup();

    const refreshMapSize = () => leafletMapInstance && leafletMapInstance.invalidateSize();
    window.addEventListener('load', refreshMapSize);
    window.addEventListener('resize', refreshMapSize);
    window.setTimeout(refreshMapSize, 350);
    window.setTimeout(refreshMapSize, 1200);

    // На случай инициализации до полной видимости секции.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          refreshMapSize();
          obs.disconnect();
        });
      }, { threshold: 0.2 });
      observer.observe(mapNode);
    }
  });

  return Boolean(initialized);
};

if (mapNode) {
  // Повторяем попытку инициализации, если Leaflet CDN подгружается с задержкой.
  let attempts = 0;
  const maxAttempts = 20; // ~10 секунд при 500ms интервале
  const tryInitMap = () => {
    attempts += 1;
    if (initLeafletMap()) return;

    if (attempts >= maxAttempts) {
      showMapFallback();
      return;
    }
    window.setTimeout(tryInitMap, 500);
  };

  tryInitMap();
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

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateWithOffset = (daysOffset) => {
  const now = new Date();
  now.setDate(now.getDate() + daysOffset);
  return formatLocalDate(now);
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
const tableGuestsFilter = document.getElementById('table-guests-filter');
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
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return NaN;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return NaN;
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

const getGuestsField = () => bookingForm?.querySelector('[name="guests"]') || null;

const syncGuestsFilterFromForm = () => {
  const guestsField = getGuestsField();
  if (!tableGuestsFilter || !guestsField) return;
  tableGuestsFilter.value = guestsField.value || '';
};

const initGuestsFilterOptions = () => {
  const guestsField = getGuestsField();
  if (!tableGuestsFilter || !guestsField) return;

  tableGuestsFilter.innerHTML = guestsField.innerHTML;
  syncGuestsFilterFromForm();
};

const sanitizeTables = (tables) =>
  tables.filter((table) =>
    table &&
    typeof table.id === 'string' &&
    typeof table.name === 'string' &&
    typeof table.capacity === 'number' &&
    typeof table.zone === 'string' &&
    typeof table.x === 'number' &&
    typeof table.y === 'number'
  );

const SAFE_TABLES = sanitizeTables(RESTAURANT_TABLES);

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
  if (!SAFE_TABLES.length) {
    tableMap.innerHTML = '<p style=\"padding:12px;color:#d9d0c5;\">Схема столов временно недоступна.</p>';
    return;
  }

  let freeCount = 0;
  let capacityLockedCount = 0;
  let occupiedCount = 0;
  let disabledCount = 0;

  SAFE_TABLES.forEach((table) => {
    const tableButton = document.createElement('button');
    tableButton.type = 'button';
    tableButton.className = `table-node table-node--${table.shape === 'round' ? 'round' : 'rect'} table-node--${table.size}`;
    tableButton.style.setProperty('--x', String(Math.max(5, Math.min(95, table.x))));
    tableButton.style.setProperty('--y', String(Math.max(8, Math.min(92, table.y))));

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

    if (state === 'capacity-locked') capacityLockedCount += 1;
    if (state === 'occupied') occupiedCount += 1;
    if (state === 'disabled') disabledCount += 1;

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
    let hintText = 'Бронь действует 2 часа от выбранного времени.';
    if (!context.guests) {
      hintText = 'Укажите количество гостей для корректного подбора столов.';
    } else if (freeCount === 0) {
      hintText = 'На выбранные дату и время подходящих столов не найдено. Измените параметры.';
    } else if (capacityLockedCount > 0) {
      hintText = `Для ${context.guests} гостей часть столов скрыта по вместимости (${capacityLockedCount}).`;
    }

    tableHint.innerHTML = `Доступно столов: <strong id="table-available-count">${freeCount}</strong> · Занято: ${occupiedCount} · Недоступно: ${capacityLockedCount + disabledCount}. ${hintText}`;
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
  if (tableGuestsFilter) {
    tableGuestsFilter.value = context?.guests ? String(context.guests) : '';
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

if (tableGuestsFilter) {
  tableGuestsFilter.addEventListener('change', () => {
    if (!bookingForm) return;
    const guestsField = getGuestsField();
    if (!guestsField) return;

    guestsField.value = tableGuestsFilter.value;
    guestsField.dispatchEvent(new Event('change', { bubbles: true }));
  });
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
  initGuestsFilterOptions();
  const contextFields = ['date', 'time', 'guests', 'zone'];
  contextFields.forEach((fieldName) => {
    const field = bookingForm.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    field.addEventListener('change', () => {
      if (fieldName === 'guests') {
        syncGuestsFilterFromForm();
      }
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
  const config = getTelegramConfig();
  const { botToken, chatId } = config;

  if (!validateTelegramConfig(config)) {
    throw new Error('Telegram не настроен: задайте botToken/chatId в config.local.js или meta-тегах index.html.');
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
    let reason = 'Не удалось отправить заявку в Telegram';
    try {
      const body = await response.json();
      if (body?.description) {
        reason = `Telegram error: ${body.description}`;
      }
    } catch {
      // ignore parse errors and keep default reason
    }
    throw new Error(reason);
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
    const today = formatLocalDate(new Date());
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
