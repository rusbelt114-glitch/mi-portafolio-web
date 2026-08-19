# 🔒 PROTOCOLO MAESTRO DE CIBERSEGURIDAD PARA PROYECTOS WEB

> **INSTRUCCIÓN PARA LA IA:** Este documento contiene reglas de seguridad OBLIGATORIAS e INQUEBRANTABLES.
> Todo código que generes para este proyecto DEBE cumplir con CADA UNO de estos bloques ANTES de ser entregado al cliente.
> Si alguna regla no se puede cumplir por limitaciones técnicas, DEBES informarlo explícitamente y proponer una alternativa.
> Estas reglas NO son opcionales. NO se pueden omitir "para hacerlo más rápido". NO se pueden saltar "porque es un proyecto pequeño".
> Un solo incumplimiento compromete toda la infraestructura.

---

## ═══════════════════════════════════════════════════
## BLOQUE A: ECOSISTEMA GOOGLE (Drive / Sheets / Apps Script)
## ═══════════════════════════════════════════════════

### A1. REGLA DE DESVINCULACIÓN DE CÓDIGO (CRÍTICA)
- **PROHIBIDO** programar el código de Apps Script directamente dentro de la Hoja de Cálculo del cliente (Script Vinculado / Bound Script).
- **OBLIGATORIO** crear siempre un archivo de Google Apps Script **suelto** (Standalone Script) en el Google Drive personal del desarrollador.
- El código suelto se conecta al Excel del cliente usando exclusivamente `SpreadsheetApp.openById("ID_DE_LA_HOJA")`.
- **NUNCA** usar `SpreadsheetApp.getActiveSpreadsheet()` en producción, ya que esto solo funciona si el código vive dentro del Excel y expone la propiedad intelectual al cliente.
- **Razón:** Si el código vive dentro del Excel y el cliente tiene permiso de "Editor", puede entrar a Extensiones > Apps Script y ver, copiar o borrar todo el código fuente del desarrollador.

### A2. PROTECCIÓN DE PROPIEDAD INTELECTUAL
- El Excel que se comparte con el cliente para ingresar datos **NUNCA** debe tener el código del sistema dentro de sus extensiones.
- Al compartir el Excel con el cliente, verificar que al hacer clic en `Extensiones > Apps Script`, el editor esté **completamente vacío**.
- Si el cliente necesita permiso de "Editor" en el Excel (para modificar celdas), el código debe estar obligatoriamente en un archivo suelto.
- Si el cliente solo necesita ver datos (no editar), compartir el Excel como **"Lector"** o **"Comentador"**, nunca como "Editor".

### A3. PERMISOS DE COMPARTIR EN GOOGLE DRIVE
- **PROHIBIDO** configurar el Excel del cliente como "Cualquier persona con el enlace puede editar".
- Solo enviar **invitaciones directas por correo electrónico** con el permiso mínimo necesario:
  - **Lector:** Si el cliente solo consulta datos.
  - **Editor:** Si el cliente necesita escribir/modificar celdas (pero el código debe estar desvinculado).
- **NUNCA** compartir el archivo del Script (el código) con el cliente. Ese archivo es exclusivo del desarrollador.

### A4. CONFIGURACIÓN DE DESPLIEGUE DE WEB APP
- Al desplegar un Google Apps Script como Aplicación Web, la configuración DEBE ser siempre:
  - **Ejecutar como:** `Yo` (el correo del desarrollador).
  - **Quién tiene acceso:** `Cualquiera` (para que la web pública pueda consultarlo).
- **NUNCA** configurar "Ejecutar como: Usuario que accede", ya que esto permitiría que visitantes anónimos ejecuten código con sus propios permisos y podrían modificar datos.

### A5. PERMISOS DE ESCRITURA EN GOOGLE SHEETS
- Si la aplicación web es de **solo consulta** (el visitante busca información pero no modifica nada):
  - El código de Apps Script solo debe usar `getValues()` (lectura).
  - **PROHIBIDO** incluir funciones como `setValues()`, `appendRow()`, `deleteRow()` en el código público sin autenticación.
- Si la aplicación necesita **escritura** (formularios, registros):
  - Implementar validación del lado del servidor (dentro del Apps Script).
  - Verificar el origen de la petición.
  - Limitar qué datos se pueden escribir y en qué rango exacto.

