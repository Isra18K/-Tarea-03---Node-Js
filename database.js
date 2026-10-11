const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./ferreteria.db', (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

db.serialize(() => {
  // Crear tabla de productos
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL
    )
  `);

  // Insertar datos de prueba solo si la tabla está vacía
  db.get('SELECT COUNT(*) AS total FROM productos', (err, row) => {
    if (row && row.total === 0) {
      const insert = 'INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)';
      db.run(insert, ['Martillo de uña 16oz', 'Herramientas', 45.00, 15]);
      db.run(insert, ['Cinta métrica 5m', 'Medición', 25.50, 8]);
      db.run(insert, ['Destornillador Philips', 'Herramientas', 18.00, 3]);
      console.log('Datos iniciales cargados en productos.');
    }
  });
});

module.exports = db;