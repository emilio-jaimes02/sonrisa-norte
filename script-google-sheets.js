// ============================================================
// SONRISA NORTE - SCRIPT CON GOOGLE SHEETS
// Conectado a Google Sheets como base de datos
// ============================================================

// ==================== CONFIGURACIÓN ====================

// ⚠️ IMPORTANTE: Reemplaza esta URL con la URL de tu Google Apps Script Web App
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhcLitknOX8KV8SzBoIxAZBdNWY1LDnRKMX9T9alZF5zAdmuPfyLEiaNWcSETgJ9fF/exec';

// Ejemplo de URL correcta:
// const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';

// Configurar fecha mínima (hoy)
const today = new Date().toISOString().split('T')[0];

// Horarios del consultorio (se sincronizarán con Google Sheets)
let HORARIOS_CONSULTORIO = [];

// LocalStorage keys (para caché temporal)
const STORAGE_KEYS = {
  USUARIO_ACTUAL: 'sonrisa_norte_usuario_actual',
  CACHE_HORARIOS: 'sonrisa_norte_cache_horarios',
  CACHE_SERVICIOS: 'sonrisa_norte_cache_servicios'
};

// ==================== FUNCIONES DE API ====================

/**
 * Hacer petición a Google Sheets
 */
async function llamarAPI(action, params = {}) {
    try {
        // Agregar la acción a los parámetros
        params.action = action;
        
        // Construir URL con parámetros
        const url = GOOGLE_SCRIPT_URL + '?' + new URLSearchParams(params).toString();
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error en API:', error);
        return {
            success: false,
            message: 'Error de conexión: ' + error.message
        };
    }
}

/**
 * Verificar que la URL de Google Script esté configurada
 */
function verificarConfiguracion() {
    if (GOOGLE_SCRIPT_URL === 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI' || 
        GOOGLE_SCRIPT_URL.trim() === '') {
        console.error('❌ ERROR: URL de Google Apps Script no configurada');
        console.log('📝 Pasos para configurar:');
        console.log('1. Abre tu Google Sheet');
        console.log('2. Ve a Extensiones → Apps Script');
        console.log('3. Copia el código de google-apps-script.gs');
        console.log('4. Implementa como Web App');
        console.log('5. Copia la URL y pégala en la línea 8 de este script');
        return false;
    }
    return true;
}

// ==================== FUNCIONES AUXILIARES ====================

function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error al leer localStorage:', error);
        return null;
    }
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    element.innerHTML = `
        <div class="alert ${alertClass}">
            <i class="fas fa-${icon} mr-2"></i>
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        element.innerHTML = '';
    }, 5000);
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function formatearFecha(fecha) {
    const date = new Date(fecha + 'T00:00:00');
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-MX', opciones);
}

function mostrarCargando(elementId, mostrar = true) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (mostrar) {
        element.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner mx-auto"></div>
                <p class="text-gray-600 mt-3">Cargando...</p>
            </div>
        `;
    } else {
        element.innerHTML = '';
    }
}

// ==================== GESTIÓN DE HORARIOS ====================

/**
 * Obtener horarios del consultorio desde Google Sheets
 */
async function cargarHorarios() {
    // Intentar obtener del caché primero
    const cache = getFromStorage(STORAGE_KEYS.CACHE_HORARIOS);
    if (cache && cache.timestamp > Date.now() - 3600000) { // 1 hora de caché
        HORARIOS_CONSULTORIO = cache.horarios;
        return cache.horarios;
    }
    
    // Si no hay caché, obtener de Google Sheets
    const resultado = await llamarAPI('obtenerHorarios');
    
    if (resultado.success) {
        HORARIOS_CONSULTORIO = resultado.horarios;
        // Guardar en caché
        saveToStorage(STORAGE_KEYS.CACHE_HORARIOS, {
            horarios: resultado.horarios,
            timestamp: Date.now()
        });
        return resultado.horarios;
    }
    
    // Si falla, usar horarios por defecto
    HORARIOS_CONSULTORIO = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00'
    ];
    return HORARIOS_CONSULTORIO;
}

/**
 * Obtener horarios ocupados de Google Sheets
 */
