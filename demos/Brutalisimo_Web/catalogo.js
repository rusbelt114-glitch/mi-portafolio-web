/**
 * PROTOCOLO DE SEGURIDAD APLICADO:
 * - B1: La URL de Apps Script es pública, pero no expone contraseñas ni el ID de la hoja real.
 * - D1: Protección XSS mediante sanitizarHTML().
 * - D2: Rate Limiting (debounce) para evitar spam de peticiones.
 * - D5: Manejo genérico de errores.
 */

// 🔒 REEMPLAZA ESTO CON LA URL DE TU WEB APP DE GOOGLE APPS SCRIPT
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx7LyM07JV3Lf81hfqlqC7iTW9QZ0qaaeClRDhhsoZORPop8Bc1JcT_e1cJ7KRD0a_4/exec';

// Variables de estado
let productos = [];
let ultimaPeticion = 0;
const COOLDOWN_MS = 5000; // 5 segundos entre peticiones (Regla D2)
let categoriaActual = 'TODO';
let tasaBCV = null; // Variable global para la tasa del dólar

// Función para obtener la tasa oficial del BCV
async function obtenerTasaBCV() {
    try {
        const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (respuesta.ok) {
            const data = await respuesta.json();
            tasaBCV = data.promedio;
            console.log("Tasa BCV cargada:", tasaBCV);
            // Si el catálogo ya cargó, lo volvemos a renderizar para que muestre los precios en Bs.
            if (productos.length > 0) renderizarCatalogo();
            actualizarUI(); // Actualiza el carrito si está abierto
        }
    } catch (error) {
        console.error("Error al obtener tasa BCV:", error);
    }
}

