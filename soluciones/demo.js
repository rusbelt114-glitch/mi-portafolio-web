'use strict';

// Reusable interactive demonstrations. All data are invented and kept only in this browser.
const CATALOG = {
  'barberias': {name:'Barberías',group:'servicios',mode:'agenda',description:'Agenda, seguimiento de atención y estimación de servicios.',services:[['Corte de cabello',12],['Barba',8],['Corte y barba',18]],report:false},
  'licorerias': {name:'Licorerías',group:'comercios',mode:'stock',description:'Presentaciones, ventas y cotización de productos.',items:[['Agua mineral (unidad)',18,1.5],['Refresco (pack)',7,8],['Bebida de muestra (caja)',4,22]],actions:['Inventario','Venta de muestra','Cotizador'],verb:'Venta'},
  'restaurantes': {name:'Restaurantes y cafeterías',group:'comida',mode:'stock',description:'Platos disponibles, pedidos y cuenta estimada.',items:[['Menú del día',12,7],['Café',20,2],['Postre',4,4]],actions:['Menú disponible','Registrar pedido','Cuenta estimada'],verb:'Pedido'},
  'hoteles': {name:'Hoteles y posadas',group:'comida',mode:'hotel',description:'Habitaciones, solicitud de reserva por fecha y presupuesto.',rooms:[['Habitación estándar',3,35],['Habitación doble',2,50],['Habitación familiar',1,75]]},
  'telefonos': {name:'Tiendas de teléfonos',group:'comercios',mode:'stock',description:'Modelos disponibles, ventas y cotizaciones.',items:[['Teléfono modelo A · 128 GB',5,160],['Teléfono modelo B · 256 GB',2,230],['Cargador USB-C',9,12]],actions:['Inventario','Venta de muestra','Cotizador'],verb:'Venta'},
  'ropa-calzado': {name:'Ropa y calzado',group:'comercios',mode:'stock',description:'Tallas, existencias, ventas y cotizaciones.',items:[['Franela negra · M',6,12],['Jean azul · 32',2,25],['Zapatos casuales · 40',3,38]],actions:['Tallas y existencias','Registrar venta','Cotizador'],verb:'Venta'},
  'salones': {name:'Salones de belleza',group:'servicios',mode:'agenda',description:'Citas, atención y estimación de servicios.',services:[['Corte',15],['Manicura',12],['Peinado',25]],report:false},
  'gimnasios': {name:'Gimnasios',group:'servicios',mode:'gym',description:'Socios, asistencias y mensualidades de muestra.'},
  'farmacias': {name:'Farmacias',group:'comercios',mode:'stock',description:'Existencias, movimiento de productos y cotización. No incluye indicaciones médicas.',items:[['Producto de higiene A',10,4],['Venda elástica',3,6],['Protector solar',5,14]],actions:['Existencias','Salida de muestra','Cotizador'],verb:'Salida'},
  'repuestos-talleres': {name:'Repuestos y talleres',group:'servicios',mode:'stock',description:'Piezas, órdenes de trabajo y presupuesto. Ejemplo adaptable a distintos talleres.',items:[['Filtro de muestra',7,12],['Pastillas de freno',2,28],['Correa de muestra',1,35]],actions:['Inventario','Orden de trabajo','Presupuesto'],verb:'Orden',job:true},
  'minimarkets': {name:'Minimarkets y abastos',group:'comercios',mode:'stock',description:'Productos, ventas y cuenta estimada.',items:[['Arroz (paquete)',12,2],['Aceite (botella)',3,5],['Leche (envase)',6,3]],actions:['Inventario','Registrar venta','Cuenta estimada'],verb:'Venta'},
  'consultorios': {name:'Consultorios',group:'salud',mode:'agenda',description:'Citas, turnos y resumen del día sin datos personales.',services:[['Consulta general',0],['Control',0],['Orientación',0]],report:true},
  'gasolineras': {name:'Gasolineras',group:'comercios',mode:'stock',description:'Disponibilidad de muestra, despacho y cierre de turno.',items:[['Combustible A (litros)',350,1],['Combustible B (litros)',120,1.2],['Lubricante (unidad)',9,8]],actions:['Disponibilidad','Registrar despacho','Cierre de turno'],verb:'Despacho',summary:true},
  'hospitales': {name:'Hospitales',group:'salud',mode:'agenda',description:'Turnos de servicios y resumen de atención; sin información clínica.',services:[['Admisión de muestra',0],['Consulta externa',0],['Atención administrativa',0]],report:true}
};

