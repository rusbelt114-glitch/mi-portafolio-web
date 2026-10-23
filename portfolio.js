'use strict';
// Each primary destination is a separate page; there are no scrolling links.
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    let count = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    const counter = document.querySelector('.project-count');
    if (counter) counter.textContent = `${count} ${count === 1 ? 'proyecto' : 'proyectos'}`;
  });
});

function connectPanels(attribute, panelSelector) {
  const buttons = [...document.querySelectorAll(`[${attribute}]`)];
  buttons.forEach(button => button.addEventListener('click', () => {
    const selectedId = button.getAttribute(attribute);
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll(panelSelector).forEach(panel => { panel.hidden = panel.id !== selectedId; });
  }));
}
connectPanels('data-business', '.business-panel');
connectPanels('data-profile', '.profile-panel');

// Preserve previously shared section URLs, opening their new destination.
if (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')) {
  const legacyRoutes = {
    '#ideas-negocio': 'ideas.html', '#servicios': 'perfil.html?panel=servicios',
    '#sobre-mi': 'perfil.html', '#contacto': 'contacto.html',
    '#caso-barber': 'proyecto-barber.html', '#caso-angel': 'proyecto-angel.html',
    '#caso-tracker': 'proyecto-tracker.html', '#caso-universo': 'proyecto-universo.html'
  };
  if (legacyRoutes[location.hash]) location.replace(legacyRoutes[location.hash]);
}
if (location.pathname.endsWith('/perfil.html')) {
  const panel = new URLSearchParams(location.search).get('panel');
  if (panel === 'servicios') document.querySelector('[data-profile="servicios"]')?.click();
}
