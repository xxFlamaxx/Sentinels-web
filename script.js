/* =========================================================================
   SENTINELS WEBSCRIPT - LÓGICA HÍBRIDA (SIMULACIÓN + FIREBASE READY)
   =========================================================================
   
   IMPORTANTE: Como estás corriendo la página desde archivos locales ('file://'),
   los navegadores bloquean Firebase por seguridad.
   
   Este script funciona en "MODO SIMULACIÓN" para que el registro y login
   te lleven al Home inmediatamente sin errores.
   
   CUANDO TENGAS UN DOMINIO REAL (http://...):
   Busca la palabra 'SIMULACIÓN' y descomenta las líneas de Firebase.
*/

// 1. CONFIGURACIÓN DE TU FIREBASE (YA INTEGRADA)
const firebaseConfig = {
    apiKey: "AIzaSyAD_FPhpmmbuvnXUxKVlNpENdViPTIBaYU",
    authDomain: "sentinels-web.firebaseapp.com",
    projectId: "sentinels-web",
    storageBucket: "sentinels-web.firebasestorage.app",
    messagingSenderId: "565758042156",
    appId: "1:565758042156:web:2f63fe53f974acc43af189",
    measurementId: "G-E7TZZYMZQB"
};

// 2. INICIALIZACIÓN DE FIREBASE (Versión Compat v8)
// Nota: Solo funcionará en un servidor web real. En local fallará silenciosamente.
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    // const auth = firebase.auth(); // Descomentar en producción
    // const db = firebase.firestore(); // Descomentar en producción
    console.log("Firebase intentado inicializar (Revisar CORS si falla en local)");
} catch (e) {
    console.log("Firebase no pudo inicializarse en entorno local.");
}

const ADMIN_EMAIL = "franboy1221@gmail.com";
let currentUser = null; // Guardará el usuario logueado actual

// Datos simulados (Database local temporal)
let baseDatosSimulada = {
    usuarios: [],
    boletas: [
        {id: 'B001', estado: 'Pendiente', user: 'empleado1@sentinels.com'},
        {id: 'B002', estado: 'Activa', user: 'franboy1221@gmail.com'}
    ]
};

// =========================================================================
// 3. NAVEGACIÓN Y CONTROL DE INTERFAZ
// =========================================================================

// Alternar entre Login y Registro
function toggleAuth(view) {
    if (view === 'register') {
        document.getElementById('auth-login').style.display = 'none';
        document.getElementById('auth-register').style.display = 'block';
    } else {
        document.getElementById('auth-login').style.display = 'block';
        document.getElementById('auth-register').style.display = 'none';
    }
}

// Cambiar de la pantalla de Auth al Home
function showView(viewId) {
    document.getElementById('view-auth').style.display = 'none';
    document.getElementById('view-home').style.display = 'none';
    const target = document.getElementById(viewId);
    if (target) {
        target.style.display = (viewId === 'view-home') ? 'flex' : 'flex';
    }
}

// Cambiar entre las 5 secciones del Home
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    
    // Quitar clase 'active' del menú
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));

    // Mostrar sección objetivo
    const targetSec = document.getElementById('sec-' + sectionId);
    if (targetSec) targetSec.style.display = 'block';
    
    // Actualizar título de cabecera
    document.getElementById('section-title').innerText = sectionId.replace('-', ' ').toUpperCase();

    // Especiales por sección
    if (sectionId === 'boletas-list') renderBoletas();
}

// =========================================================================
// 4. LÓGICA DE AUTENTICACIÓN (LOGIN/REGISTRO)
// =========================================================================

// Enviar SMS (Simulado)
function enviarSMS() {
    const tel = document.getElementById('reg-tel').value;
    if (tel.length < 10) return alert("Ingresa un número de celular válido de Colombia (10 dígitos)");
    
    // Simulación de envío
    alert("CÓDIGO SENTINELS: 123456. Enviado por SMS al celular " + tel + " (Simulación)");
    document.getElementById('sms-section').style.display = 'block'; // Mostrar recuadro del código
}

