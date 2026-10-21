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