### A6. PROTECCIÓN DEL ID DE LA HOJA DE CÁLCULO
- El ID de la Hoja de Cálculo (la cadena alfanumérica larga en la URL del Excel) **NUNCA** debe aparecer en el código HTML o JavaScript del frontend.
- El ID solo debe existir dentro del código del Apps Script (que está blindado en los servidores de Google).
- **Razón:** Aunque el ID no es una contraseña (Google bloquea acceso sin permisos), exponerlo innecesariamente es una mala práctica que revela información de la infraestructura.

---

## ═══════════════════════════════════════════════════
## BLOQUE B: ECOSISTEMA FRONTEND (Netlify / Vercel / GitHub)
## ═══════════════════════════════════════════════════

### B1. BÓVEDA DE VARIABLES DE ENTORNO (ENVIRONMENT VARIABLES)
- **PROHIBIDO** escribir contraseñas, API Keys, tokens, IDs de bases de datos, o cualquier credencial directamente en archivos `.html`, `.js`, `.css`, `.env` que se suban al repositorio público.
- Todo dato sensible se guarda en la **bóveda de variables de entorno** del servidor:
  - **Netlify:** `Site configuration > Environment variables`
  - **Vercel:** `Settings > Environment Variables`
- El servidor inyecta la clave de forma invisible durante la compilación. El código público nunca la contiene.
- Si el proyecto es un HTML estático simple (sin framework), las variables de entorno NO están disponibles en el navegador. En ese caso, usar Google Apps Script como intermediario para ocultar credenciales.

### B2. RACIONAMIENTO DE MINUTOS DE COMPILACIÓN
- Las plataformas gratuitas tienen **límites mensuales de procesamiento**:
  - Netlify: ~300 minutos/mes (plan gratuito).
  - Vercel: ~6000 minutos/mes (plan gratuito, pero con límites de ancho de banda).
- **PROHIBIDO** hacer micro-despliegues por cada cambio estético menor (cambiar un color, mover un pixel).
- Todas las pruebas se hacen abriendo el archivo **localmente** en el navegador (Google Chrome).
- Solo se sube a Netlify/Vercel la **versión final y testeada** del código.

### B3. PROTECCIÓN CONTRA ATAQUES DDoS (SATURACIÓN)
- Activar las alertas de facturación y límite de ancho de banda en el panel de control de Netlify/Vercel.
- Configurar el sistema para que se **apague automáticamente** antes de generar un cobro por exceso de tráfico.
- En Netlify: Revisar `Site configuration > Usage & Billing > Spending notifications`.
- Si un bot recarga la página 10,000 veces en un minuto, el ancho de banda gratuito se consume y pueden generar cobros automáticos.

### B4. ARCHIVOS SENSIBLES EN REPOSITORIOS
- Si se usa GitHub/GitLab para el despliegue, crear un archivo `.gitignore` que excluya:
  - Archivos `.env` (variables de entorno locales).
  - Carpetas `node_modules/`.
  - Archivos de configuración local con credenciales.
  - Archivos de respaldo del editor (`.bak`, `.swp`).
- **NUNCA** hacer commit de un archivo que contenga contraseñas. Si ya se hizo, la contraseña debe considerarse **comprometida** y debe cambiarse inmediatamente (borrar el commit no es suficiente, el historial de Git conserva todo).

---

## ═══════════════════════════════════════════════════
## BLOQUE C: BASES DE DATOS RELACIONALES (Supabase / Firebase)
## ═══════════════════════════════════════════════════

### C1. OCULTAMIENTO DE LLAVE MAESTRA (SERVICE ROLE KEY)
- Supabase entrega dos llaves:
  - **`anon_key`** (llave pública): Segura para usar en el frontend. Tiene permisos limitados.
  - **`service_role_key`** (llave maestra): Tiene acceso TOTAL a la base de datos.
- La `service_role_key` **JAMÁS** debe copiarse en el código frontend (HTML, JS, React, etc.).
- Si un bot encuentra la `service_role_key` en el código público, **secuestra la base de datos en milisegundos**: puede leer, escribir, borrar y destruir toda la información.
- La `service_role_key` solo se usa en el backend (funciones serverless, API propias).

