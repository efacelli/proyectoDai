const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const turnosFilePath = path.join(__dirname, 'turnos.json');

// Leer turnos no disponibles
async function leerTurnosNoDisponibles() {
    try {
        const data = await fs.readFile(turnosFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { turnosNoDisponibles: [] };
    }
}

// Guardar turnos no disponibles
async function guardarTurnosNoDisponibles(turnos) {
    await fs.writeFile(turnosFilePath, JSON.stringify(turnos));
}

app.get('/api/turnos-no-disponibles', async (req, res) => {
    const turnos = await leerTurnosNoDisponibles();
    res.json(turnos);
});

app.post('/api/marcar-no-disponible', async (req, res) => {
    const { turno } = req.body;
    const turnos = await leerTurnosNoDisponibles();
    if (!turnos.turnosNoDisponibles.includes(turno)) {
        turnos.turnosNoDisponibles.push(turno);
        await guardarTurnosNoDisponibles(turnos);
    }
    res.json({ success: true });
});

// Ruta para manejar todas las demás solicitudes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