// Función para prevenir inyección de código (Regla D1 Avanzada)
function sanitizarHTML(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    // textContent escapa <, > y &, pero agregamos protección para comillas
    return div.innerHTML.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// Función principal para cargar el catálogo
async function cargarCatalogo() {
    const ahora = Date.now();
    
    // Regla D2: Rate Limiting (Anti-Spam)
    if (ahora - ultimaPeticion < COOLDOWN_MS) {
        console.warn("Petición bloqueada por rate limiting.");
        return;
    }
    ultimaPeticion = ahora;

    const grid = document.getElementById('catalogo-grid');
    // Mostrar un indicador visual elegante mientras cargan los productos
    grid.innerHTML = `
        <div class="loading-container">
            <div class="bag-loader">🛍️</div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill"></div>
            </div>
            <p class="loading-text">Cargando colección...</p>
        </div>
    `;

    try {
        const respuesta = await fetch(APPS_SCRIPT_URL);
        
        if (!respuesta.ok) {
            throw new Error('Error en la red');
        }

        const json = await respuesta.json();
        
        if (json.status !== 'success') {
            throw new Error('Error desde el servidor');
        }

        productos = json.data;
        renderizarCategorias();
        renderizarCatalogo();
        
    } catch (error) {
        // Regla D5: Mostrar mensaje genérico al usuario
        console.error("Error técnico:", error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--rosa); font-weight:800;">No se pudo cargar el catálogo. Intenta nuevamente más tarde.</p>';
    }
}

function renderizarCatalogo() {
    const grid = document.getElementById('catalogo-grid');
    grid.innerHTML = '';

    // Filtrar los productos
    const productosFiltrados = productos.filter(prod => {
        if (categoriaActual === 'TODO') return true;
        const cat = prod.estado ? prod.estado.trim().toUpperCase() : 'OTROS';
        return cat === categoriaActual;
    });

    if (productosFiltrados.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No hay productos en esta categoría.</p>';
        return;
    }

    productosFiltrados.forEach((prod, index) => {
        const nombreSeguro = sanitizarHTML(prod.nombre);
        let precioSeguro = sanitizarHTML(prod.precio);
        let numeroOriginal = 0;
        
        if (precioSeguro && !precioSeguro.includes('$')) {
            const numero = parseFloat(precioSeguro);
            if (!isNaN(numero)) {
                numeroOriginal = numero;
                precioSeguro = '$' + numero.toFixed(2);
            }
        } else if (precioSeguro) {
            numeroOriginal = parseFloat(precioSeguro.replace(/[^0-9.-]+/g,""));
        }
        
        // Extraer enlace directo si el usuario pegó código HTML por error
        let urlFoto = prod.fotoUrl ? prod.fotoUrl.trim() : '';
        const matchHTML = urlFoto.match(/src=["'](.*?)["']/);
        if (matchHTML && matchHTML[1]) {
            urlFoto = matchHTML[1];
        }
        
        const fotoSeguro = sanitizarHTML(urlFoto) || './chaqueta.png';
        const categoriaSeguro = sanitizarHTML(prod.estado).toUpperCase() || 'OTROS';
        
        let mostrarPrecioBs = '';
        if (tasaBCV && !isNaN(numeroOriginal) && numeroOriginal > 0) {
            const precioBs = numeroOriginal * tasaBCV;
            const precioBsFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precioBs);
            mostrarPrecioBs = `<br><span style="font-size:0.85rem; color:#666; font-weight:600;">Bs. ${precioBsFormat}</span>`;
        }

        // Como la columna D ahora es Categoría, ya no usamos la lógica de "AGOTADO"
        const tarjetaHTML = `
            <div class="producto-card">
                <img src="${fotoSeguro}" alt="${nombreSeguro}" class="producto-img">
                <h3 class="producto-titulo">${nombreSeguro}</h3>
                <p class="producto-precio">${precioSeguro} ${mostrarPrecioBs}</p>
                <button class="btn-comprar" onclick="agregarAlCarrito('${nombreSeguro}', '${precioSeguro}', '${fotoSeguro}', this)">Añadir al Carrito</button>
            </div>
        `;
        
        grid.innerHTML += tarjetaHTML;
    });
}

// ==========================================
// LÓGICA DE CATEGORÍAS
// ==========================================
function renderizarCategorias() {
    const categoriasSet = new Set();
    productos.forEach(p => {
        let cat = p.estado ? p.estado.trim().toUpperCase() : '';
        if (cat !== '') categoriasSet.add(cat);
    });
    
    const categorias = ['TODO', ...Array.from(categoriasSet)];
    const dropdown = document.getElementById('dropdown-categorias-nav');
    
    if (dropdown) {
        dropdown.innerHTML = '';
        categorias.forEach(cat => {
            const claseActiva = (cat === categoriaActual) ? 'active-cat' : '';
            dropdown.innerHTML += `<li><a class="${claseActiva}" onclick="filtrarCategoria('${cat}')">${cat}</a></li>`;
        });
    }
}

function filtrarCategoria(categoria) {
    categoriaActual = categoria;
    renderizarCategorias(); // Actualizar clase active
    renderizarCatalogo();
    
    // Cerrar dropdown si está abierto
    const megaMenu = document.getElementById('mega-menu-categorias');
    const overlay = document.getElementById('mega-overlay');
    if (megaMenu) megaMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    
    // Cerrar el menú hamburguesa móvil si está abierto
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
    
    // Hacer scroll suave hacia el catálogo
    const seccionCatalogo = document.getElementById('catalogo');
    if (seccionCatalogo) {
        setTimeout(() => {
            seccionCatalogo.scrollIntoView({ behavior: 'smooth' });
        }, 150); // Pequeño retraso para que la animación del menú cierre primero
    }
}

function toggleCategoriasNav(event) {
    if (event) event.preventDefault();
    const megaMenu = document.getElementById('mega-menu-categorias');
    const overlay = document.getElementById('mega-overlay');
    
    if (megaMenu) megaMenu.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// Iniciar carga al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    obtenerTasaBCV(); // Cargar la tasa BCV al inicio
    
    // Solo si el usuario configuró la URL
    if (APPS_SCRIPT_URL !== 'PEGAR_AQUI_LA_URL_DE_LA_WEB_APP') {
        cargarCatalogo();
    } else {
        // MODO DEMO: Mostrar productos falsos para la presentación
        productos = [
            { nombre: "Chaqueta Urbana Black", precio: "$89.90", fotoUrl: "./chaqueta.png", estado: "Chaquetas" },
            { nombre: "Camisa Formal Essential", precio: "$45.00", fotoUrl: "./camisa.png", estado: "Camisas" },
            { nombre: "Pantalón Cargo Premium", precio: "$65.00", fotoUrl: "./pantalon.png", estado: "Pantalones" },
            { nombre: "Sneakers Edición Dark", precio: "$120.00", fotoUrl: "./sneakers.png", estado: "Zapatos" }
        ];
        renderizarCategorias();
        renderizarCatalogo();
    }
});

// ==========================================
// LÓGICA DEL CARRITO DE COMPRAS
// ==========================================

let carrito = [];

function abrirCarrito() {
    document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
}

function cerrarCarrito() {
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
}

function agregarAlCarrito(nombre, precioTexto, foto, btn) {
    // Limpiar el texto del precio para convertirlo a número real (quitar $, letras, etc.)
    const precioNumerico = parseFloat(precioTexto.replace(/[^0-9.-]+/g,""));
    
    // Verificar si el producto ya está en el carrito
    const existe = carrito.find(item => item.nombre === nombre);
    
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precioNumerico,
            precioTexto: precioTexto,
            foto: foto,
            cantidad: 1
        });
    }
    
    actualizarUI();
    
    // Animación visual del botón (sin abrir el carrito)
    if (btn) {
        const textoOriginal = btn.innerText;
        btn.innerText = "¡Añadido! ✔️";
        btn.style.backgroundColor = "var(--rosa)";
        
        setTimeout(() => {
            btn.innerText = textoOriginal;
            btn.style.backgroundColor = "";
        }, 1500);
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarUI();
}