// Registro final (Híbrido)
function verificarYRegistrar() {
    // 1. Obtener datos
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const nombre = document.getElementById('reg-nombre').value;
    const apellido = document.getElementById('reg-apellido').value;
    const codigo = document.getElementById('reg-code').value;

    // 2. Validaciones básicas
    if (!email || !pass || !nombre || !apellido) return alert("Completa todos los campos obligatorios.");
    if (pass.length < 6) return alert("La contraseña debe tener al menos 6 caracteres.");
    if (codigo !== "123456") return alert("El código SMS es incorrecto (Prueba con 123456).");

    // --- MODO SIMULACIÓN (Inmediato) ---
    console.log("Registrando usuario en modo simulación...");
    
    const nuevoUsuario = {
        uid: "sim" + Date.now(),
        nombre: nombre,
        apellido: apellido,
        email: email,
        rol: (email === ADMIN_EMAIL) ? 'admin' : 'usuario'
    };
    
    baseDatosSimulada.usuarios.push(nuevoUsuario);
    currentUser = nuevoUsuario; // Auto-login
    initDashboard(); 
    alert("¡Registro exitoso! Bienvenido a Sentinels, " + nombre);
    // ----------------------------------


    /* --- MODO FIREBASE REAL (Descomentar cuando tengas dominio) ---
    auth.createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            // Guardar datos adicionales en Firestore
            return db.collection("usuarios").doc(userCredential.user.uid).set({
                nombre: nombre,
                apellido: apellido,
                email: email,
                rol: (email === ADMIN_EMAIL) ? 'admin' : 'usuario',
                fechaRegistro: new Date()
            });
        })
        .then(() => {
            alert("Registro exitoso en Firebase.");
            currentUser = auth.currentUser; // O pedir datos a firestore
            initDashboard();
        })
        .catch((error) => alert("Error Firebase: " + error.message));
    -------------------------------------------------------------- */
}

// Login (Híbrido)
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    if (!email || !pass) return alert("Ingresa correo y contraseña");

    // --- MODO SIMULACIÓN (Inmediato) ---
    console.log("Logueando en modo simulación...");
    // Permite entrar con CUALQUIER contraseña si el correo coincide
    currentUser = {
        email: email,
        nombre: (email === ADMIN_EMAIL) ? "Franboy" : "Usuario",
        apellido: (email === ADMIN_EMAIL) ? "Admin" : "Simulado",
        rol: (email === ADMIN_EMAIL) ? 'admin' : 'usuario'
    };
    initDashboard();
    // ----------------------------------

    /* --- MODO FIREBASE REAL (Descomentar en producción) ---
    auth.signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            currentUser = userCredential.user;
            // Aquí deberías pedir el 'rol' a Firestore antes de iniciar
            initDashboard();
        })
        .catch((error) => alert("Error Login: " + error.message));
    ------------------------------------------------------- */
}

// Logout
function handleLogout() {
    currentUser = null;
    showView('view-auth');
    toggleAuth('login'); // Volver al formulario de login
    
    /* --- MODO FIREBASE REAL ---
    auth.signOut();
    ---------------------------- */
}

// =========================================================================
// 5. INICIALIZACIÓN Y GESTIÓN DEL DASHBOARD (HOME)
// =========================================================================

function initDashboard() {
    if (!currentUser) return showView('view-auth');
    
    showView('view-home'); // Cambiar pantalla

    // A. Configuración de Admin
    if (currentUser.rol === 'admin') {
        document.getElementById('admin-badge').style.display = 'block';
        document.getElementById('admin-comunicado-form').style.display = 'block'; // Mostrar form comunicados
        // Mostrar columnas de admin en tablas si existen
        document.querySelectorAll('.admin-only-cell').forEach(c => c.style.display = 'table-cell');
    } else {
        document.getElementById('admin-badge').style.display = 'none';
        document.getElementById('admin-comunicado-form').style.display = 'none';
        document.querySelectorAll('.admin-only-cell').forEach(c => c.style.display = 'none');
    }

    // B. Cargar Datos del Carnet
    document.getElementById('c-nombre').innerText = currentUser.nombre + " " + currentUser.apellido;
    document.getElementById('c-rol').innerText = (currentUser.rol === 'admin') ? 'Administrador General' : 'Personal Operativo';

    // C. Sección por defecto
    showSection('perfil');
    
    // D. Simular notificación de comunicado nuevo
    document.getElementById('dot-notif').style.display = 'inline-block';
}

