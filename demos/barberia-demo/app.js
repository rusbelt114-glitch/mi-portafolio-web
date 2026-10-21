/* ============================
   BLADE & CROWN — Premium Barbershop
   JavaScript Application
   ============================ */

// ============================
// State Management
// ============================
const state = {
    currentSection: 'hero',
    bookingStep: 1,
    selectedService: { name: 'Corte + Barba', price: 25 },
    selectedBarber: 'Miguel Torres',
    selectedDate: null,
    selectedTime: null,
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear(),
};

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ============================
// Preloader
// ============================
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.classList.add('hidden');
        // Ambient particles omitted for a calmer interface.
        animateCounters();
    }, 0);
});

// ============================
// Particles
// ============================
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (4 + Math.random() * 4) + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ============================
// Counter Animation
// ============================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseFloat(counter.dataset.count);
        const isDecimal = counter.dataset.decimal === 'true';
        const duration = 2000;
        const startTime = Date.now();
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            
            if (isDecimal) {
                counter.textContent = current.toFixed(1);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    });
}

// ============================
// Navigation
// ============================
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show target section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        state.currentSection = sectionId;
    }
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // If booking section, initialize calendar
    if (sectionId === 'booking') {
        generateCalendar();
        generateTimeSlots();
        updateBookingSummary();
    }
    
    // Re-trigger animations
    setTimeout(() => {
        section.querySelectorAll('.animate-in').forEach((el, i) => {
            el.style.animation = 'none';
            el.offsetHeight; // Trigger reflow
            el.style.animation = `animateIn 0.8s var(--ease-out) ${i * 0.1}s forwards`;
        });
    }, 50);
}

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    lastScroll = window.scrollY;
});

// Mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('open');
    const toggle = document.querySelector('.mobile-menu-btn');
    toggle.setAttribute('aria-expanded', String(menu.classList.contains('open')));
    toggle.setAttribute('aria-label', menu.classList.contains('open') ? 'Cerrar menú' : 'Abrir menú');
}

// ============================
// Services Selection
// ============================
function selectService(element, name, price) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    state.selectedService = { name, price };
    
    // Show a nice ripple animation
    showToast(`✅ ${name} seleccionado — $${price}`);
    
    // Auto-navigate to booking
    setTimeout(() => showSection('booking'), 800);
}

// ============================
// Barbers Selection
// ============================
function selectBarber(element, name) {
    document.querySelectorAll('.barber-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    state.selectedBarber = name;
    
    showToast(`✅ Barbero: ${name}`);
}

// ============================
// Booking System
// ============================
function bookingSelectService(element, name, price) {
    document.querySelectorAll('.mini-service').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    state.selectedService = { name, price };
    updateBookingSummary();
}

function bookingSelectBarber(element, name) {
    document.querySelectorAll('.mini-barber').forEach(b => b.classList.remove('selected'));
    element.classList.add('selected');
    state.selectedBarber = name;
    updateBookingSummary();
}

function updateBookingSummary() {
    const serviceDisplay = document.getElementById('selectedServiceDisplay');
    const barberDisplay = document.getElementById('selectedBarberDisplay');
    
    if (serviceDisplay) {
        serviceDisplay.innerHTML = `<i class="fas fa-scissors"></i> <span>${state.selectedService.name} — $${state.selectedService.price}</span>`;
    }
    if (barberDisplay) {
        barberDisplay.innerHTML = `<i class="fas fa-user"></i> <span>${state.selectedBarber}</span>`;
    }
}

// Booking Steps
function goToStep(step) {
    if (step === 3 && (!state.selectedDate || !state.selectedTime)) { showToast('Elige una fecha y un horario para continuar.'); return; }
    state.bookingStep = step;
    
    // Update step indicators
    document.querySelectorAll('.booking-steps .step').forEach((s, i) => {
        s.classList.remove('active', 'completed');
        if (i + 1 < step) s.classList.add('completed');
        if (i + 1 === step) s.classList.add('active');
    });
    
    // Show correct content
    document.querySelectorAll('.booking-step-content').forEach(c => c.classList.remove('active'));
    const stepContent = document.getElementById(`bookingStep${step}`);
    if (stepContent) stepContent.classList.add('active');
    
    // Update confirmation details
    if (step === 3) {
        updateConfirmation();
    }
    
    // Generate calendar if step 2
    if (step === 2) {
        generateCalendar();
        generateTimeSlots();
    }
}

// ============================
// Calendar
// ============================
function generateCalendar() {
    const container = document.getElementById('calendarDays');
    const monthLabel = document.getElementById('calendarMonth');
    if (!container || !monthLabel) return;
    
    monthLabel.textContent = `${MONTHS[state.calendarMonth]} ${state.calendarYear}`;
    
    const firstDay = new Date(state.calendarYear, state.calendarMonth, 1);
    const lastDay = new Date(state.calendarYear, state.calendarMonth + 1, 0);
    const today = new Date();
    
    // Adjust for Monday start (0 = Monday in our grid)
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    
    container.innerHTML = '';
    
    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) {
        container.innerHTML += '<div class="cal-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(state.calendarYear, state.calendarMonth, day);
        const isPast = date < today && date.toDateString() !== today.toDateString();
        const isSunday = date.getDay() === 0;
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = state.selectedDate && 
            state.selectedDate.toDateString() === date.toDateString();
        
        let classes = 'cal-day';
        if (isPast || isSunday) classes += ' disabled';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        
        container.innerHTML += `
            <div class="${classes}" onclick="selectDate(${state.calendarYear}, ${state.calendarMonth}, ${day})">${day}</div>
        `;
    }
}

