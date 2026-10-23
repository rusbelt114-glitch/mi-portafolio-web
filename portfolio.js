'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu() { navigation.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Abrir menú'); }
menuButton.addEventListener('click', () => { const open=menuButton.getAttribute('aria-expanded')!=='true'; navigation.classList.toggle('is-open',open); menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú'); });
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && navigation.classList.contains('is-open')){closeMenu();menuButton.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{let count=0;document.querySelectorAll('.project-card').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++;});document.querySelectorAll('[data-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});document.querySelector('.project-count').textContent=`${count} ${count===1?'proyecto':'proyectos'}`;}));
document.querySelectorAll('[data-open-case]').forEach(link=>link.addEventListener('click',()=>{document.getElementById(link.dataset.openCase).open=true;}));
document.getElementById('year').textContent=new Date().getFullYear();

function openLinkedCase(){const target=document.getElementById(location.hash.slice(1));if(target?.tagName==='DETAILS')target.open=true;}
window.addEventListener('hashchange',openLinkedCase);openLinkedCase();

// Keep one business open, and keep the desktop detail area populated.
const businessOptions = [...document.querySelectorAll('.business-option')];
businessOptions.forEach(option => {
  option.addEventListener('toggle', () => {
    if (option.open) businessOptions.forEach(other => { if (other !== option) other.open = false; });
  });
  option.querySelector('summary').addEventListener('click', event => {
    if (window.matchMedia('(min-width: 801px)').matches && option.open) event.preventDefault();
  });
});

function fitBusinessPanel() {
  const options = document.querySelector('.business-options');
  if (!options) return;
  if (window.matchMedia('(min-width: 801px)').matches) {
    const panel = options.querySelector('.business-option[open] .business-panel');
    const listHeight = businessOptions.reduce((height, item) => height + item.querySelector('summary').getBoundingClientRect().height + 10, 0);
    options.style.minHeight = Math.ceil(Math.max(listHeight, panel ? panel.getBoundingClientRect().height : 0) + 12) + 'px';
  } else {
    options.style.minHeight = '';
  }
}
businessOptions.forEach(option => option.addEventListener('toggle', fitBusinessPanel));
window.addEventListener('resize', fitBusinessPanel);
if ('ResizeObserver' in window) {
  const businessResizeObserver = new ResizeObserver(fitBusinessPanel);
  document.querySelectorAll('.business-panel').forEach(panel => businessResizeObserver.observe(panel));
}
if (document.fonts) document.fonts.ready.then(fitBusinessPanel);
fitBusinessPanel();