### C2. ROW LEVEL SECURITY (RLS) — SIEMPRE ACTIVO
- **NUNCA** presionar el botón "Disable RLS" (Desactivar seguridad) en Supabase.
- Cada tabla debe tener políticas de seguridad a nivel de fila (RLS Policies).
- Ejemplo para un sistema de consulta pública (como un rastreador de pedidos):
  ```sql
  -- Permitir que cualquiera pueda LEER datos
  CREATE POLICY "Lectura pública" ON pedidos
    FOR SELECT USING (true);

  -- PROHIBIR que usuarios anónimos escriban, modifiquen o borren datos
  -- (No crear política INSERT/UPDATE/DELETE para anon = bloqueado por defecto)
  ```
- Si se necesita escritura (formularios, registros), crear políticas específicas que validen la identidad del usuario autenticado.

### C3. VALIDACIÓN DE DATOS EN EL SERVIDOR
- **NUNCA** confiar únicamente en la validación del frontend (JavaScript del navegador).
- Un atacante puede desactivar JavaScript o enviar peticiones directas a la API.
- Toda validación crítica (formato de datos, permisos, longitud de campos) debe replicarse en el backend o en las políticas RLS de la base de datos.

---

## ═══════════════════════════════════════════════════
## BLOQUE D: CÓDIGO SEGURO (HTML / CSS / JavaScript)
## ═══════════════════════════════════════════════════

### D1. PROTECCIÓN CONTRA XSS (CROSS-SITE SCRIPTING)
- **PROHIBIDO** insertar datos provenientes del usuario o de una base de datos directamente en `innerHTML` sin sanitizar.
- Antes de renderizar cualquier dato externo en el HTML, pasar el texto por una función de sanitización que escape caracteres peligrosos:
  ```javascript
  function sanitizarHTML(texto) {
      const div = document.createElement('div');
      div.textContent = texto;
      return div.innerHTML;
  }
  ```
- Esta función convierte `<script>alert('hack')</script>` en texto plano inofensivo: `&lt;script&gt;alert('hack')&lt;/script&gt;`.
- **Aplicar en:** nombres de clientes, datos de formularios, cualquier texto que venga de fuera del código.

### D2. RATE LIMITING EN EL FRONTEND (ANTI-SPAM)
- Implementar un limitador de velocidad (throttle/debounce) en todas las funciones que hagan peticiones al servidor (fetch, XMLHttpRequest).
- Ejemplo: Bloquear búsquedas repetidas durante 3 segundos después de cada consulta.
  ```javascript
  let ultimaBusqueda = 0;
  const COOLDOWN_MS = 3000; // 3 segundos

  function buscar() {
      const ahora = Date.now();
      if (ahora - ultimaBusqueda < COOLDOWN_MS) {
          // Mostrar mensaje "Espera unos segundos..."
          return;
      }
      ultimaBusqueda = ahora;
      // ... ejecutar la búsqueda real
  }
  ```
- **Razón:** Un bot automatizado podría hacer miles de peticiones por minuto, consumiendo el cupo gratuito de Google Apps Script (o de cualquier API) y dejando el sistema fuera de servicio.

### D3. POLÍTICA DE SEGURIDAD DE CONTENIDO (CSP)
- Incluir en el `<head>` del HTML una etiqueta meta de Content Security Policy que restrinja qué recursos puede cargar la página:
  ```html
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self';
                 script-src 'self' 'unsafe-inline' https://script.google.com;
                 style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                 font-src 'self' https://fonts.gstatic.com;
                 connect-src 'self' https://script.google.com https://script.googleusercontent.com;
                 img-src 'self' data:;">
  ```
- Ajustar los dominios permitidos según las tecnologías usadas en cada proyecto.
- **Razón:** Si un atacante logra inyectar un script, el CSP impide que ese script se comunique con servidores externos para robar datos.

### D4. VALIDACIÓN DE INPUTS DEL USUARIO
- Validar la **longitud máxima** de todos los campos de entrada (previene ataques de desbordamiento).
  ```html
  <input type="text" maxlength="50">
  ```
- Validar el **formato** de los datos esperados (solo letras para nombres, solo números para cédulas, etc.).
- **NUNCA** permitir que el usuario ingrese HTML o JavaScript en campos de texto que luego se renderizan en la página.

### D5. MANEJO SEGURO DE ERRORES
- **PROHIBIDO** mostrar mensajes de error técnicos al usuario final (stack traces, nombres de funciones internas, IDs de base de datos).
- Los errores internos se capturan con `try/catch` y se muestra un mensaje genérico al usuario:
  ```javascript
  catch (err) {
      // ❌ MAL: errorBox.textContent = err.message;
      // ✅ BIEN:
      errorBox.textContent = "Error de conexión. Intenta nuevamente.";
      console.error("Error interno:", err); // Solo visible en la consola del desarrollador
  }
  ```

