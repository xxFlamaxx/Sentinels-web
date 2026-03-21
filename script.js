// --- CONFIGURACIÓN ---
const ADMIN_EMAIL = "franboy1221@gmail.com";
let currentUser = null;

// BASE DE DATOS LOCAL (SIMULADA PARA GITHUB PAGES)
let dbLocal = {
    usuarios: {}, 
    boletas: [
        {id: 'SN-001', estado: 'Activa', user: 'ejemplo@sentinels.com'},
        {id: 'SN-002', estado: 'Pendiente', user: 'franboy1221@gmail.com'}
    ],
    capacitaciones: [{id: 1, titulo: 'Inducción de Seguridad'}],
    comunicados: [{id: 1, texto: 'Bienvenidos al nuevo portal de Sentinels Logística.'}]
};

// --- NAVEGACIÓN ---
function toggleAuth(view) {
    document.getElementById('auth-login').style.display = (view === 'login') ? 'block' : 'none';
    document.getElementById('auth-register').style.display = (view === 'register') ? 'block' : 'none';
}

function showView(viewId) {
    document.getElementById('view-auth').style.display = (viewId === 'view-auth') ? 'flex' : 'none';
    document.getElementById('view-home').style.display = (viewId === 'view-home') ? 'flex' : 'none';
}

function showSection(sectionId) {
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.getElementById('sec-' + sectionId).style.display = 'block';
    document.getElementById('section-title').innerText = sectionId.replace('-', ' ').toUpperCase();
    
    if(sectionId === 'boletas-list') renderBoletas();
    if(sectionId === 'capacitaciones') renderCapacitaciones();
    if(sectionId === 'comunicados') renderComunicados();
}

// --- AUTENTICACIÓN ---
function handleLogin() {
    const email = document.getElementById('login-email').value;
    if(!email) return alert("Por favor ingresa tu correo");
    
    currentUser = {
        email: email,
        rol: (email === ADMIN_EMAIL) ? 'admin' : 'usuario'
    };
    initDashboard();
}

function initDashboard() {
    showView('view-home');
    if(currentUser.rol === 'admin') {
        document.getElementById('admin-badge').style.display = 'block';
        document.getElementById('admin-cap-form').style.display = 'block';
        document.getElementById('admin-com-form').style.display = 'block';
    }
    actualizarInterfazPerfil();
    showSection('perfil');
}

// --- PERFIL ---
function actualizarPerfil() {
    const doc = document.getElementById('edit-doc').value;
    const fecha = document.getElementById('edit-fecha').value;
    const photo = document.getElementById('edit-photo').value;

    dbLocal.usuarios[currentUser.email] = { doc, fecha, photo };
    actualizarInterfazPerfil();
    alert("Perfil actualizado correctamente.");
}

function actualizarInterfazPerfil() {
    const data = dbLocal.usuarios[currentUser.email] || {};
    document.getElementById('c-nombre').innerText = currentUser.email;
    document.getElementById('c-doc').innerText = data.doc || "---";
    document.getElementById('c-fecha').innerText = data.fecha || "---";
    const photoDisplay = document.getElementById('profile-img-display');
    if(data.photo) {
        photoDisplay.innerHTML = `<img src="${data.photo}" style="width:100%; height:100%; object-fit:cover;">`;
    }
}

// --- BOLETAS (VALIDACIÓN DE DUPLICADOS) ---
function inscribirBoleta() {
    const cod = document.getElementById('input-boleta').value.trim().toUpperCase();
    if(!cod) return alert("Ingresa un código");

    // VALIDACIÓN: ¿Ya existe?
    const duplicado = dbLocal.boletas.find(b => b.id === cod);
    if(duplicado) return alert("¡Error! Esta boleta ya fue registrada por el usuario: " + duplicado.user);

    dbLocal.boletas.push({ id: cod, estado: 'Pendiente', user: currentUser.email });
    alert("Boleta registrada. Espera la activación del administrador.");
    document.getElementById('input-boleta').value = "";
    showSection('boletas-list');
}

function renderBoletas() {
    const body = document.getElementById('lista-boletas-body');
    body.innerHTML = "";
    let pend = 0, act = 0;

    const lista = (currentUser.rol === 'admin') ? dbLocal.boletas : dbLocal.boletas.filter(b => b.user === currentUser.email);

    lista.forEach(b => {
        if(b.estado === 'Activa') act++; else pend++;
        body.innerHTML += `
            <tr>
                <td>${b.id}</td>
                <td style="color:${b.estado === 'Activa' ? 'green' : 'orange'}">${b.estado}</td>
                <td>${b.user}</td>
                <td>
                    ${currentUser.rol === 'admin' ? 
                        `<button class="btn-sm-success" onclick="toggleBoleta('${b.id}')">Cambiar Estado</button>` : '---'}
                </td>
            </tr>
        `;
    });
    document.getElementById('count-pend').innerText = pend;
    document.getElementById('count-act').innerText = act;
}

function toggleBoleta(id) {
    const b = dbLocal.boletas.find(x => x.id === id);
    b.estado = (b.estado === 'Activa') ? 'Pendiente' : 'Activa';
    renderBoletas();
}

// --- CAPACITACIONES Y COMUNICADOS (ADMIN ELIMINA) ---
function renderCapacitaciones() {
    const list = document.getElementById('capacitaciones-list');
    list.innerHTML = "";
    dbLocal.capacitaciones.forEach(c => {
        list.innerHTML += `
            <div class="item-card">
                ${currentUser.rol === 'admin' ? `<button class="btn-delete" onclick="eliminarCap(${c.id})"><i class="fas fa-trash"></i></button>` : ''}
                <h4>${c.titulo}</h4>
                <button class="btn-sm-success" onclick="alert('Inscrito')">Asistir</button>
                <button class="btn-sm-danger" onclick="alert('Rechazado')">No Asistir</button>
            </div>`;
    });
}

function eliminarCap(id) {
    dbLocal.capacitaciones = dbLocal.capacitaciones.filter(c => c.id !== id);
    renderCapacitaciones();
}

function crearCapacitacion() {
    const t = document.getElementById('new-cap-title').value;
    if(t) { dbLocal.capacitaciones.push({id: Date.now(), titulo: t}); renderCapacitaciones(); document.getElementById('new-cap-title').value = ""; }
}

function renderComunicados() {
    const list = document.getElementById('comunicados-list');
    list.innerHTML = "";
    dbLocal.comunicados.forEach(c => {
        list.innerHTML += `
            <div class="item-card info">
                ${currentUser.rol === 'admin' ? `<button class="btn-delete" onclick="eliminarCom(${c.id})"><i class="fas fa-trash"></i></button>` : ''}
                <p>${c.texto}</p>
            </div>`;
    });
}

function eliminarCom(id) {
    dbLocal.comunicados = dbLocal.comunicados.filter(c => c.id !== id);
    renderComunicados();
}

function crearComunicado() {
    const t = document.getElementById('new-com-text').value;
    if(t) { dbLocal.comunicados.push({id: Date.now(), texto: t}); renderComunicados(); document.getElementById('new-com-text').value = ""; }
}

function handleLogout() { currentUser = null; showView('view-auth'); }
function enviarSMS() { document.getElementById('sms-section').style.display = 'block'; alert("SMS: 123456"); }
function verificarYRegistrar() { alert("Usuario Creado"); toggleAuth('login'); }