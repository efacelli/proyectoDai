document.addEventListener('DOMContentLoaded', () => {
    const turnoManana = document.getElementById('turno-manana');
    const turnoTarde = document.getElementById('turno-tarde');
    const turnosSection = document.getElementById('turnos');
    const turnosContainer = document.querySelector('.turnos-container');
    const loginBtn = document.getElementById('loginBtn');
    const loginSection = document.getElementById('login');
    const loginForm = document.getElementById('loginForm');

    let isAdmin = false;
    let turnosNoDisponibles = new Set();

    async function cargarTurnosNoDisponibles() {
        const response = await fetch('/api/turnos-no-disponibles');
        const data = await response.json();
        turnosNoDisponibles = new Set(data.turnosNoDisponibles);
    }

    async function mostrarHorarios(inicio, fin) {
        await cargarTurnosNoDisponibles();
        turnosContainer.innerHTML = '';
        for (let i = inicio; i <= fin; i++) {
            const turno = document.createElement('a');
            turno.href = '#';
            turno.className = 'turno';
            turno.textContent = `${i}:00`;
            turno.setAttribute('data-hora', `${i}:00`);
            
            if (turnosNoDisponibles.has(`${i}:00`)) {
                turno.style.backgroundColor = '#ffcccb';
                turno.style.pointerEvents = 'none';
            } else {
                turno.addEventListener('click', (e) => {
                    e.preventDefault();
                    const hora = e.target.getAttribute('data-hora');
                    if (isAdmin) {
                        marcarComoNoDisponible(hora, e.target);
                    } else {
                        redirigirAWhatsApp(hora);
                    }
                });
            }
            
            turnosContainer.appendChild(turno);
        }
        turnosSection.style.display = 'block';
    }

    async function marcarComoNoDisponible(hora, elementoTurno) {
        const response = await fetch('/api/marcar-no-disponible', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ turno: hora }),
        });
        const data = await response.json();
        if (data.success) {
            turnosNoDisponibles.add(hora);
            elementoTurno.style.backgroundColor = '#ffcccb';
            elementoTurno.style.pointerEvents = 'none';
        }
    }

    function redirigirAWhatsApp(hora) {
        const mensaje = encodeURIComponent(`Hola! elegí el turno: ${hora}, proporcioname tu alias así completo el pago.`);
        const numero = '5493855972750'; // Número de WhatsApp sin el símbolo '+'
        const url = `https://wa.me/${numero}?text=${mensaje}`;
        window.location.href = url;
    }

    turnoManana.addEventListener('click', () => mostrarHorarios(9, 13));
    turnoTarde.addEventListener('click', () => mostrarHorarios(15, 21));

    loginBtn.addEventListener('click', () => {
        loginSection.style.display = loginSection.style.display === 'none' ? 'block' : 'none';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'admin' && password === 'admin123') {
            isAdmin = true;
            document.body.classList.add('admin-mode');
            loginSection.style.display = 'none';
            alert('Has iniciado sesión como administrador');
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });
});