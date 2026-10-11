const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Obtener todos los productos
app.get('/api/productos', (req, res) => {
  const sql = 'SELECT * FROM productos ORDER BY id ASC';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows });
  });
});

// 2. Crear un nuevo producto
app.post('/api/productos', (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Nombre, precio y stock son requeridos.' });
  }

  const sql = 'INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)';
  db.run(sql, [nombre, categoria || 'General', Number(precio), parseInt(stock, 10)], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, mensaje: 'Producto creado correctamente.' });
  });
});

// 3. Modificar un producto existente (nombre, categoría, precio, stock)
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, stock } = req.body;

  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Todos los campos son necesarios para actualizar.' });
  }

  const sql = 'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ? WHERE id = ?';
  db.run(sql, [nombre, categoria, Number(precio), parseInt(stock, 10), id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ mensaje: 'Producto actualizado con éxito.' });
  });
});

// 4. Procesar venta desde el Carrito de Compras (Transacción)
app.post('/api/ventas/carrito', (req, res) => {
  const { items } = req.body; // Array de { id, cantidad }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío.' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const ids = items.map(i => i.id);
    const placeholders = ids.map(() => '?').join(',');

    db.all(`SELECT * FROM productos WHERE id IN (${placeholders})`, ids, (err, rows) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }

      let totalVenta = 0;
      const errores = [];

      // Validar disponibilidad de cada ítem
      for (const item of items) {
        const prod = rows.find(r => r.id === item.id);
        if (!prod) {
          errores.push(`Producto ID ${item.id} no existe.`);
        } else if (prod.stock < item.cantidad) {
          errores.push(`Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}, Solicitado: ${item.cantidad}`);
        } else {
          totalVenta += prod.precio * item.cantidad;
        }
      }

      if (errores.length > 0) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: errores.join(' | ') });
      }

      // Descontar inventario
      const stmt = db.prepare('UPDATE productos SET stock = stock - ? WHERE id = ?');
      items.forEach(item => {
        stmt.run(item.cantidad, item.id);
      });

      stmt.finalize((stmtErr) => {
        if (stmtErr) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: stmtErr.message });
        }

        db.run('COMMIT', (commitErr) => {
          if (commitErr) return res.status(500).json({ error: commitErr.message });
          res.json({
            mensaje: 'Compra completada con éxito.',
            articulosVendidos: items.length,
            totalPagar: totalVenta
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de Ferretería corriendo en http://localhost:${PORT}`);
});