### D6. PROTECCIÓN DEL CÓDIGO CONTRA MANIPULACIÓN
- Cuando usted publica una página en Netlify/Vercel, el código HTML/CSS/JS que llega al navegador del cliente es de **solo lectura visual**. Nadie puede "sobreescribir" su página web desde su navegador.
- Lo que SÍ pueden hacer los atacantes es:
  - Leer el código fuente con F12 (inevitable, es la naturaleza del frontend).
  - Enviar peticiones maliciosas a sus APIs si no están protegidas.
  - Inyectar datos basura en su base de datos si los permisos de escritura están abiertos.
- **El verdadero blindaje está en el backend y en la base de datos, no en el frontend.**

---

## ═══════════════════════════════════════════════════
## BLOQUE E: BLINDAJE LEGAL Y OPERATIVO
## ═══════════════════════════════════════════════════

### E1. POLÍTICA DE PRIVACIDAD OBLIGATORIA
- Todo proyecto web que maneje datos personales (nombres, cédulas, teléfonos, correos) **DEBE** incluir una sección visible de "Política de Privacidad" en el pie de página (footer).
- Texto mínimo obligatorio (adaptar según el proyecto):
  ```
  Política de Privacidad: Este sistema recopila únicamente los datos necesarios
  para prestar el servicio de [DESCRIPCIÓN DEL SERVICIO]. Los datos son propiedad
  y responsabilidad de [NOMBRE DE LA EMPRESA CLIENTE]. El desarrollador del sistema
  actúa exclusivamente como proveedor de infraestructura tecnológica y no es
  responsable del tratamiento, almacenamiento o uso de los datos personales
  recopilados por la empresa operadora. Al utilizar este servicio, usted acepta
  estos términos.
  ```

### E2. DESLINDE DE RESPONSABILIDAD DEL DESARROLLADOR
- En el contrato o acuerdo con el cliente (aunque sea verbal), dejar claro:
  - El desarrollador **construye la carretera tecnológica** (el software).
  - El cliente **es el dueño de los datos** y el responsable legal de su uso.
  - Si se filtra un dato porque el cliente compartió contraseñas o dejó el Excel público, la responsabilidad es del cliente, no del desarrollador.
- Si es posible, incluir un texto de "Términos y Condiciones" genérico en la web.

### E3. RESPALDOS Y CONTINUIDAD
- Mantener **siempre** una copia local del código fuente de cada proyecto entregado.
- Documentar las URLs de despliegue, IDs de hojas de cálculo, y configuraciones de cada proyecto.
- Si el cliente deja de pagar, el Kill-Switch desactiva el servicio, pero el código fuente permanece seguro en su Google Drive personal.

---

## ═══════════════════════════════════════════════════
## BLOQUE F: CHECKLIST DE AUDITORÍA PRE-ENTREGA
## ═══════════════════════════════════════════════════

> **INSTRUCCIÓN:** Antes de entregar la URL final al cliente, la IA (o el desarrollador) DEBE verificar y marcar CADA uno de estos puntos. Si alguno falla, el proyecto NO está listo para producción.

### Seguridad de Código
- [ ] ¿Todas las inserciones de `innerHTML` están sanitizadas contra XSS?
- [ ] ¿Hay rate limiting en todas las funciones que hacen peticiones al servidor?
- [ ] ¿El `<head>` incluye una meta tag de Content-Security-Policy (CSP)?
- [ ] ¿Los inputs tienen validación de longitud máxima (`maxlength`)?
- [ ] ¿Los errores se manejan con `try/catch` y muestran mensajes genéricos al usuario?
- [ ] ¿No hay `console.log` con datos sensibles en producción?

### Seguridad de Infraestructura
- [ ] ¿No hay contraseñas, API Keys ni tokens escritos directamente en archivos HTML/JS/CSS?
- [ ] ¿Las credenciales están guardadas en variables de entorno del servidor (Netlify/Vercel)?
- [ ] ¿El archivo `.gitignore` excluye archivos sensibles?
- [ ] ¿Las alertas de facturación están activadas en la plataforma de hosting?