async function getHorariosOcupados(fecha) {
    const resultado = await llamarAPI('obtenerHorariosOcupados', { fecha });
    
    if (resultado.success) {
        return resultado.horariosOcupados;
    }
    
    return [];
}

/**
 * Generar botones de horarios con disponibilidad
 */
async function generarHorariosDisponibles(fecha = null) {
    const container = document.getElementById('horariosContainer');
    if (!container) return;
    
    if (!fecha) {
        container.innerHTML = `
            <div class="col-span-3 text-center text-gray-500 py-4">
                <i class="fas fa-calendar-day text-3xl mb-2"></i>
                <p>Selecciona una fecha para ver los horarios disponibles</p>
            </div>
        `;
        return;
    }
    
    // Mostrar cargando
    container.innerHTML = `
        <div class="col-span-3 text-center py-4">
            <div class="spinner mx-auto"></div>
            <p class="text-gray-600 mt-3">Consultando disponibilidad...</p>
        </div>
    `;
    
    // Asegurar que los horarios estén cargados
    if (HORARIOS_CONSULTORIO.length === 0) {
        await cargarHorarios();
    }
    
    // Obtener horarios ocupados
    const horariosOcupados = await getHorariosOcupados(fecha);
    
    // Limpiar container
    container.innerHTML = '';
    
    HORARIOS_CONSULTORIO.forEach(horario => {
        const isOcupado = horariosOcupados.includes(horario);
        const button = document.createElement('button');
        button.type = 'button';
        
        if (isOcupado) {
            button.className = 'horario-btn disabled px-4 py-3 border-2 border-red-200 rounded-xl text-sm font-semibold text-red-400 bg-red-50 cursor-not-allowed';
            button.innerHTML = `${horario}<br><span class="text-xs">Ocupado</span>`;
            button.disabled = true;
        } else {
            button.className = 'horario-btn px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition';
            button.innerHTML = `${horario}<br><span class="text-xs text-green-600">Disponible</span>`;
            button.onclick = () => seleccionarHorario(horario, button);
        }
        
        container.appendChild(button);
    });
    
    // Mostrar resumen
    const disponibles = HORARIOS_CONSULTORIO.length - horariosOcupados.length;
    const resumen = document.createElement('div');
    resumen.className = 'col-span-3 mt-4 p-3 bg-blue-50 rounded-xl text-sm text-center';
    resumen.innerHTML = `
        <i class="fas fa-info-circle text-blue-500 mr-2"></i>
        <span class="font-semibold">${disponibles}</span> horarios disponibles de 
        <span class="font-semibold">${HORARIOS_CONSULTORIO.length}</span> totales
    `;
    container.appendChild(resumen);
}

function seleccionarHorario(horario, button) {
    document.querySelectorAll('.horario-btn:not(.disabled)').forEach(btn => {
        btn.classList.remove('selected', 'border-blue-500', 'bg-blue-500', 'text-white');
        btn.classList.add('border-gray-300', 'text-gray-700');
    });

    button.classList.add('selected', 'border-blue-500', 'bg-blue-500', 'text-white');
    button.classList.remove('border-gray-300', 'text-gray-700');
    
    document.getElementById('cita_horario').value = horario;
    console.log('Horario seleccionado:', horario);
}

// ==================== MODAL: AGENDAR CITA ====================

function openAgendarCitaModal() {
    const modal = document.getElementById('agendarCitaModal');
    if (!modal) return;
    
    if (!verificarConfiguracion()) {
        alert('⚠️ Error: Google Apps Script no configurado.\nRevisa la consola para más información.');
        return;
    }
    
    modal.classList.add('active');
    
    const fechaInput = document.getElementById('cita_fecha');
    if (fechaInput) {
        fechaInput.min = today;
        fechaInput.addEventListener('change', function() {
            generarHorariosDisponibles(this.value);
            document.getElementById('cita_horario').value = '';
        });
    }
    
    generarHorariosDisponibles(null);
}

