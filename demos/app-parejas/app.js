// Configuración de Supabase
const supabaseUrl = 'https://jzauszdeamfqtiqixsif.supabase.co';
const supabaseKey = 'sb_publishable_6jq4mlhG8R5W-Wq9soQBmQ_TVYDR86j';
let supabaseClient = null;

// Registro del Service Worker (Modo Offline)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('[SW] Registrado - App funciona offline ✅'))
            .catch(err => console.warn('[SW] Error al registrar:', err));
    });
}

try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        window.supabaseClient = supabaseClient;
        console.log("Supabase inicializado correctamente.");
    } else {
        console.error("Librería de Supabase no cargada. Revisa tu conexión a internet.");
    }
} catch (e) {
    console.error("Error al inicializar Supabase:", e);
}
// Función Global para Borrar Elementos
window.deleteItem = async function(table, id) {
    if(!confirm("¿Estás seguro de querer borrar este recuerdo para siempre? 🗑️")) return;
    if (window.supabaseClient) {
        try {
            await window.supabaseClient.from(table).delete().eq('id', id);
            // Recargar la página para reflejar los cambios
            location.reload();
        } catch(e) {
            console.error("Error borrando", e);
        }
    } else {
        alert("Cargando conexión, intenta de nuevo en unos segundos.");
    }
};