### Seguridad de Google (si aplica)
- [ ] ¿El código de Apps Script está en un archivo SUELTO (Standalone), NO dentro del Excel del cliente?
- [ ] ¿Al abrir el Excel del cliente > Extensiones > Apps Script, el editor está VACÍO?
- [ ] ¿La Web App se ejecuta como "Yo" (el desarrollador) y no como "Usuario que accede"?
- [ ] ¿El Excel del cliente tiene el permiso MÍNIMO necesario (Lector si solo consulta, Editor solo si necesita escribir)?
- [ ] ¿El ID de la Hoja de Cálculo NO aparece en ningún archivo del frontend?

### Seguridad de Base de Datos (si aplica)
- [ ] ¿El RLS (Row Level Security) está ACTIVO en todas las tablas de Supabase?
- [ ] ¿La `service_role_key` NO está en ningún archivo del frontend?
- [ ] ¿Las políticas RLS permiten solo las operaciones necesarias (ej: solo SELECT para consulta pública)?

### Blindaje Legal
- [ ] ¿La web tiene una sección visible de "Política de Privacidad" en el footer?
- [ ] ¿El texto legal deslinda al desarrollador de la responsabilidad sobre los datos del cliente?

---

## ═══════════════════════════════════════════════════
## BLOQUE G: DETECCIÓN DE PROYECTOS AVANZADOS (CONDICIONAL)
## ═══════════════════════════════════════════════════

> **INSTRUCCIÓN PARA LA IA:** Este bloque NO es obligatorio por defecto.
> Sin embargo, ANTES de iniciar la programación de cualquier proyecto, la IA **DEBE hacer las 3 preguntas de detección** listadas abajo.
> Según las respuestas del desarrollador, se ACTIVAN o DESACTIVAN las reglas adicionales de cada sección.
> Si el desarrollador responde "NO" a una pregunta, esa sección se ignora y no se aplica.
> Si el desarrollador responde "SÍ", la IA DEBE cumplir las reglas de esa sección con la misma rigurosidad que los Bloques A–F.

### ⚠️ PREGUNTAS DE DETECCIÓN OBLIGATORIAS (hacer ANTES de programar)

La IA debe formular estas 3 preguntas al desarrollador al inicio de cada proyecto nuevo:

**Pregunta 1:** "¿Este proyecto requiere que los usuarios creen cuentas o inicien sesión (Login/Registro)?"
- Si la respuesta es **SÍ** → Activar sección **G1: Seguridad de Autenticación**.
- Si la respuesta es **NO** → Ignorar sección G1.

**Pregunta 2:** "¿Este proyecto procesará pagos en línea o manejará datos de tarjetas de crédito/débito?"
- Si la respuesta es **SÍ** → Activar sección **G2: Seguridad de Pagos en Línea**.
- Si la respuesta es **NO** → Ignorar sección G2.

**Pregunta 3:** "¿Este proyecto se alojará en un servidor propio (VPS, Amazon AWS, DigitalOcean) en lugar de plataformas gratuitas como Netlify o Vercel?"
- Si la respuesta es **SÍ** → Activar sección **G3: Seguridad de Servidor Propio**.
- Si la respuesta es **NO** → Ignorar sección G3 (Netlify/Vercel ya manejan HTTPS y certificados automáticamente).

---

### G1. SEGURIDAD DE AUTENTICACIÓN (Login / Registro de Usuarios)
> **Se activa SOLO si el proyecto requiere inicio de sesión.**

- **PROHIBIDO** almacenar contraseñas en texto plano en la base de datos. Toda contraseña debe estar encriptada con algoritmos como `bcrypt` o `argon2`.
- **PROHIBIDO** crear sistemas de login desde cero si no se tiene experiencia avanzada. Usar servicios de autenticación ya probados:
  - **Supabase Auth** (gratuito, integrado con Supabase).
  - **Firebase Auth** (gratuito, integrado con Firebase).
  - **Auth0** (plan gratuito disponible).
  - **Clerk** (plan gratuito disponible).
- Implementar **tokens de sesión seguros** (JWT o cookies HttpOnly). Los tokens NUNCA se guardan en `localStorage` sin protección.
- Implementar **expiración de sesión**: el usuario debe ser desconectado automáticamente después de un período de inactividad (ej: 24 horas).
- Si hay formulario de registro, implementar:
  - Validación de fortaleza de contraseña (mínimo 8 caracteres, al menos 1 número y 1 mayúscula).
  - Protección contra ataques de fuerza bruta: bloquear la cuenta temporalmente después de 5 intentos fallidos.
  - Verificación de correo electrónico antes de activar la cuenta.
