
    (()=>{const root=document.getElementById('rusbelt-reference-preview'),cards=root.querySelector('#ref-cards'),pageLabel=root.querySelector('#ref-page');
      const groups={
        servicios:[['Gimnasios','Mejora el seguimiento y las clases.'],['Barberías','Organiza tu agenda.'],['Salones','Organiza citas y recursos.'],['Talleres','Trabajos y piezas']],
        comercios:[['Licorerías','Ofertas y rotación'],['Teléfonos','Modelos y accesorios'],['Ropa y calzado','Tallas y existencias'],['Farmacias','Vencimientos y compras'],['Minimarkets','Productos y ventas'],['Gasolineras','Disponibilidad y turnos']],
        comida:[['Restaurantes','Menú y pedidos'],['Hoteles','Habitaciones y tarifas']],
        salud:[['Consultorios','Huecos y retrasos'],['Hospitales','Turnos y servicios']]
      };
      const routes={"Gimnasios":"gimnasios/","Barberías":"barberias/","Salones":"salones/","Talleres":"repuestos-talleres/","Licorerías":"licorerias/","Teléfonos":"telefonos/","Ropa y calzado":"ropa-calzado/","Farmacias":"farmacias/","Minimarkets":"minimarkets/","Gasolineras":"gasolineras/","Restaurantes":"restaurantes/","Hoteles":"hoteles/","Consultorios":"consultorios/","Hospitales":"hospitales/"};let kind='servicios',page=0;
try{const saved=JSON.parse(sessionStorage.getItem('rusbelt-business-menu'));if(saved&&groups[saved.kind]&&Number.isInteger(saved.page)&&saved.page>=0&&saved.page<Math.ceil(groups[saved.kind].length/3)){kind=saved.kind;page=saved.page}}catch{}
const base=root.dataset.base;
function paint(){
try{sessionStorage.setItem('rusbelt-business-menu',JSON.stringify({kind,page}))}catch{}
        const items=groups[kind],max=Math.ceil(items.length/3);if(page>=max)page=0;
        const showing=items.slice(page*3,page*3+3);cards.replaceChildren();
        showing.forEach(([name,detail],i)=>{const card=document.createElement('a');card.href=base+'soluciones/'+routes[name];card.className='sector '+['large','medium','small'][i];const pill=document.createElement('span');pill.className='pill';pill.textContent=i===0?'Explorar':'Demo';const title=document.createElement('h3');title.textContent=name;const desc=document.createElement('p');desc.textContent=detail;card.append(pill,title,desc);{const open=document.createElement('span');open.className='open';open.textContent='Probar soluciones ↗';card.append(open)}cards.append(card)});
        if(showing.length<3){const more=document.createElement('a');more.href='https://wa.me/584241381555?text='+encodeURIComponent('Hola Rusbelt, vi las ideas de tu portafolio. Mi negocio es diferente y quisiera conversar sobre lo que necesito.');more.target='_blank';more.rel='noopener noreferrer';more.className='sector small';const title=document.createElement('h3');title.textContent='¿Otro tipo de negocio?';more.append(title);cards.append(more)}
        pageLabel.textContent=max>1?(page+1)+' de '+max+' ›':'1 de 1';
        pageLabel.disabled=max===1;
        [...root.querySelectorAll('.category')].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===kind)));
      }
      root.querySelectorAll('.category').forEach(button=>button.addEventListener('click',()=>{kind=button.dataset.kind;page=0;paint()}));
      pageLabel.addEventListener('click',()=>{const max=Math.ceil(groups[kind].length/3);page=(page+1)%max;paint()});
      root.querySelector("#business-home").addEventListener("click",()=>{window.location.assign(base+"index.html")});
      paint();
    })();
  