// =========================================================================
// 6. LÓGICA DE NEGOCIO (BOLETAS Y COMUNICADOS)
// =========================================================================

// Inscripción de Boletas (Híbrido)
function inscribirBoleta() {
    const cod = document.getElementById('input-boleta').value;
    if (!cod) return alert("Ingresa el código de la boleta");

    // --- MODO SIMULACIÓN ---
    baseDatosSimulada.boletas.push({
        id: cod,
        estado: 'Pendiente',
        user: currentUser.email
    });
    alert("Boleta SN-" + cod + " inscrita correctamente. Queda en estado 'Pendiente' para validación.");
    document.getElementById('input-boleta').value = ""; // Limpiar input
    // -----------------------
}

// Renderizar tabla de boletas (Híbrido)
function renderBoletas() {
    const body = document.getElementById('lista-boletas-body');
    body.innerHTML = "";
    
    // --- MODO SIMULACIÓN ---
    // Decidir cuáles boletas mostrar
    const visibles = (currentUser.rol === 'admin') 
        ? baseDatosSimulada.boletas // Admin ve todas
        : baseDatosSimulada.boletas.filter(b => b.user === currentUser.email); // Usuario ve las suyas

    if(visibles.length === 0) {
        body.innerHTML = "<tr><td colspan='4' style='text-align:center;'>No hay boletas registradas.</td></tr>";
        return;
    }

    visibles.forEach(b => {
        // Definir color del estado
        let colorEstado = 'var(--pending)';
        if(b.estado === 'Activa') colorEstado = 'var(--success)';
        if(b.estado === 'Rechazada') colorEstado = 'var(--danger)';

        body.innerHTML += `
            <tr>
                <td style="font-weight:bold;">SN-${b.id}</td>
                <td style="color: ${colorEstado}; font-weight:bold;">${b.estado}</td>
                <td>${b.user}</td>
                <td class="admin-only-cell" style="display: ${currentUser.role === 'admin' ? 'table-cell' : 'none'}">
                    ${(b.estado === 'Pendiente' && currentUser.rol === 'admin') ? 
                        `<button class="btn-sm-success" onclick="adminCambiarEstadoBoleta('${b.id}', 'Activa')">Activar</button>
                         <button class="btn-sm-danger" onclick="adminCambiarEstadoBoleta('${b.id}', 'Rechazada')">x</button>` 
                        : '---'}
                </td>
            </tr>
        `;
    });
    // Re-corregir visibilidad de celdas admin si se renderizó de cero
    if (currentUser.rol !== 'admin') {
         document.querySelectorAll('.admin-only-cell').forEach(c => c.style.display = 'none');
    }

}

// Acción de Admin: Cambiar estado boleta (Simulado)
function adminCambiarEstadoBoleta(boletaId, nuevoEstado) {
    const boleta = baseDatosSimulada.boletas.find(b => b.id === boletaId);
    if(boleta) {
        boleta.estado = nuevoEstado;
        renderBoletas(); // Recargar tabla
        alert("Estado de boleta " + boletaId + " actualizado a " + nuevoEstado);
    }

}

function publicarComunicado() {
    const texto = document.getElementById('nuevo-comunicado').value;
    if(!texto) return alert("Escribe el comunicado.");
    
    // Simular agregado
    const list = document.getElementById('comunicados-list');
    list.innerHTML = `
        <div class="item-card info">
            <h4>NUEVO AVISO (Urgente)</h4>
            <p>${texto}</p>
            <span class="date">Publicado por Admin: Hoy</span>
        </div>
    ` + list.innerHTML;
    
    document.getElementById('nuevo-comunicado').value = ""; // Limpiar
}