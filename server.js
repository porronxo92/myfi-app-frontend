const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde dist/finanzas-app/browser
app.use(express.static(path.join(__dirname, 'dist/finanzas-app/browser')));

// Manejar todas las rutas de Angular (SPA routing)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/finanzas-app/browser/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
