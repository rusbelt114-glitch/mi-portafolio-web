'use strict';
// Five decision-oriented, fictitious demonstrations. No data leaves this browser.
const MODELS={
  gimnasios:{name:'Gimnasios',description:'Detecta cambios de asistencia, prueba horarios y evalúa clases.',tabs:['Seguimiento','Horas pico','Margen de clase']},
  licorerias:{name:'Licorerías',description:'Anticipa faltantes, prueba ofertas y revisa dinero inmovilizado.',tabs:['Reposición','Oferta rentable','Baja rotación']},
  hoteles:{name:'Hoteles y posadas',description:'Prioriza habitaciones, compara ingresos y diseña paquetes.',tabs:['Preparación','Tarifas','Paquete']},
  farmacias:{name:'Farmacias',description:'Prioriza vencimientos y decide compras o traslados con datos de ejemplo.',tabs:['Vencimientos','Compra sugerida','Entre sedes']},
  consultorios:{name:'Consultorios y centros de servicios',description:'Aprovecha cancelaciones y anticipa la carga de la agenda, sin datos de pacientes.',tabs:['Hueco libre','Duración','Retrasos']}
};
const root=document.querySelector('#demo-app');
if(root&&MODELS[root.dataset.sector]){
  const slug=root.dataset.sector,cfg=MODELS[slug],stage=document.querySelector('#demo-stage'),nav=document.querySelector('#demo-options'),status=document.querySelector('#demo-status');
  document.querySelector('#sector-name').textContent=cfg.name;
  document.querySelector('#sector-description').textContent=cfg.description;
  const defaults={
    gimnasios:{contacted:[],peakMoved:0},
    licorerias:{weekendStock:9,reviewed:[]},
    hoteles:{ready:[]},
    farmacias:{reviewed:[],branchA:2,branchB:16},
    consultorios:{slotTaken:false}
  };
  const key='rusbelt-portfolio-decisions-v1:'+slug;
  let state;
  try{const saved=JSON.parse(localStorage.getItem(key));state=structuredClone(defaults[slug]);
if(saved&&typeof saved==='object'&&!Array.isArray(saved)){
 const allowed={contacted:['Socio 014','Socio 031'],ready:['Habitación 04','Habitación 12','Habitación 08'],reviewed:slug==='licorerias'?[0,1,2]:['Protector solar · lote A','Producto de higiene · lote B','Venda elástica · lote C']};
 for(const k of Object.keys(state)){const v=saved[k];if(Array.isArray(state[k])&&Array.isArray(v))state[k]=[...new Set(v.filter(x=>allowed[k].includes(x)))];else if(typeof state[k]==='boolean'&&typeof v==='boolean')state[k]=v;else if(k==='peakMoved'&&Number.isInteger(v)&&v>=0&&v<=8)state[k]=v}
 if(slug==='farmacias'&&Number.isInteger(saved.branchA)&&Number.isInteger(saved.branchB)&&saved.branchA>=2&&saved.branchB>=4&&saved.branchA+saved.branchB===18){state.branchA=saved.branchA;state.branchB=saved.branchB}
}}catch{state=structuredClone(defaults[slug])}
  let active=0;
  const el=(tag,value,cls)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=String(value);if(cls)n.className=cls;return n};
  const money=n=>'$'+Number(n).toFixed(2);
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{status.textContent='La prueba funciona, pero este navegador no pudo guardar los cambios.'}};
  const msg=t=>{status.textContent=t};
  const note=t=>stage.append(el('p',t,'demo-help'));
  function field(label,value,min,max,step=1){
    const wrap=el('label',undefined,'demo-field'),title=el('span',label),input=el('input');
    input.type='number';input.min=String(min);input.max=String(max);input.step=String(step);input.value=String(value);wrap.append(title,input);return [wrap,input];
  }
  function select(label,choices){
    const wrap=el('label',undefined,'demo-field'),input=el('select');wrap.append(el('span',label));
    choices.forEach(([value,name])=>{const option=el('option',name);option.value=String(value);input.append(option)});wrap.append(input);return [wrap,input];
  }
  function button(label,fn,secondary=false){
    const b=el('button',label,'demo-action'+(secondary?' secondary':''));b.type='button';b.addEventListener('click',fn);return b;
  }
  function box(title,big,detail){const b=el('div',undefined,'demo-result');b.append(el('span',title),el('strong',big),el('small',detail));stage.append(b);return b}
  function update(b,title,big,detail){b.replaceChildren(el('span',title),el('strong',big),el('small',detail))}
  function number(input,min,max){if(!input.value.trim())return null;const n=Number(input.value);return Number.isFinite(n)&&Number.isInteger(n)&&n>=min&&n<=max?n:null}
  function line(title,detail,control){const row=el('div',undefined,'demo-list-row'),copy=el('div');copy.append(el('strong',title),el('small',detail));row.append(copy);if(control)row.append(control);return row}
  function list(){const node=el('div',undefined,'demo-list');stage.append(node);return node}
  function two(...fields){const g=el('div',undefined,'demo-fields');g.append(...fields);stage.append(g)}
  function refresh(){status.textContent='';render()}
  function render(){
    [...nav.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));
    stage.replaceChildren();
    const header=el('div',undefined,'demo-stage-header');header.append(el('h2',cfg.tabs[active]),el('span','DATOS FICTICIOS','demo-tag'));stage.append(header);
    window.businessExperience.show(slug,active,cfg.tabs[active]);
    if(slug==='gimnasios')gym();if(slug==='licorerias')liquor();if(slug==='hoteles')hotel();if(slug==='farmacias')pharmacy();if(slug==='consultorios')services();
  }
  cfg.tabs.forEach((t,i)=>{const b=el('button',(i+1)+'. '+t,'demo-option');b.type='button';b.addEventListener('click',()=>{active=i;refresh()});nav.append(b)});
  document.querySelector('#demo-reset').addEventListener('click',()=>{state=structuredClone(defaults[slug]);active=0;save();refresh();msg('Prueba restablecida con datos ficticios.')});
  function gym(){
    if(active===0){
      const people=[['Socio 014',4,1],['Socio 027',3,3],['Socio 031',5,2]],rows=list();
      people.forEach(([name,before,now])=>{
        const falling=now<=Math.floor(before/2),done=state.contacted.includes(name);
        rows.append(line(name,`Antes: ${before} visitas/semana · Ahora: ${now}. ${falling?'Conviene revisar la baja de frecuencia.':'Frecuencia estable en este ejemplo.'}`,falling?button(done?'Seguimiento anotado':'Preparar seguimiento',()=>{if(!done){state.contacted.push(name);save();render();msg('Seguimiento preparado en esta prueba; no se envió ningún mensaje.')}},true):null));
      });
      note('Regla visible: se marca cuando la frecuencia actual es como máximo la mitad de la anterior. Es una señal para conversar, no una predicción de cancelación.');return
    }
    if(active===1){
      const [w,n]=field('Personas que cambiarías de horario',state.peakMoved,0,8);
      stage.append(w);
      const b=box('Turno de 6:00 PM (capacidad: 16)',String(19-state.peakMoved)+' personas',`Turno de 4:00 PM: ${8+state.peakMoved}/16. Sobrecupo: ${Math.max(0,19-state.peakMoved-16)}.`);
      const draw=()=>{const v=number(n,0,8);update(b,'Turno de 6:00 PM (capacidad: 16)',v===null?'Cantidad inválida':String(19-v)+' personas',v===null?'Introduce de 0 a 8 personas.':`Turno de 4:00 PM: ${8+v}/16. Sobrecupo: ${Math.max(0,19-v-16)}.`)};
      n.addEventListener('input',draw);
      stage.append(button('Aplicar escenario',()=>{const v=number(n,0,8);if(v===null){msg('Introduce de 0 a 8 personas.');return}state.peakMoved=v;save();draw();msg('Escenario guardado solo en este navegador.')}));note('Mueve personas entre dos turnos de muestra; no cambia reservas ni envía invitaciones.');return
    }
    const [a,attendance]=field('Asistentes por clase',8,0,30),[p,price]=field('Ingreso por asistente ($)',5,1,50),[c,cost]=field('Costo total de la clase ($)',37,0,500);two(a,p);stage.append(c);
    const b=box('Resultado por clase','', '');
    const draw=()=>{const n=number(attendance,0,30),v=number(price,1,50),fixed=number(cost,0,500);if(n===null||v===null||fixed===null){update(b,'Resultado','Datos inválidos','Usa cantidades enteras dentro de los rangos.');return}update(b,'Ingreso − costo',money(n*v-fixed),`${n*v<fixed?'Esta clase no cubre el costo indicado.':n*v===fixed?'Esta clase cubre exactamente el costo indicado.':'Esta clase deja un excedente sobre el costo indicado.'} Ingreso: ${money(n*v)} · Costo: ${money(fixed)} · Punto de equilibrio: ${Math.ceil(fixed/v)} asistentes.`)};
    [attendance,price,cost].forEach(x=>x.addEventListener('input',draw));draw();note('Calculadora de escenario; no es una estimación de demanda real.');
  }
  function liquor(){
    if(active===0){
      const [a,sales]=field('Ventas del último fin de semana (cajas)',7,0,50),[b,days]=field('Fines de semana hasta recibir pedido',2,1,6);two(a,b);
      const result=box('Stock de muestra: '+state.weekendStock+' cajas','','');
      const draw=()=>{const v=number(sales,0,50),n=number(days,1,6);update(result,'Stock de muestra: '+state.weekendStock+' cajas',v===null||n===null?'Datos inválidos':Math.max(0,v*n-state.weekendStock)+' cajas por pedir',v===null||n===null?'Revisa los rangos.':`Escenario: ${v} cajas por fin de semana × ${n} fines de semana − ${state.weekendStock} en stock. No predice ventas.`)};
      [sales,days].forEach(x=>x.addEventListener('input',draw));draw();note('Cambia ventas y tiempo de reposición. El pedido es una simulación, no una compra automática.');return
    }
    if(active===1){
      const [a,price]=field('Precio habitual del paquete ($)',30,1,100),[b,discount]=field('Descuento propuesto (%)',10,0,60),[c,cost]=field('Costo conjunto ($)',19,0,100);two(a,b);stage.append(c);
      const result=box('Margen después del descuento','','');
      const draw=()=>{const p=number(price,1,100),d=number(discount,0,60),co=number(cost,0,100);if(p===null||d===null||co===null){update(result,'Margen','Datos inválidos','Introduce valores enteros válidos.');return}const final=p*(1-d/100);update(result,'Precio final − costo',money(final-co),`Cobro: ${money(final)} · Costo: ${money(co)}. ${final<co?'La oferta perdería dinero por paquete.':'Margen bruto positivo por paquete.'}`)};
      [price,discount,cost].forEach(x=>x.addEventListener('input',draw));draw();note('No contempla impuestos ni otros gastos; sirve para descartar descuentos que no cubren el costo.');return
    }
    const products=[['Presentación A',15,1],['Presentación B',24,8],['Presentación C',10,12]],rows=list();
    products.forEach(([name,units,sold],i)=>rows.append(line(name,`En stock: ${units} · Salidas en 30 días: ${sold}. ${sold===0?'Sin movimiento reciente.':sold<3?'Rotación baja.':'Tiene movimiento.'}`,sold<3?button(state.reviewed.includes(i)?'En revisión':'Revisar compra',()=>{if(!state.reviewed.includes(i)){state.reviewed.push(i);save();render();msg('Producto marcado para revisar antes del próximo pedido.')}},true):null)));
    note('La señal usa las salidas de muestra. Una promoción requiere revisar margen y normas del negocio; no se activa desde aquí.');
  }
  function hotel(){
    if(active===0){
      const rooms=[['Habitación 04','Entrada 1:00 PM',1],['Habitación 12','Entrada 4:00 PM',4],['Habitación 08','Sin llegada prevista',99]],rows=list();
      rooms.sort((a,b)=>Number(state.ready.includes(a[0]))-Number(state.ready.includes(b[0]))||a[2]-b[2]).forEach(([name,arrival])=>{const done=state.ready.includes(name);rows.append(line(name,`${arrival} · ${done?'Preparada':'Pendiente de preparación'}`,button(done?'Lista':'Marcar lista',()=>{if(!done){state.ready.push(name);save();render();msg(name+' marcada como preparada en la prueba.')}},true)))});
      note('Orden sugerido por hora de llegada; se muestran identificadores ficticios, sin datos de huéspedes.');return
    }
    if(active===1){
      const [a,price]=field('Tarifa por noche ($)',45,10,200),[b,sold]=field('Habitaciones que supones vender (máximo 6)',4,0,6);two(a,b);
      const result=box('Ingreso bajo tus supuestos','','');
      const draw=()=>{const p=number(price,10,200),n=number(sold,0,6);update(result,'Tarifa × habitaciones vendidas',p===null||n===null?'Datos inválidos':money(p*n),p===null||n===null?'Revisa los rangos.':`Ocupación supuesta: ${n}/6. Comparación: 4 habitaciones × $45 = $180. Cambiar la tarifa no garantiza vender más.`)};
      [price,sold].forEach(x=>x.addEventListener('input',draw));draw();note('Prueba escenarios: la cantidad vendida la decides tú; la demo no la predice.');return
    }
    const [a,packagePrice]=field('Precio total del paquete ($)',60,10,200),[b,breakfast]=field('Costo adicional de desayuno ($)',8,0,50),[c,other]=field('Otros costos adicionales ($)',5,0,80);two(a,b);stage.append(c);
    const result=box('Ingreso restante sobre la tarifa base','','');
    const draw=()=>{const p=number(packagePrice,10,200),br=number(breakfast,0,50),ex=number(other,0,80);if(p===null||br===null||ex===null){update(result,'Paquete','Datos inválidos','Revisa los rangos.');return}update(result,'Precio − tarifa base ($35) − costos añadidos',money(p-35-br-ex),`${p-35-br-ex<0?'El paquete no cubre la tarifa base y los extras.':'El paquete cubre la tarifa base y los extras indicados.'} Tarifa base de ejemplo: $35 · Desayuno: ${money(br)} · Otros: ${money(ex)}. No es utilidad neta.`)};
    [packagePrice,breakfast,other].forEach(x=>x.addEventListener('input',draw));draw();note('Ayuda a evaluar una noche libre sin suponer que un paquete siempre venderá.');
  }
  function pharmacy(){
    if(active===0){
      const lots=[['Protector solar · lote A',9,12],['Producto de higiene · lote B',18,3],['Venda elástica · lote C',6,120]],rows=list();
      lots.sort((a,b)=>a[2]-b[2]).forEach(([name,units,days])=>{const marked=state.reviewed.includes(name);rows.append(line(name,`${units} unidades · ${days} días hasta la fecha registrada. ${marked?'Revisión anotada.':days<=30?'Prioridad de revisión.':'Sin alerta de 30 días.'}`,days<=30?button(marked?'Revisado':'Anotar revisión',()=>{if(!marked){state.reviewed.push(name);save();render();msg('Revisión anotada en esta prueba.')}},true):null))});
      note('Ordena por proximidad de fecha. No decide venta, descarte ni uso de productos.');return
    }
    if(active===1){
      const [a,daily]=field('Salidas promedio por día (unidades)',2,0,20),[b,lead]=field('Días que tarda el proveedor',5,1,30),[c,buffer]=field('Reserva de seguridad (unidades)',3,0,30);two(a,b);stage.append(c);
      const result=box('Existencias actuales: 8 unidades','','');
      const draw=()=>{const d=number(daily,0,20),l=number(lead,1,30),s=number(buffer,0,30);update(result,'Necesidad durante espera + reserva − 8',d===null||l===null||s===null?'Datos inválidos':Math.max(0,d*l+s-8)+' unidades a considerar',d===null||l===null||s===null?'Revisa los rangos.':`${d} × ${l} + ${s} − 8. Revisa vencimientos y pedidos existentes antes de comprar.`)};
      [daily,lead,buffer].forEach(x=>x.addEventListener('input',draw));draw();note('Sugerencia matemática con datos ficticios; no emite una orden de compra.');return
    }
    const [a,qty]=field('Unidades para trasladar de B a A',4,1,30);stage.append(a);
    const result=box('Sede A: '+state.branchA+' · Sede B: '+state.branchB,'','');
    const draw=()=>{const n=number(qty,1,30);update(result,'Si se trasladan unidades',n===null||n>state.branchB?'Cantidad inválida':`A: ${state.branchA+n} · B: ${state.branchB-n}`,n===null?'Introduce una cantidad válida.':`Ahora: A ${state.branchA} · B ${state.branchB}. `+(n>state.branchB?'No hay suficientes unidades en B.':state.branchB-n<4?'B quedaría por debajo de su reserva de 4.':'Ambas sedes mantienen la reserva mínima de B.'))};
    qty.addEventListener('input',draw);draw();
    stage.append(button('Simular traslado',()=>{const n=number(qty,1,30);if(n===null||n>state.branchB||state.branchB-n<4){msg('Traslado no permitido: B debe conservar al menos 4 unidades.');return}state.branchA+=n;state.branchB-=n;save();render();msg(n+' unidades trasladadas en la prueba.')}));note('Solo tiene sentido si el negocio opera más de una sede. No hay movimiento real de productos.');
  }
  function services(){
    if(active===0){
      const rows=list();rows.append(line('Cancelación: 2:00 PM a 2:30 PM',state.slotTaken?'Turno ocupado en esta prueba.':'Hay un hueco de 30 minutos. Las opciones usan códigos de muestra.',state.slotTaken?null:button('Asignar a S-002',()=>{state.slotTaken=true;save();render();msg('Turno asignado en la demo. No se avisó a ninguna persona.')})));
      rows.append(line('S-002 · Servicio de 20 min',state.slotTaken?'Asignado en esta prueba; deja 10 minutos libres.':'Puede ocupar el hueco; deja 10 minutos libres.'));
      rows.append(line('S-003 · Servicio de 45 min','No cabe en el hueco sin desplazar el siguiente turno.'));
      note('En un sistema real se verificarían disponibilidad y autorización antes de contactar.');return
    }
    if(active===1){
      const [a,short]=field('Turnos breves (20 min)',4,0,15),[b,long]=field('Turnos extensos (45 min)',3,0,15);two(a,b);
      const result=box('Jornada disponible: 240 minutos','','');
      const draw=()=>{const s=number(short,0,15),l=number(long,0,15);if(s===null||l===null){update(result,'Agenda','Datos inválidos','Revisa los rangos.');return}const used=s*20+l*45;update(result,'Tiempo solicitado',used+' min',used>240?`Excede la jornada por ${used-240} min. Reduce turnos o amplía recursos.`:`Quedan ${240-used} min libres. Incluye solo el tiempo de servicio, sin pausas.`)};
      [short,long].forEach(x=>x.addEventListener('input',draw));draw();note('Permite ver cuándo el número de citas cabe en el tiempo real disponible.');return
    }
    const [a,first]=field('Demora del primer servicio (minutos)',15,0,120),[b,recovery]=field('Minutos recuperados antes del último turno',5,0,60);two(a,b);
    const result=box('Siguiente turno: 11:00 AM','','');
    const draw=()=>{const delay=number(first,0,120),saved=number(recovery,0,60);if(delay===null||saved===null){update(result,'Retraso','Datos inválidos','Revisa los rangos.');return}const remaining=Math.max(0,delay-saved);const mins=11*60+remaining,hr=Math.floor(mins/60);update(result,'Inicio estimado',`${hr>12?hr-12:hr}:${String(mins%60).padStart(2,'0')} ${hr>=12?'PM':'AM'}`,`Retraso inicial: ${delay} min − recuperación: ${saved} min = ${remaining} min pendientes.`)};
    [first,recovery].forEach(x=>x.addEventListener('input',draw));draw();note('Es una proyección simple, no avisa ni cambia citas reales.');
  }
  render();
}