function closeAgendarCitaModal() {
    const modal = document.getElementById('agendarCitaModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.getElementById('agendarCitaForm')?.reset();
    document.getElementById('agendarCitaMessage').innerHTML = '';
    document.getElementById('cita_horario').value = '';
}

async function handleAgendarCita(e) {
    e.preventDefault();

    const nombre = document.getElementById('cita_nombre').value.trim();
    const email = document.getElementById('cita_email').value.trim();
    const telefono = document.getElementById('cita_telefono').value.trim();
    const servicio = document.getElementById('cita_servicio').value;
    const fecha = document.getElementById('cita_fecha').value;
    const horario = document.getElementById('cita_horario').value;
    const mensaje = document.getElementById('cita_mensaje').value.trim();

    if (!nombre || !email || !telefono || !servicio || !fecha || !horario) {
        showMessage('agendarCitaMessage', 'Por favor completa todos los campos obligatorios', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('agendarCitaMessage', 'Por favor ingresa un email válido', 'error');
        return;
    }

    mostrarCargando('agendarCitaMessage', true);

    const resultado = await llamarAPI('agendarCita', {
        nombre,
        email,
        telefono,
        servicio,
        fecha,
        horario,
        mensaje
    });

    mostrarCargando('agendarCitaMessage', false);

    if (resultado.success) {
        showMessage('agendarCitaMessage', 
            `✅ <strong>¡Cita agendada exitosamente!</strong><br><br>
             📅 Fecha: ${formatearFecha(fecha)}<br>
             🕐 Hora: ${horario}<br>
             📧 Te enviaremos confirmación a: ${email}<br><br>
             <small>ID: ${resultado.cita.id}</small>`, 
            'success'
        );

        console.log('✅ Cita registrada en Google Sheets:', resultado.cita);

        setTimeout(() => {
            closeAgendarCitaModal();
        }, 4000);
    } else {
        showMessage('agendarCitaMessage', resultado.message, 'error');
    }
}

// ==================== MODAL: REGISTRO ====================

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.getElementById('registerForm')?.reset();
    document.getElementById('registerMessage').innerHTML = '';
}

async function handleRegistro(e) {
    e.preventDefault();

    const nombre = document.getElementById('register_nombre').value.trim();
    const email = document.getElementById('register_email').value.trim();
    const telefono = document.getElementById('register_telefono').value.trim();
    const password = document.getElementById('register_password').value;
    const passwordConfirm = document.getElementById('register_password_confirm').value;

    if (!nombre || !email || !telefono || !password || !passwordConfirm) {
        showMessage('registerMessage', 'Por favor completa todos los campos', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('registerMessage', 'Por favor ingresa un email válido', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('registerMessage', 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        showMessage('registerMessage', 'Las contraseñas no coinciden', 'error');
        return;
    }

    mostrarCargando('registerMessage', true);

    const resultado = await llamarAPI('registrarUsuario', {
        nombre,
        email,
        telefono,
        password,
        rol: 'paciente'
    });

    mostrarCargando('registerMessage', false);

    if (resultado.success) {
        showMessage('registerMessage', 
            `✅ <strong>¡Registro exitoso!</strong><br><br>
             Bienvenido ${nombre}!<br>
             Ya puedes iniciar sesión.<br><br>
             Redirigiendo...`, 
            'success'
        );

        console.log('✅ Usuario registrado en Google Sheets:', resultado.usuario);

        setTimeout(() => {
            switchToLogin();
        }, 2500);
    } else {
        showMessage('registerMessage', resultado.message, 'error');
    }
}

// ==================== MODAL: LOGIN ====================

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.getElementById('loginForm')?.reset();
    document.getElementById('loginMessage').innerHTML = '';
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login_email').value.trim().toLowerCase();
    const password = document.getElementById('login_password').value;

    if (!email || !password) {
        showMessage('loginMessage', 'Por favor completa todos los campos', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('loginMessage', 'Por favor ingresa un email válido', 'error');
        return;
    }

    mostrarCargando('loginMessage', true);

    const resultado = await llamarAPI('loginUsuario', {
        email,
        password
    });

    mostrarCargando('loginMessage', false);

    if (resultado.success) {
        saveToStorage(STORAGE_KEYS.USUARIO_ACTUAL, resultado.usuario);
        
        showMessage('loginMessage', 
            `✅ <strong>¡Bienvenido ${resultado.usuario.nombre}!</strong><br><br>
             Redirigiendo al dashboard...`, 
            'success'
        );

        console.log('✅ Usuario autenticado:', resultado.usuario);

        setTimeout(() => {
            closeLoginModal();
            mostrarDashboard(resultado.usuario);
        }, 2000);
    } else {
        showMessage('loginMessage', resultado.message, 'error');
    }
}

function mostrarDashboard(usuario) {
    alert(
        `🦷 DASHBOARD - SONRISA NORTE\n\n` +
        `Bienvenido: ${usuario.nombre}\n` +
        `Email: ${usuario.email}\n` +
        `Rol: ${usuario.rol.toUpperCase()}\n\n` +
        `✅ Conectado a Google Sheets\n\n` +
        `En la versión completa:\n` +
        `• Verás tus citas desde Google Sheets\n` +
        `• Podrás modificar o cancelar\n` +
        `• Tendrás acceso a tu historial`
    );
}

// ==================== SWITCH ENTRE MODALS ====================

function switchToLogin() {
    closeRegisterModal();
    setTimeout(() => openLoginModal(), 300);
}

function switchToRegister() {
    closeLoginModal();
    setTimeout(() => openRegisterModal(), 300);
}

// ==================== FUNCIONES DE DEBUG ====================

async function verCitasGoogleSheets() {
    const resultado = await llamarAPI('obtenerTodasCitas');
    console.table(resultado.citas);
    return resultado;
}

async function verUsuariosGoogleSheets() {
    const resultado = await llamarAPI('obtenerUsuarios');
    console.table(resultado.usuarios);
    return resultado;
}

async function verHorariosOcupadosGS(fecha) {
    const resultado = await llamarAPI('obtenerHorariosOcupados', { fecha });
    console.log(`📅 Horarios ocupados para ${fecha}:`, resultado.horariosOcupados);
    return resultado;
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🦷 ========================================');
    console.log('   SONRISA NORTE - GOOGLE SHEETS');
    console.log('   ========================================');
    
    if (!verificarConfiguracion()) {
        console.error('❌ Configuración incompleta');
        return;
    }
    
    // Cargar horarios del consultorio
    await cargarHorarios();
    console.log('✅ Horarios cargados:', HORARIOS_CONSULTORIO.length);
    
    // Event listeners
    const formAgendarCita = document.getElementById('agendarCitaForm');
    if (formAgendarCita) {
        formAgendarCita.addEventListener('submit', handleAgendarCita);
    }
    
    const formRegistro = document.getElementById('registerForm');
    if (formRegistro) {
        formRegistro.addEventListener('submit', handleRegistro);
    }
    
    const formLogin = document.getElementById('loginForm');
    if (formLogin) {
        formLogin.addEventListener('submit', handleLogin);
    }
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        document.querySelectorAll('#mobile-menu a, #mobile-menu button').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
            e.target.reset();
        });
    }
    
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            nav?.classList.add('shadow-lg');
        } else {
            nav?.classList.remove('shadow-lg');
        }
    });
    
    console.log('');
    console.log('💡 FUNCIONES DE DEBUG:');
    console.log('   verCitasGoogleSheets()');
    console.log('   verUsuariosGoogleSheets()');
    console.log('   verHorariosOcupadosGS("2026-03-15")');
    console.log('');
    console.log('✅ Sistema inicializado correctamente');
    console.log('🦷 ========================================');
});

// Exportar funciones globales
window.openAgendarCitaModal = openAgendarCitaModal;
window.closeAgendarCitaModal = closeAgendarCitaModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.switchToLogin = switchToLogin;
window.switchToRegister = switchToRegister;
window.seleccionarHorario = seleccionarHorario;
window.verCitasGoogleSheets = verCitasGoogleSheets;
window.verUsuariosGoogleSheets = verUsuariosGoogleSheets;
window.verHorariosOcupadosGS = verHorariosOcupadosGS;

console.log('✅ Script con Google Sheets cargado - Sonrisa Norte v2.0');