- Si hay opción de "Olvidé mi contraseña":
  - Enviar enlace de recuperación por correo con expiración (máximo 1 hora).
  - **NUNCA** enviar la contraseña actual por correo (eso significaría que está almacenada en texto plano).

### G2. SEGURIDAD DE PAGOS EN LÍNEA
> **Se activa SOLO si el proyecto procesa pagos o maneja datos financieros.**

- **PROHIBIDO** construir un procesador de pagos propio. Usar siempre pasarelas de pago certificadas:
  - **Stripe** (internacional).
  - **MercadoPago** (Latinoamérica).
  - **PayPal** (internacional).
- **PROHIBIDO** almacenar números de tarjeta de crédito/débito en su propia base de datos. Las pasarelas de pago manejan esto de forma segura y certificada (PCI-DSS).
- El formulario de pago debe cargarse directamente desde el proveedor (Stripe Elements, MercadoPago Checkout). Usted nunca toca los datos de la tarjeta.
- Toda página que procese pagos **DEBE** usar HTTPS obligatoriamente (sin excepciones).
- Implementar verificación de transacciones en el backend:
  - Confirmar el pago con el servidor de la pasarela antes de entregar el producto/servicio.
  - **NUNCA** confiar en una confirmación de pago que venga del frontend (el usuario podría falsificarla).
- Llevar un registro (log) de todas las transacciones con fecha, monto, estado y referencia.
- Incluir en la web los textos legales adicionales requeridos para comercio electrónico:
  - Política de reembolsos y devoluciones.
  - Términos y condiciones de compra.
  - Datos fiscales de la empresa que vende (según la legislación local).

### G3. SEGURIDAD DE SERVIDOR PROPIO (VPS / AWS / DigitalOcean)
> **Se activa SOLO si el proyecto NO usa plataformas como Netlify/Vercel que ya manejan esto automáticamente.**

- **OBLIGATORIO** configurar un certificado SSL (HTTPS) en el servidor. Usar **Let's Encrypt** (gratuito) o el certificado que provea el hosting.
- **PROHIBIDO** dejar el servidor accesible por HTTP (sin la "s"). Todo el tráfico debe redirigirse automáticamente a HTTPS.
- Configurar un **firewall** que bloquee todos los puertos excepto los necesarios (generalmente: 80, 443, 22).
- Cambiar el **puerto SSH predeterminado** (22) a uno personalizado para reducir ataques automatizados.
- **PROHIBIDO** usar la contraseña `root` o `admin` como acceso al servidor. Configurar autenticación por **clave SSH** y desactivar el acceso por contraseña.
- Mantener el sistema operativo del servidor **actualizado** con los últimos parches de seguridad.
- Configurar **respaldos automáticos** de la base de datos y del código (mínimo 1 vez por día).
- Si el servidor usa **Node.js**, **Python** o similar:
  - Nunca ejecutar la aplicación como usuario `root`.
  - Usar un gestor de procesos como `PM2` (Node.js) para mantener la aplicación activa.
  - Configurar variables de entorno en el servidor, nunca en el código fuente.

---

## ═══════════════════════════════════════════════════
## RESUMEN DE ACTIVACIÓN POR TIPO DE PROYECTO
## ═══════════════════════════════════════════════════

| Tipo de Proyecto | Bloques Obligatorios | Bloques Condicionales |
|---|---|---|
| Web de consulta pública (ej: rastreador de pedidos) | A, B, D, E, F | — |
| Web con base de datos Supabase/Firebase | A, B, C, D, E, F | — |
| Web con Login/Registro de usuarios | A, B, C, D, E, F | **G1** |
| Tienda online / Pagos en línea | A, B, C, D, E, F | **G1 + G2** |
| Proyecto en servidor propio (VPS/AWS) | A, B, C, D, E, F | **G3** (+ G1/G2 si aplican) |

---

**FIN DEL PROTOCOLO MAESTRO DE CIBERSEGURIDAD**
**Versión:** 1.1
**Última actualización:** Julio 2026
**Autor:** Protocolo generado como estándar operativo de desarrollo web seguro.