function actualizarUI() {
    const contenedor = document.getElementById('cart-items');
    const badge = document.getElementById('cart-badge');
    const totalPrecioEl = document.getElementById('cart-total-price');
    
    // Actualizar numero de items
    let totalItems = 0;
    let costoTotal = 0;
    
    contenedor.innerHTML = '';
    
    if (carrito.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #999; margin-top: 50px;">Tu carrito está vacío.</p>';
        badge.innerText = '0';
        totalPrecioEl.innerText = '$0.00';
        return;
    }
    
    carrito.forEach((item, index) => {
        totalItems += item.cantidad;
        costoTotal += (item.precio * item.cantidad);
        
        contenedor.innerHTML += `
            <div class="cart-item">
                <img src="${item.foto}" alt="${item.nombre}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nombre}</div>
                    <div class="cart-item-price">${item.precioTexto} x ${item.cantidad}</div>
                </div>
                <button class="cart-item-remove" onclick="eliminarDelCarrito(${index})">🗑️</button>
            </div>
        `;
    });
    
    let totalTexto = '$' + costoTotal.toFixed(2);
    if (tasaBCV && costoTotal > 0) {
        const costoBs = costoTotal * tasaBCV;
        const costoBsFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(costoBs);
        totalTexto += ` / Bs. ${costoBsFormat}`;
    }
    
    badge.innerText = totalItems;
    totalPrecioEl.innerText = totalTexto;
}

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de pedir.");
        return;
    }
    
    // 🔒 REEMPLAZA ESTE NÚMERO POR EL TUYO (código de país + número, sin espacios ni símbolos)
    const numeroWhatsApp = "584168473038"; 
    
    let mensaje = "Hola Brutalisimo Shein, quiero realizar el siguiente pedido:%0A%0A";
    let costoTotal = 0;
    
    carrito.forEach(item => {
        mensaje += `- ${item.cantidad}x ${item.nombre} (${item.precioTexto})%0A`;
        costoTotal += (item.precio * item.cantidad);
    });
    
    let mensajeTotal = `*TOTAL A PAGAR: $${costoTotal.toFixed(2)}`;
    if (tasaBCV && costoTotal > 0) {
        const costoBs = costoTotal * tasaBCV;
        const costoBsFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(costoBs);
        mensajeTotal += ` (Bs. ${costoBsFormat})*`;
    } else {
        mensajeTotal += `*`;
    }
    
    mensaje += `%0A${mensajeTotal}%0A%0A`;
    mensaje += "Quedo atento a los métodos de pago. ¡Gracias!";
    
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    window.open(url, '_blank');
}