// Lógica de interfaz y navegación
document.addEventListener('DOMContentLoaded', () => {

    // --- 0. IDENTIDAD (GOLDOTE / GOLDOTA) ---
    const identityModal = document.getElementById('identity-modal');
    let currentUser = localStorage.getItem('parejas_app_user');
    
    // Actualizar el header con el nombre del usuario
    const headerUsername = document.getElementById('header-username');
    if (headerUsername && currentUser) {
        headerUsername.textContent = currentUser === 'Goldota' ? 'La Negrita 🐈‍⬛' : 'Trajesito 🐈';
    }

    // --- BIENVENIDA ROMÁNTICA para Goldota (solo la primera vez) ---
    const welcomeModal = document.getElementById('welcome-modal');
    const btnCloseWelcome = document.getElementById('btn-close-welcome');
    const hasSeenWelcome = localStorage.getItem('welcome_seen_goldota');

    if (currentUser === 'Goldota' && !hasSeenWelcome && welcomeModal) {
        // Mostrar bienvenida después de un pequeño delay para que se cargue todo
        setTimeout(() => {
            welcomeModal.classList.add('active');
        }, 600);
    }
    if (btnCloseWelcome) {
        btnCloseWelcome.addEventListener('click', () => {
            welcomeModal.classList.remove('active');
            localStorage.setItem('welcome_seen_goldota', 'true');
        });
    }

    if (!currentUser && identityModal) {
        identityModal.classList.add('active');
        document.getElementById('btn-goldote').addEventListener('click', () => {
            currentUser = 'Goldote';
            localStorage.setItem('parejas_app_user', currentUser);
            identityModal.classList.remove('active');
            location.reload();
        });
        document.getElementById('btn-goldota').addEventListener('click', () => {
            currentUser = 'Goldota';
            localStorage.setItem('parejas_app_user', currentUser);
            identityModal.classList.remove('active');
            location.reload();
        });
    }
    
    // --- 1. NAVEGACIÓN ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const mainView = document.getElementById('main-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.add('active');
        });
    });

    // --- 2. INTERFAZ DEL DIARIO (MODAL) ---
    const btnAddDiary = document.getElementById('fab-diary');
    const diaryModal = document.getElementById('diary-modal');
    const btnCancelDiary = document.getElementById('cancel-diary');
    const btnSaveDiary = document.getElementById('save-diary');
    const diaryText = document.getElementById('diary-text');
    const diaryFeed = document.querySelector('.diary-feed');

    // Comprobar que los elementos existen
    if (btnAddDiary) {
        btnAddDiary.addEventListener('click', () => { 
            const activeNav = document.querySelector('.nav-item.active').getAttribute('data-target');
            if (activeNav === 'view-diary') {
                if (diaryModal) {
                    diaryModal.classList.add('active'); 
                    diaryText.value = ''; 
                    diaryText.focus();
                }
            } else if (activeNav === 'view-cravings') {
                const cravingsModal = document.getElementById('cravings-modal');
                if (cravingsModal) {
                    cravingsModal.classList.add('active');
                    document.getElementById('craving-title').value = '';
                    document.getElementById('craving-title').focus();
                }
            } else {
                alert("Esta sección aún está en construcción.");
            }
        });
    }
    
    if (btnCancelDiary) {
        btnCancelDiary.addEventListener('click', () => diaryModal.classList.remove('active'));
    }

    // --- 3. LÓGICA DE SUPABASE (LEER Y GUARDAR) ---
    async function loadDiary() {
        if (!diaryFeed) return;
        if (!supabaseClient) {
            diaryFeed.innerHTML = '<p style="text-align:center; color:gray;">Modo sin conexión. Esperando Supabase...</p>';
            return;
        }

        diaryFeed.innerHTML = '<p style="text-align:center; color:gray; margin-top:20px;">Cargando nuestros recuerdos...</p>';
        
        try {
            const { data, error } = await supabaseClient
                .from('diary')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            diaryFeed.innerHTML = ''; 
            if (data.length === 0) {
                diaryFeed.innerHTML = '<p style="text-align:center; color:gray; margin-top:20px;">Aún no hay recuerdos. ¡Escribe el primero!</p>';
                return;
            }

            data.forEach(item => {
                const dateObj = new Date(item.created_at);
                const dateStr = dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
                const authorName = item.author || 'Nosotros';
                
                // Avatar personalizado según quién escribe
                const avatarSeed = authorName === 'Goldota' ? 'Aneka' : 'Felix';
                
                const card = document.createElement('div');
                card.className = 'diary-card glass-panel';
                card.innerHTML = `
                    <div class="card-header">
                        <div class="user-meta">
                            <img src="https://api.dicebear.com/9.x/micah/svg?seed=${avatarSeed}&backgroundColor=b6e3f4" class="mini-avatar">
                            <div><span class="name">${authorName}</span><span class="date">${dateStr}</span></div>
                        </div>
                        <button onclick="window.deleteItem('diary', ${item.id})" style="background:none; border:none; color:rgba(255,255,255,0.3); cursor:pointer; font-size:1.2rem; transition:0.3s;" onmouseover="this.style.color='var(--accent-pink)'" onmouseout="this.style.color='rgba(255,255,255,0.3)'"><i class="ph-fill ph-trash"></i></button>
                    </div>
                    <div class="card-body"><p>${item.content}</p></div>
                `;
                diaryFeed.appendChild(card);
            });
        } catch (error) {
            console.error('Error cargando diario:', error);
            diaryFeed.innerHTML = '<p style="text-align:center; color:red;">Error de conexión. Intenta recargar la página.</p>';
        }
    }

    if (btnSaveDiary) {
        btnSaveDiary.addEventListener('click', async () => {
            const text = diaryText.value.trim();
            if (!text) return;
            if (!supabaseClient) {
                btnSaveDiary.textContent = "Error: Sin Red";
                setTimeout(() => btnSaveDiary.textContent = 'Guardar', 3000);
                return;
            }
            
            btnSaveDiary.textContent = 'Guardando...';
            
            try {
                // Se envía el autor junto con el texto
                const { error } = await supabaseClient.from('diary').insert([{ content: text, author: currentUser || 'Goldote' }]);
                if (error) {
                    console.error("Error de Supabase:", error);
                    btnSaveDiary.textContent = "Error de Permisos";
                    setTimeout(() => btnSaveDiary.textContent = 'Guardar', 3000);
                    return;
                }
                diaryModal.classList.remove('active');
                loadDiary(); 
            } catch (error) {
                console.error(error);
                btnSaveDiary.textContent = "Fallo de conexión";
                setTimeout(() => btnSaveDiary.textContent = 'Guardar', 3000);
            }
        });
    }

    // --- 4. CAJA DE ANTOJOS ---
    const cravingsModal = document.getElementById('cravings-modal');
    const btnCancelCraving = document.getElementById('cancel-craving');
    const btnSaveCraving = document.getElementById('save-craving');
    const cravingTitle = document.getElementById('craving-title');
    const cravingTag = document.getElementById('craving-tag');
    const cravingsList = document.querySelector('.cravings-list');
    const btnRandomCraving = document.getElementById('btn-random-craving');
    const randomResult = document.getElementById('random-result');
    const randomResultText = document.getElementById('random-result-text');

    let allCravings = [];

    async function loadCravings() {
        if (!cravingsList) return;
        if (!supabaseClient) return;

        cravingsList.innerHTML = '<p style="text-align:center; color:gray;">Cargando antojos...</p>';
        try {
            const { data, error } = await supabaseClient.from('cravings').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            
            allCravings = data;
            cravingsList.innerHTML = ''; 
            
            if (data.length === 0) {
                cravingsList.innerHTML = '<p style="text-align:center; color:gray;">La caja está vacía. ¡Agreguen su primer antojo!</p>';
                return;
            }

            data.forEach(item => {
                const iconMap = { 'Comida': '🍔', 'Postre': '🍦', 'Salida': '🍿', 'Regalo': '🎁' };
                const icon = iconMap[item.tag] || '✨';

                const card = document.createElement('div');
                card.className = 'craving-card';
                card.innerHTML = `
                    <div class="craving-icon">${icon}</div>
                    <div class="craving-info">
                        <div class="craving-title">${item.title}</div>
                        <div class="craving-tag">${item.tag}</div>
                    </div>
                    <button onclick="window.deleteItem('cravings', ${item.id})" style="background:none; border:none; color:rgba(255,255,255,0.3); cursor:pointer; font-size:1.2rem; transition:0.3s;" onmouseover="this.style.color='var(--accent-pink)'" onmouseout="this.style.color='rgba(255,255,255,0.3)'"><i class="ph-fill ph-trash"></i></button>
                `;
                cravingsList.appendChild(card);
            });
        } catch (error) {
            cravingsList.innerHTML = '<p style="text-align:center; color:red;">Error al cargar antojos</p>';
        }
    }

    if (btnSaveCraving) {
        btnSaveCraving.addEventListener('click', async () => {
            const title = cravingTitle.value.trim();
            const tag = cravingTag.value;
            if (!title) return;
            if (!supabaseClient) return;
            
            btnSaveCraving.textContent = 'Guardando...';
            try {
                const { error } = await supabaseClient.from('cravings').insert([{ title, tag }]);
                if (error) throw error;
                cravingsModal.classList.remove('active');
                loadCravings(); 
            } catch (error) {
                alert('Error al guardar antojo');
            }
            btnSaveCraving.textContent = 'Guardar';
        });
    }

    if (btnCancelCraving) {
        btnCancelCraving.addEventListener('click', () => cravingsModal.classList.remove('active'));
    }

    if (btnRandomCraving) {
        btnRandomCraving.addEventListener('click', async () => {
            if (allCravings.length === 0) {
                alert("Primero deben agregar opciones a la caja usando el botón +");
                return;
            }

            // TELEPATÍA DE ANTOJOS (FASE 4)
            if (supabaseClient) {
                try {
                    const partnerId = currentUser === 'Goldote' ? 'Goldota' : 'Goldote';
                    const { data } = await supabaseClient.from('user_status').select('last_indecision_use').eq('username', partnerId).single();
                    if (data && data.last_indecision_use) {
                        const diffMins = (new Date().getTime() - new Date(data.last_indecision_use).getTime()) / (1000 * 60);
                        if (diffMins < 10) {
                            alert("¡TELEPATÍA! 🌟 Ambos tienen hambre y están buscando qué comer al mismo tiempo.");
                        }
                    }
                    await supabaseClient.from('user_status').upsert({ username: currentUser || 'Goldote', last_indecision_use: new Date().toISOString() });
                } catch (e) { console.error("Error telepatía", e); }
            }
            
            btnRandomCraving.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Mezclando...';
            randomResult.style.display = 'none';
            
            setTimeout(() => {
                const randomItem = allCravings[Math.floor(Math.random() * allCravings.length)];
                randomResultText.textContent = randomItem.title;
                randomResult.style.display = 'block';
                btnRandomCraving.innerHTML = '<i class="ph-fill ph-magic-wand"></i> ¡Botón de Indecisión!';
            }, 1500);
        });
    }

    // --- 5. MOTOR DE TIEMPO (CÁPSULAS Y PAUSA) ---
    const capsuleModal = document.getElementById('capsule-modal');
    const btnCancelCapsule = document.getElementById('cancel-capsule');
    const btnSaveCapsule = document.getElementById('save-capsule');
    const capsuleText = document.getElementById('capsule-text');
    const capsuleDate = document.getElementById('capsule-date');
    
    const pauseModal = document.getElementById('pause-modal');
    const btnCancelPause = document.getElementById('cancel-pause');
    const btnSavePause = document.getElementById('save-pause');
    const pauseText = document.getElementById('pause-text');

    const btnNewCapsule = document.getElementById('btn-new-capsule');
    const btnNewPause = document.getElementById('btn-new-pause');
    const timeFeed = document.querySelector('.time-feed');

    let allTimeCapsules = [];
    let timerInterval = null;

    if (btnNewCapsule) btnNewCapsule.addEventListener('click', () => { capsuleModal.classList.add('active'); capsuleText.value = ''; capsuleDate.value = ''; });
    if (btnCancelCapsule) btnCancelCapsule.addEventListener('click', () => capsuleModal.classList.remove('active'));
    
    if (btnNewPause) btnNewPause.addEventListener('click', () => { pauseModal.classList.add('active'); pauseText.value = ''; });
    if (btnCancelPause) btnCancelPause.addEventListener('click', () => pauseModal.classList.remove('active'));

    function formatTimeRemaining(ms) {
        if (ms <= 0) return "¡Abierta!";
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        return `${minutes}m ${seconds}s`;
    }

    function renderTimeCapsules() {
        if (!timeFeed) return;
        timeFeed.innerHTML = '';
        if (allTimeCapsules.length === 0) {
            timeFeed.innerHTML = '<p style="text-align:center; color:gray;">No hay mensajes en el tiempo.</p>';
            return;
        }

        const now = new Date().getTime();

        allTimeCapsules.forEach(item => {
            const unlockTime = new Date(item.unlock_time).getTime();
            const isLocked = unlockTime > now;
            const authorName = item.author || 'Nosotros';
            const avatarSeed = authorName === 'Goldota' ? 'Aneka' : 'Felix';
            const typeLabel = item.type === 'pause' ? '🛑 Buzón de Pausa' : '⏳ Cápsula al Futuro';

            const card = document.createElement('div');
            card.className = `time-card glass-panel ${isLocked ? 'locked' : ''}`;
            
            if (isLocked) {
                card.innerHTML = `
                    <div class="locked-overlay">
                        <i class="ph-fill ph-lock-key lock-icon"></i>
                        <button onclick="window.deleteItem('time_capsules', ${item.id})" style="background:none; border:none; color:rgba(255,255,255,0.3); cursor:pointer; font-size:1.2rem; transition:0.3s;" onmouseover="this.style.color='var(--accent-pink)'" onmouseout="this.style.color='rgba(255,255,255,0.3)'"><i class="ph-fill ph-trash"></i></button>
                        <div class="countdown-timer" data-unlock="${unlockTime}">Calculando...</div>
                        <div class="locked-type">${typeLabel}</div>
                    </div>
                `;
            } else {
                const dateStr = new Date(item.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
                card.innerHTML = `
                    <div class="card-header">
                        <div class="user-meta">
                            <img src="https://api.dicebear.com/9.x/micah/svg?seed=${avatarSeed}&backgroundColor=b6e3f4" class="mini-avatar">
                            <div><span class="name">${authorName}</span><span class="date">${typeLabel} • ${dateStr}</span></div>
                        </div>
                        <button onclick="window.deleteItem('time_capsules', ${item.id})" style="background:none; border:none; color:rgba(255,255,255,0.3); cursor:pointer; font-size:1.2rem; transition:0.3s;" onmouseover="this.style.color='var(--accent-pink)'" onmouseout="this.style.color='rgba(255,255,255,0.3)'"><i class="ph-fill ph-trash"></i></button>
                    </div>
                    <div class="card-body"><p>${item.content}</p></div>
                `;
            }
            timeFeed.appendChild(card);
        });
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const timers = document.querySelectorAll('.countdown-timer');
            let needsReload = false;
            
            timers.forEach(timer => {
                const unlock = parseInt(timer.getAttribute('data-unlock'));
                const remaining = unlock - new Date().getTime();
                
                if (remaining <= 0) {
                    needsReload = true; // El timer llegó a cero!
                } else {
                    timer.textContent = formatTimeRemaining(remaining);
                }
            });
            
            if (needsReload) {
                renderTimeCapsules(); // Recargar para abrir el mensaje
            }
        }, 1000);
    }

    async function loadTimeCapsules() {
        if (!timeFeed || !supabaseClient) return;
        timeFeed.innerHTML = '<p style="text-align:center; color:gray;">Cargando tiempo...</p>';
        try {
            const { data, error } = await supabaseClient.from('time_capsules').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            allTimeCapsules = data;
            renderTimeCapsules();
            startTimer();
        } catch (e) {
            timeFeed.innerHTML = `<p style="text-align:center; color:red;">Error cargando cápsulas: ${e.message || JSON.stringify(e)}</p>`;
        }
    }

    if (btnSaveCapsule) {
        btnSaveCapsule.addEventListener('click', async () => {
            const text = capsuleText.value.trim();
            const uDate = new Date(capsuleDate.value);
            
            if (!text || isNaN(uDate.getTime())) {
                alert("Completa el mensaje y elige una fecha válida.");
                return;
            }
            if (uDate.getTime() <= new Date().getTime()) {
                alert("La fecha debe ser en el futuro.");
                return;
            }
            if (!supabaseClient) return;
            
            btnSaveCapsule.textContent = 'Sellando...';
            try {
                const { error } = await supabaseClient.from('time_capsules').insert([{ 
                    content: text, 
                    type: 'future', 
                    unlock_time: uDate.toISOString(),
                    author: currentUser || 'Goldote'
                }]);
                if (error) error;
                capsuleModal.classList.remove('active');
                loadTimeCapsules();
            } catch (e) {
                alert("Error de permisos en Supabase (RLS).");
            }
            btnSaveCapsule.textContent = 'Sellar Cápsula';
        });
    }

    if (btnSavePause) {
        btnSavePause.addEventListener('click', async () => {
            const text = pauseText.value.trim();
            if (!text) return;
            if (!supabaseClient) return;
            
            // 2 horas exactas en el futuro
            const unlockTime = new Date();
            unlockTime.setHours(unlockTime.getHours() + 2);

            btnSavePause.textContent = 'Bloqueando...';
            try {
                const { error } = await supabaseClient.from('time_capsules').insert([{ 
                    content: text, 
                    type: 'pause', 
                    unlock_time: unlockTime.toISOString(),
                    author: currentUser || 'Goldote'
                }]);
                if (error) throw error;
                pauseModal.classList.remove('active');
                loadTimeCapsules();
            } catch (e) {
                alert("Error de permisos en Supabase (RLS).");
            }
            btnSavePause.textContent = 'Bloquear Mensaje';
        });
    }

    // Iniciar carga de datos
    loadDiary();
    loadCravings();
    loadTimeCapsules();

    // --- 6. CEREBRO DE LAS MASCOTAS VIVAS (FASE 4) ---
    const myId = currentUser || 'Goldote';
    const partnerId = myId === 'Goldote' ? 'Goldota' : 'Goldote';
    
    const myMascot = document.getElementById(`mascot-${myId.toLowerCase()}`);
    const myCatBody = document.getElementById(`cat-body-${myId.toLowerCase()}`);
    const myBubble = document.getElementById(`bubble-${myId.toLowerCase()}`);
    const myMoodSelector = document.getElementById(`mood-${myId.toLowerCase()}`);
    const myBuzz = document.getElementById(`buzz-${myId.toLowerCase()}`);
    
    const partnerMascot = document.getElementById(`mascot-${partnerId.toLowerCase()}`);
    const partnerCatBody = document.getElementById(`cat-body-${partnerId.toLowerCase()}`);
    const partnerBubble = document.getElementById(`bubble-${partnerId.toLowerCase()}`);
    const partnerMoodSelector = document.getElementById(`mood-${partnerId.toLowerCase()}`);
    const partnerBuzz = document.getElementById(`buzz-${partnerId.toLowerCase()}`);

    // Ocultar selector de mood de la pareja (solo cambias el tuyo)
    if (partnerMoodSelector) partnerMoodSelector.style.display = 'none';
    if (myBuzz) myBuzz.style.display = 'none'; 

    let currentMood = 'feliz';
    
    async function updateMyStatus() {
        if (!supabaseClient) return;
        try {
            await supabaseClient.from('user_status').upsert({
                username: myId,
                last_seen: new Date().toISOString(),
                mood: currentMood
            });
        } catch (e) { }
    }

    async function sendBuzz() {
        if (!supabaseClient) return;
        try {
            await supabaseClient.from('user_status').upsert({
                username: partnerId,
                has_buzz: true
            });
            alert(`¡Zumbido enviado a ${partnerId}!`);
        } catch (e) {}
    }

    async function addPet() {
        if (!supabaseClient) return;
        try {
            const { data } = await supabaseClient.from('user_status').select('pets_received').eq('username', partnerId).single();
            const currentPets = data ? data.pets_received : 0;
            await supabaseClient.from('user_status').upsert({
                username: partnerId,
                pets_received: currentPets + 1
            });
        } catch (e) {}
    }

    async function syncPartnerStatus() {
        if (!supabaseClient) return;
        try {
            const { data, error } = await supabaseClient.from('user_status').select('*');
            if (error) return;
            
            const pStatus = data.find(u => u.username === partnerId);
            const mStatus = data.find(u => u.username === myId);

            // Zumbido para mi
            if (mStatus && mStatus.has_buzz) {
                document.body.classList.add('shake-intense');
                setTimeout(() => document.body.classList.remove('shake-intense'), 1000);
                alert(`¡${partnerId} te está llamando la atención desesperadamente!`);
                await supabaseClient.from('user_status').upsert({ username: myId, has_buzz: false });
            }

            // Mimos recibidos (opcional mostrar alerta o solo saberlo, lo dejaremos como burbuja)
            if (mStatus && mStatus.pets_received > 0 && myBubble) {
                myBubble.textContent = `¡Me diste ${mStatus.pets_received} mimos! 💖`;
                myMascot.classList.add('show-bubble');
                setTimeout(() => myMascot.classList.remove('show-bubble'), 5000);
                // Resetear mimos tras verlos
                await supabaseClient.from('user_status').upsert({ username: myId, pets_received: 0 });
            }

            // Estado de la pareja
            if (pStatus && partnerCatBody) {
                // Actualizar punto de conexión del perfil
                const myDot = document.getElementById(`dot-${myId.toLowerCase()}`);
                const partnerDot = document.getElementById(`dot-${partnerId.toLowerCase()}`);
                if (myDot) myDot.classList.add('online');
                
                const partnerLastSeen = new Date(pStatus.last_seen).getTime();
                const partnerDiffMins = (new Date().getTime() - partnerLastSeen) / (1000 * 60);
                const isPartnerOnline = partnerDiffMins < 5; // Conexión activa: visto en los últimos 5 min
                if (partnerDot) partnerDot.classList.toggle('online', isPartnerOnline);
                
                // Actualizar el header con estado de pareja
                const headerStatus = document.getElementById('header-status');
                if (headerStatus) {
                    headerStatus.textContent = isPartnerOnline 
                        ? `${partnerId} está conectad${partnerId === 'Goldota' ? 'a' : 'o'} ahora 💞` 
                        : `${partnerId} fue visto hace ${Math.floor(partnerDiffMins)} min`;
                }

                // Actualizar Mood
                partnerCatBody.className = `cat-body ${partnerId === 'Goldota' ? 'black-cat' : 'cow-cat'} ${pStatus.mood}`;
                
                // Lógica de Gatos Dormilones (1 AM a 6 AM)
                const hour = new Date().getHours();
                if (hour >= 1 && hour <= 6) {
                    partnerCatBody.classList.add('sleeping');
                    myCatBody.classList.add('sleeping');
                    document.body.style.background = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
                }

                // Lógica Enojado (12 horas sin conexión)
                const lastSeen = new Date(pStatus.last_seen).getTime();
                const now = new Date().getTime();
                const diffHours = (now - lastSeen) / (1000 * 60 * 60);

                if (diffHours >= 12 && pStatus.mood !== 'sleeping' && (hour < 1 || hour > 6)) {
                    partnerCatBody.classList.add('angry');
                    partnerBubble.textContent = "muy bonito abandonandome";
                    partnerMascot.classList.add('show-bubble');
                    if (partnerBuzz) partnerBuzz.style.display = 'block';
                } else {
                    partnerMascot.classList.remove('show-bubble');
                    if (partnerBuzz) partnerBuzz.style.display = 'none';
                }
            }
        } catch (e) {}
    }

    // Eventos UI
    if (myMoodSelector) {
        myMoodSelector.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentMood = btn.getAttribute('data-mood');
                myCatBody.className = `cat-body ${myId === 'Goldota' ? 'black-cat' : 'cow-cat'} ${currentMood}`;
                updateMyStatus();
            });
        });
    }

    if (partnerCatBody) {
        partnerCatBody.addEventListener('click', (e) => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = '💖';
            heart.style.left = e.offsetX + 'px';
            heart.style.top = e.offsetY + 'px';
            partnerCatBody.appendChild(heart);
            setTimeout(() => heart.remove(), 1000);
            addPet();
        });
    }

    if (partnerBuzz) {
        partnerBuzz.addEventListener('click', () => sendBuzz());
    }

    // Iniciar el ciclo de sincronización de mascotas (cada 15s)
    setInterval(syncPartnerStatus, 15000);
    setTimeout(updateMyStatus, 2000); // Primer ping de que estamos online
    setTimeout(syncPartnerStatus, 3000); 

    // --- 7. FASE 5: PERFIL (Días, Manual y Secretos) ---
    const daysTogetherEl = document.getElementById('days-together');
    if (daysTogetherEl) {
        // Fecha de aniversario configurada
        const anniversary = new Date('2025-02-09T00:00:00');
        const now = new Date();
        const diffTime = Math.abs(now - anniversary);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        daysTogetherEl.textContent = `${diffDays} Días`;
    }

    // Manual Animado
    const manualModal = document.getElementById('manual-modal');
    const btnManual = document.getElementById('btn-manual');
    const btnCloseManual = document.getElementById('btn-close-manual');
    const btnManualNext = document.getElementById('manual-next');
    const btnManualPrev = document.getElementById('manual-prev');
    const slides = document.querySelectorAll('#manual-carousel .slide');
    let currentSlide = 0;

    if (btnManual) {
        btnManual.addEventListener('click', () => {
            manualModal.classList.add('active');
            showSlide(0);
        });
        btnCloseManual.addEventListener('click', () => manualModal.classList.remove('active'));
        
        btnManualNext.addEventListener('click', () => {
            if (currentSlide < slides.length - 1) showSlide(currentSlide + 1);
        });
        btnManualPrev.addEventListener('click', () => {
            if (currentSlide > 0) showSlide(currentSlide - 1);
        });

        function showSlide(index) {
            slides.forEach((s, i) => {
                s.classList.remove('active', 'prev');
                if (i < index) s.classList.add('prev');
                if (i === index) s.classList.add('active');
            });
            currentSlide = index;
            btnManualPrev.style.opacity = currentSlide === 0 ? '0.5' : '1';
            btnManualNext.style.opacity = currentSlide === slides.length - 1 ? '0.5' : '1';
        }
    }

    // Baúl de Secretos
    const secretsModal = document.getElementById('secrets-modal');
    const btnSecrets = document.getElementById('btn-secret-stash');
    const btnCloseSecrets = document.getElementById('btn-close-secrets');
    const btnSaveSecrets = document.getElementById('btn-save-secrets');
    const secretText = document.getElementById('secret-text');

    if (btnSecrets) {
        btnSecrets.addEventListener('click', async () => {
            secretsModal.classList.add('active');
            if (supabaseClient) {
                const { data } = await supabaseClient.from('user_status').select('secrets').eq('username', 'shared').single();
                if (data && data.secrets) secretText.value = data.secrets;
            }
        });
        btnCloseSecrets.addEventListener('click', () => secretsModal.classList.remove('active'));
        btnSaveSecrets.addEventListener('click', async () => {
            if (supabaseClient) {
                await supabaseClient.from('user_status').upsert({ username: 'shared', secrets: secretText.value });
                alert("Secretos guardados en el baúl 🔐");
            }
            secretsModal.classList.remove('active');
        });
    }

});
