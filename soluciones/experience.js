'use strict';
window.businessExperience={show(slug,index,title,mode,report,summary){
const instructions={
 gimnasios:['Pulsa “Preparar seguimiento” para señalar a quién conviene contactar por su baja de asistencia.','Cambia cuántas personas moverías de horario y observa el sobrecupo antes de aplicar el escenario.','Cambia asistentes, ingreso y costo. Comprueba cuántas personas necesitas para cubrir la clase.'],
 licorerias:['Cambia las ventas y la espera del proveedor para estimar cuántas cajas considerar en el pedido.','Prueba un descuento y revisa si el precio todavía cubre el costo del paquete.','Marca un producto de baja rotación para revisar su próxima compra.'],
 hoteles:['Marca una habitación como lista y observa cómo se reorganizan las pendientes por llegada.','Cambia la tarifa y las habitaciones vendidas para comparar el ingreso del escenario.','Ajusta el paquete y sus extras para comprobar qué queda sobre la tarifa base.'],
 farmacias:['Anota la revisión de un lote cercano a su fecha registrada.','Ajusta salidas, espera y reserva para calcular las unidades que convendría evaluar.','Elige unidades y simula un traslado. La sede B debe conservar su reserva mínima.'],
 consultorios:['Asigna el servicio que cabe en el hueco disponible y comprueba el tiempo libre restante.','Cambia la cantidad de turnos breves y extensos para comprobar si caben en la jornada.','Ajusta la demora y el tiempo recuperado para ver cuándo comenzaría el siguiente turno.']
};
const standard=mode==='agenda'?['Elige servicio, fecha y hora; reserva un turno de muestra. Después puedes gestionarlo en Atención.','Crea primero un turno en Agenda. Luego pulsa Iniciar y Finalizar para recorrer la atención.',report?'Revisa cómo cambian los totales al avanzar o cancelar los turnos de esta prueba.':'Elige un servicio y consulta su precio de muestra.']:['Busca un producto y usa +1 o −1 para comprobar cómo cambia su disponibilidad.','Elige un producto y una cantidad, y registra el movimiento para ver el descuento de existencias.',summary?'Registra movimientos en la segunda opción y revisa aquí el resumen del turno.':'Cambia el producto y la cantidad para consultar el total y comprobar si hay existencias.'];
document.getElementById('demo-guide').textContent='Pruébalo: '+(instructions[slug]||standard)[index];
const name=document.getElementById('sector-name').textContent;
document.getElementById('demo-contact').href='https://wa.me/584241381555?text='+encodeURIComponent(`Hola Rusbelt, probé la demo de ${name}, en la función «${title}». Quiero algo así para mi negocio. Me gustaría conversar sobre cómo adaptarlo.`);
}};