const $ = (selector,scope=document)=>scope.querySelector(selector);
const $$ = (selector,scope=document)=>[...scope.querySelectorAll(selector)];
const make = (tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node};
const money = amount=>'$'+Number(amount).toFixed(2);
const kinds = {
  stock:['Existencias','Movimientos','Estimación'],
  agenda:['Agenda','Atención','Estimación'],
  hotel:['Habitaciones','Reservas','Presupuesto'],
  gym:['Socios','Asistencia','Mensualidades']
};
function dayAt(offset=0){const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()+offset);return date.toISOString().slice(0,10)}
function defaultState(cfg){
  if(cfg.mode==='stock')return {quantities:cfg.items.map(i=>i[1]),operations:[],next:1};
  if(cfg.mode==='agenda')return {appointments:[],next:1};
  if(cfg.mode==='hotel')return {reservations:[],next:1};
  return {members:[{id:1,until:dayAt(12),visits:0}],next:2};
}
function safeState(value,cfg){
  if(!value||typeof value!=='object')return false;
  if(cfg.mode==='stock')return Array.isArray(value.quantities)&&value.quantities.length===cfg.items.length&&value.quantities.every(v=>Number.isInteger(v)&&v>=0)&&Array.isArray(value.operations)&&Number.isInteger(value.next);
  if(cfg.mode==='agenda')return Array.isArray(value.appointments)&&Number.isInteger(value.next);
  if(cfg.mode==='hotel')return Array.isArray(value.reservations)&&Number.isInteger(value.next);
  return Array.isArray(value.members)&&Number.isInteger(value.next);
}
function initialize(){
  const hub=$('#sector-hub');if(hub){$$('[data-group]',hub).forEach(b=>b.addEventListener('click',()=>{$$('[data-group]',hub).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$$('.sector-card',hub).forEach(card=>card.hidden=card.dataset.group!==b.dataset.group)}));return}
  const root=$('#demo-app');if(!root)return;
  const slug=root.dataset.sector,cfg=CATALOG[slug];if(!cfg){$('#sector-name',root).textContent='Negocio no disponible';return}
  $('#sector-name',root).textContent=cfg.name;$('#sector-description',root).textContent=cfg.description;
  const key='rusbelt-portfolio-demo-v2:'+slug;
  let state;try{const saved=JSON.parse(localStorage.getItem(key));state=safeState(saved,cfg)?saved:defaultState(cfg)}catch{state=defaultState(cfg)}
  let active=0;const stage=$('#demo-stage',root),nav=$('#demo-options',root),status=$('#demo-status',root);
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{status.textContent='Este navegador no pudo guardar los cambios. La prueba seguirá hasta que cierres o recargues la página.'}};
  const announce=text=>{status.textContent=text};
  const change=callback=>{callback();persist();render()};
  const tabs=cfg.actions||kinds[cfg.mode];
  tabs.forEach((name,index)=>{const button=make('button',`${index+1}. ${name}`,'demo-option');button.type='button';button.setAttribute('aria-pressed',String(index===active));button.addEventListener('click',()=>{active=index;render()});nav.append(button)});
  $('#demo-reset',root).addEventListener('click',()=>{state=defaultState(cfg);active=0;persist();render();announce('Prueba restablecida con datos ficticios.')});
  function render(){
    $$('.demo-option',nav).forEach((button,index)=>button.setAttribute('aria-pressed',String(index===active)));
    stage.replaceChildren();
    const heading=make('div',undefined,'demo-stage-header');heading.append(make('h2',tabs[active]),make('span','DATOS DE EJEMPLO','demo-tag'));stage.append(heading);
    if(cfg.mode==='stock')renderStock();
    else if(cfg.mode==='agenda')renderAgenda();
    else if(cfg.mode==='hotel')renderHotel();
    else renderGym();
  }
  function formField(label,type,options){const wrap=make('label',undefined,'demo-field');wrap.append(make('span',label));let input;
    if(type==='select'){input=make('select');options.forEach(([value,text])=>{const option=make('option',text);option.value=String(value);input.append(option)})}
    else {input=make('input');input.type=type;if(type==='number'){input.min='1';input.max='9999';input.step='1';input.value='1'}if(type==='date')input.min=dayAt()}
    wrap.append(input);return [wrap,input]
  }
  function action(text,callback,secondary=false){const button=make('button',text,'demo-action'+(secondary?' secondary':''));button.type='button';button.addEventListener('click',callback);return button}
  function note(text){stage.append(make('p',text,'demo-help'))}
  function productOptions(){return cfg.items.map((item,index)=>[index,item[0]])}
  function renderStock(){
    if(active===0){
      const [searchWrap,search]=formField('Buscar producto','search');search.placeholder='Escribe para filtrar';stage.append(searchWrap);
      const list=make('div',undefined,'demo-list');stage.append(list);
      const draw=()=>{list.replaceChildren();let matches=0;cfg.items.forEach(([name,,price],i)=>{if(!name.toLocaleLowerCase('es').includes(search.value.toLocaleLowerCase('es')))return;matches++;const card=make('div',undefined,'demo-list-row');const description=make('div');description.append(make('strong',name),make('small',`${money(price)} · ${state.quantities[i]} disponibles`));const controls=make('div',undefined,'demo-row-actions');controls.append(action('−1',()=>change(()=>{if(state.quantities[i]===0){announce('No hay unidades para retirar.');return}state.quantities[i]--;announce('Salida registrada: '+name)}),true),action('+1',()=>change(()=>{state.quantities[i]++;announce('Entrada registrada: '+name)}),true));card.append(description,controls);list.append(card)});if(!matches)list.append(make('p','No hay coincidencias.','demo-help'))};search.addEventListener('input',draw);draw();
      note('Prueba las entradas y salidas. Ninguna operación modifica un inventario real.');return
    }
    if(active===1){
      const [partWrap,part]=formField('Producto o insumo','select',productOptions());const [qtyWrap,qty]=formField('Cantidad','number');const fields=make('div',undefined,'demo-fields');fields.append(partWrap,qtyWrap);stage.append(fields);
      let job;if(cfg.job){const [jobWrap,input]=formField('Trabajo que realizará el taller','text');job=input;job.maxLength=50;job.placeholder='Ej. revisión y cambio de pieza';stage.append(jobWrap)}
      stage.append(action('Registrar '+cfg.verb.toLocaleLowerCase('es'),()=>{
        const index=Number(part.value),amount=Number(qty.value);
        if(!Number.isInteger(amount)||amount<1){announce('Introduce una cantidad entera mayor que cero.');return}
        if(amount>state.quantities[index]){announce('No se puede registrar: existencias insuficientes.');return}
        if(cfg.job&&!job.value.trim()){announce('Escribe el trabajo para identificar esta orden.');return}
        change(()=>{state.quantities[index]-=amount;state.operations.unshift({id:state.next++,item:index,qty:amount,total:amount*cfg.items[index][2],job:cfg.job?job.value.trim():'',state:'Registrado'});announce(cfg.verb+' registrada. Se descontaron '+amount+' unidades.')})
      }));
      const list=make('div',undefined,'demo-list');stage.append(list);
      if(!state.operations.length)list.append(make('p','Aún no hay movimientos. Registra el primero arriba.','demo-empty'));
      state.operations.slice(0,8).forEach(op=>{const row=make('div',undefined,'demo-list-row');const text=make('div');text.append(make('strong',`#${String(op.id).padStart(3,'0')} · ${cfg.items[op.item]?.[0]||'Producto'}`),make('small',`${op.job?op.job+' · ':''}${op.qty} unidades · ${money(op.total)} · ${op.state}`));row.append(text);
        const controls=make('div',undefined,'demo-row-actions');
        if(cfg.job&&op.state==='Registrado')controls.append(action('Iniciar',()=>change(()=>{op.state='En proceso';announce('Orden en proceso.')}),true));
        if(cfg.job&&op.state==='En proceso')controls.append(action('Finalizar',()=>change(()=>{op.state='Listo';announce('Orden lista.')}),true));
        if(op.state==='Registrado'||op.state==='En proceso')controls.append(action('Anular',()=>change(()=>{op.state='Anulado';state.quantities[op.item]+=op.qty;announce('Movimiento anulado: unidades devueltas al inventario.')}),true));
        if(controls.children.length)row.append(controls);list.append(row)});
      note('Al registrar se descuentan unidades; al anular, se devuelven. Las órdenes pueden pasar a En proceso y Listo.');return
    }
    if(cfg.summary){const total=state.operations.filter(o=>o.state==='Registrado').reduce((sum,o)=>sum+o.total,0);stage.append(make('p',`Movimientos vigentes de esta prueba: ${state.operations.filter(o=>o.state==='Registrado').length}`,'demo-summary'),make('p',`Total estimado del turno: ${money(total)}`,'demo-big'));note('Es un resumen ficticio de los movimientos registrados aquí, no un cierre fiscal.');return}
    const [partWrap,part]=formField('Selecciona un producto','select',productOptions());const [qtyWrap,qty]=formField('Cantidad','number');const fields=make('div',undefined,'demo-fields');fields.append(partWrap,qtyWrap);stage.append(fields);
    let labor;if(cfg.job){const [laborWrap,select]=formField('Trabajo estimado','select',[[0,'Solo pieza · $0'],[15,'Trabajo sencillo · $15'],[30,'Trabajo estándar · $30'],[50,'Trabajo especializado · $50']]);labor=select;stage.append(laborWrap)}
    const result=make('div',undefined,'demo-result');stage.append(result);
    const calculate=()=>{const i=Number(part.value),n=Number(qty.value);result.replaceChildren();if(!Number.isInteger(n)||n<1){result.append(make('strong','Introduce una cantidad válida.'));return}result.append(make('span',`${cfg.items[i][0]} × ${n}${labor?' + trabajo':''}`),make('strong',money(cfg.items[i][2]*n+(labor?Number(labor.value):0))),make('small',n<=state.quantities[i]?`Disponible: ${state.quantities[i]} unidades.`:`Solo hay ${state.quantities[i]} unidades; no se podría completar.`))};part.addEventListener('change',calculate);qty.addEventListener('input',calculate);if(labor)labor.addEventListener('change',calculate);calculate();note('Esto calcula una estimación; no registra una venta ni reserva unidades. Los precios son ficticios.')
  }
  function agendaOptions(){return cfg.services.map(([name],i)=>[i,name])}
  function agendaSlots(){return ['09:00','10:00','11:00','14:00','15:00']}
  function renderAgenda(){
    if(active===0){
      const [serviceWrap,service]=formField('Servicio','select',agendaOptions());const [dateWrap,date]=formField('Fecha','date');date.value=dayAt();const [timeWrap,time]=formField('Hora disponible','select',agendaSlots().map(t=>[t,t]));const fields=make('div',undefined,'demo-fields');fields.append(serviceWrap,dateWrap,timeWrap);stage.append(fields);
      stage.append(action('Reservar horario de muestra',()=>{if(!date.value||date.value<dayAt()){announce('Selecciona una fecha válida desde hoy.');return}if(state.appointments.some(a=>a.date===date.value&&a.time===time.value&&a.state!=='Cancelado')){announce('Ese horario ya está reservado en esta prueba.');return}change(()=>{state.appointments.push({id:state.next++,service:Number(service.value),date:date.value,time:time.value,state:'Reservado'});announce('Horario reservado; aparece también en Atención.')})}));
      showAppointments(false);note('Una sola agenda de ejemplo. En un sistema real se configurarían profesionales, recursos y horarios.');return
    }
    if(active===1){showAppointments(true);note('Avanza cada turno de Reservado a En atención y Finalizado. No se guardan nombres ni datos clínicos.');return}
    if(cfg.report){const stats=['Reservado','En atención','Finalizado','Cancelado'].map(status=>[status,state.appointments.filter(a=>a.state===status).length]);const summary=make('div',undefined,'demo-stats');stats.forEach(([name,total])=>{const card=make('div',undefined,'demo-stat');card.append(make('strong',String(total)),make('span',name));summary.append(card)});stage.append(summary);note('Resumen de esta prueba en el navegador; no incluye datos personales ni de pacientes.');return}
    const [serviceWrap,service]=formField('Servicio','select',agendaOptions());stage.append(serviceWrap);const result=make('div',undefined,'demo-result');stage.append(result);const draw=()=>{const [name,price]=cfg.services[Number(service.value)];result.replaceChildren(make('span',name),make('strong',money(price)),make('small','Monto de muestra; confirma precios y condiciones con el negocio.'))};service.addEventListener('change',draw);draw()
  }
  function showAppointments(controls){const list=make('div',undefined,'demo-list');stage.append(list);if(!state.appointments.length){list.append(make('p','No hay reservas todavía. Crea una en Agenda.','demo-empty'));return}
    [...state.appointments].reverse().slice(0,12).forEach(ap=>{const row=make('div',undefined,'demo-list-row');const text=make('div');text.append(make('strong',`#${String(ap.id).padStart(3,'0')} · ${cfg.services[ap.service]?.[0]||'Servicio'}`),make('small',`${ap.date} · ${ap.time} · ${ap.state}`));row.append(text);
      if(controls&&ap.state==='Reservado')row.append(action('Iniciar',()=>change(()=>{ap.state='En atención';announce('Turno iniciado.')}),true));
      else if(controls&&ap.state==='En atención')row.append(action('Finalizar',()=>change(()=>{ap.state='Finalizado';announce('Turno finalizado.')}),true));
      else if(!controls&&ap.state==='Reservado')row.append(action('Cancelar',()=>change(()=>{ap.state='Cancelado';announce('Reserva cancelada; el horario vuelve a estar disponible.')}),true));
      list.append(row)})
  }
  function hotelOptions(){return cfg.rooms.map(([name],i)=>[i,name])}
  function countHotel(room,date,nights){const start=new Date(date+'T12:00:00').getTime(),end=start+nights*86400000;let peak=0;for(let time=start;time<end;time+=86400000){const occupied=state.reservations.filter(r=>r.room===room&&r.state==='Vigente'&&new Date(r.date+'T12:00:00').getTime()<=time&&new Date(r.date+'T12:00:00').getTime()+r.nights*86400000>time).length;peak=Math.max(peak,occupied)}return cfg.rooms[room][1]-peak}
  function renderHotel(){
    if(active===0){const list=make('div',undefined,'demo-list');cfg.rooms.forEach(([name,count,rate],i)=>{const row=make('div',undefined,'demo-list-row');const text=make('div');text.append(make('strong',name),make('small',`${count} habitaciones de muestra · ${money(rate)} por noche`));row.append(text);list.append(row)});stage.append(list);note('Para comprobar fechas específicas, entra en Reservas o Presupuesto.');return}
    const [roomWrap,room]=formField('Tipo de habitación','select',hotelOptions());const [dateWrap,date]=formField('Entrada','date');date.value=dayAt();const [nightsWrap,nights]=formField('Noches','number');const fields=make('div',undefined,'demo-fields');fields.append(roomWrap,dateWrap,nightsWrap);stage.append(fields);
    const result=make('div',undefined,'demo-result');stage.append(result);
    const valid=()=>{const n=Number(nights.value);return date.value&&date.value>=dayAt()&&Number.isInteger(n)&&n>=1&&n<=30};
    const draw=()=>{result.replaceChildren();if(!valid()){result.append(make('strong','Elige una fecha desde hoy y entre 1 y 30 noches.'));return}const i=Number(room.value),n=Number(nights.value),available=countHotel(i,date.value,n);result.append(make('span',`${cfg.rooms[i][0]} · ${n} noche${n===1?'':'s'}`),make('strong',money(cfg.rooms[i][2]*n)),make('small',available>0?`${available} disponible(s) durante todas las noches.`:'Sin disponibilidad durante toda la estancia.'))};[room,date,nights].forEach(el=>el.addEventListener('change',draw));nights.addEventListener('input',draw);draw();
    if(active===1){stage.append(action('Registrar reserva de muestra',()=>{if(!valid()){announce('Fecha o noches no válidas.');return}const i=Number(room.value),n=Number(nights.value);if(countHotel(i,date.value,n)<=0){announce('No hay disponibilidad para todas esas noches.');return}change(()=>{state.reservations.unshift({id:state.next++,room:i,date:date.value,nights:n,state:'Vigente'});announce('Reserva registrada en esta prueba.')})}));const list=make('div',undefined,'demo-list');stage.append(list);if(!state.reservations.length)list.append(make('p','Sin reservas en esta prueba.','demo-empty'));state.reservations.slice(0,8).forEach(r=>{const row=make('div',undefined,'demo-list-row');const info=make('div');info.append(make('strong',`#${String(r.id).padStart(3,'0')} · ${cfg.rooms[r.room]?.[0]||'Habitación'}`),make('small',`${r.date} · ${r.nights} noche(s) · ${r.state}`));row.append(info);if(r.state==='Vigente')row.append(action('Cancelar',()=>change(()=>{r.state='Cancelada';announce('Reserva cancelada; la habitación quedó disponible.')}),true));list.append(row)});note('La disponibilidad considera todas las noches de esta prueba.');return}
    note('Presupuesto ficticio; calcularlo no realiza ni modifica reservas.')
  }
  function renderGym(){
    if(active===0){stage.append(action('Registrar socio de muestra',()=>change(()=>{state.members.push({id:state.next++,until:dayAt(30),visits:0});announce('Socio de muestra agregado por 30 días.')})));membersList('Socios de esta prueba');note('Solo se usan números de socio inventados, sin datos personales.');return}
    if(active===1){membersList('Marca una asistencia',m=>action('Registrar entrada',()=>change(()=>{m.visits++;announce('Asistencia registrada para Socio '+String(m.id).padStart(3,'0'))}),true));note('Las asistencias quedan asociadas al socio de muestra seleccionado.');return}
    membersList('Renueva una mensualidad',m=>action('Sumar 30 días',()=>change(()=>{const base=new Date(Math.max(new Date(m.until+'T12:00:00').getTime(),new Date(dayAt()+'T12:00:00').getTime()));base.setDate(base.getDate()+30);m.until=base.toISOString().slice(0,10);announce('Mensualidad extendida para Socio '+String(m.id).padStart(3,'0'))}),true));note('Las fechas se calculan para la demo; no hay pagos ni cobros reales.')
  }
  function membersList(title,control){stage.append(make('p',title,'demo-subheading'));const list=make('div',undefined,'demo-list');state.members.slice(-12).reverse().forEach(m=>{const row=make('div',undefined,'demo-list-row');const info=make('div');info.append(make('strong','Socio '+String(m.id).padStart(3,'0')),make('small',`Vence ${m.until} · ${m.visits} asistencia(s)`));row.append(info);if(control)row.append(control(m));list.append(row)});stage.append(list)}
  render();
}
document.addEventListener('DOMContentLoaded',initialize);