function changeMonth(direction) {
    state.calendarMonth += direction;
    if (state.calendarMonth > 11) {
        state.calendarMonth = 0;
        state.calendarYear++;
    }
    if (state.calendarMonth < 0) {
        state.calendarMonth = 11;
        state.calendarYear--;
    }
    generateCalendar();
}

function selectDate(year, month, day) {
    const date = new Date(year, month, day);
    const today = new Date();
    
    if (date < today && date.toDateString() !== today.toDateString()) return;
    if (date.getDay() === 0) return; // Sunday
    
    state.selectedDate = date;
    state.selectedTime = null;
    generateTimeSlots();
    generateCalendar();
    generateTimeSlots();
    
    const dateText = document.getElementById('selectedDateText');
    if (dateText) {
        dateText.textContent = `${day} de ${MONTHS[month]} ${year}`;
    }
}

// ============================
// Time Slots
// ============================
function generateTimeSlots() {
    const container = document.getElementById('timeSlots');
    if (!container) return;
    
    const slots = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
        '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
        '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
        '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'
    ];
    
    // Simulate some slots as unavailable
    const unavailable = new Set(['10:00 AM', '11:30 AM', '1:30 PM', '4:00 PM', '5:30 PM']);
    
    container.innerHTML = slots.map(slot => {
        const isUnavailable = unavailable.has(slot);
        const isSelected = state.selectedTime === slot;
        let classes = 'time-slot';
        if (isUnavailable) classes += ' unavailable';
        if (isSelected) classes += ' selected';
        
        return `<div class="${classes}" onclick="selectTime('${slot}', this)">${slot}</div>`;
    }).join('');
}

function selectTime(time, element) {
    if (element.classList.contains('unavailable')) return;
    
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    state.selectedTime = time;
}

// ============================
// Confirmation
// ============================
function updateConfirmation() {
    const els = {
        service: document.getElementById('confirmService'),
        barber: document.getElementById('confirmBarber'),
        date: document.getElementById('confirmDate'),
        time: document.getElementById('confirmTime'),
        price: document.getElementById('confirmPrice'),
    };
    
    if (els.service) els.service.textContent = state.selectedService.name;
    if (els.barber) els.barber.textContent = state.selectedBarber;
    if (els.date && state.selectedDate) {
        els.date.textContent = `${state.selectedDate.getDate()} de ${MONTHS[state.selectedDate.getMonth()]} ${state.selectedDate.getFullYear()}`;
    }
    if (els.time) els.time.textContent = state.selectedTime || '—';
    if (els.price) els.price.textContent = `$${state.selectedService.price}.00`;
}

function confirmBooking() {
    if (!state.selectedDate || !state.selectedTime) { showToast('Selecciona una fecha y un horario.'); return; }
    const name = document.getElementById('clientName');
    if (!name.value.trim()) { showToast('Completa el nombre de ejemplo.'); name.focus(); return; }
    const email = document.getElementById('clientEmail');
    if (!email.checkValidity()) { email.reportValidity(); return; }
    const modal = document.getElementById('successModal');
    if (!modal) return;
    
    // Generate booking code
    const code = 'BC-' + Math.floor(10000 + Math.random() * 90000);
    document.getElementById('bookingCode').textContent = code;
    
    // Set success details
    const successDate = document.getElementById('successDate');
    const successTime = document.getElementById('successTime');
    
    if (successDate && state.selectedDate) {
        successDate.textContent = `${state.selectedDate.getDate()} de ${MONTHS[state.selectedDate.getMonth()]} ${state.selectedDate.getFullYear()}`;
    } else if (successDate) {
        successDate.textContent = 'Fecha seleccionada';
    }
    
    if (successTime) {
        successTime.textContent = state.selectedTime || 'Hora seleccionada';
    }
    
    // Show modal
    modal.classList.add('open');
    modal.focus();
    
    // Confetti effect
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) createConfetti();
}

function closeModal() {
    document.getElementById('successModal').classList.remove('open');
}

// ============================
// Confetti Effect
// ============================
function createConfetti() {
    const colors = ['#c9a84c', '#e8d48b', '#fff', '#2ecc71', '#3498db'];
    const container = document.querySelector('.success-modal');
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: ${4 + Math.random() * 6}px;
            height: ${4 + Math.random() * 6}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            left: ${Math.random() * 100}%;
            top: -10px;
            opacity: 0;
            animation: confetti-fall ${1 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards;
            pointer-events: none;
            z-index: 10;
        `;
        container.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
    
    // Add confetti animation if not exists
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confetti-fall {
                0% { opacity: 1; transform: translateY(0) rotate(0deg); }
                100% { opacity: 0; transform: translateY(300px) rotate(${360 + Math.random() * 360}deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================
// Toast Notification
// ============================
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(22, 22, 31, 0.95);
        color: #f0f0f5;
        padding: 14px 28px;
        border-radius: 50px;
        font-size: 0.95rem;
        font-weight: 500;
        border: 1px solid rgba(201, 168, 76, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 5000;
        backdrop-filter: blur(10px);
        animation: toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        font-family: 'Inter', sans-serif;
    `;
    
    document.body.appendChild(toast);
    
    // Add toast animation
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes toast-in {
                from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes toast-out {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(100px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// ============================
// Chart Tab interaction
// ============================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// ============================
// Keyboard Navigation
// ============================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu.classList.contains('open')) {
            toggleMobileMenu();
        }
    }
});

// ============================
// Initialize
// ============================
document.addEventListener('DOMContentLoaded', () => {
    // Set today as default date for demo
    const today = new Date();
    state.selectedDate = null;
    state.selectedTime = null;
    
    // Generate calendar
    generateCalendar();
    generateTimeSlots();
});
