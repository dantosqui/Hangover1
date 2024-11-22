//placeholder pagina
import React from 'react';

const Bolsa = () => {
  // Lista de productos disponibles
  const products = [
    { id: 1, name: 'Producto 1', price: 10.99 },
    { id: 2, name: 'Producto 2', price: 15.49 },
    { id: 3, name: 'Producto 3', price: 8.99 },
    { id: 4, name: 'Producto 4', price: 12.49 },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tienda</h1>

      <h2>Productos</h2>
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
        {products.map(product => (
          <div key={product.id} style={{ margin: '10px 0' }}>
            <span>{product.name} - ${product.price.toFixed(2)}</span>
            <button style={{ marginLeft: '10px' }}>Agregar al Carrito</button>
          </div>
        ))}
      </div>

      <h2>Carrito de Compras</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', minHeight: '100px' }}>
        <p>El carrito está vacío.</p>
      </div>
    </div>
  );
};

export default Bolsa;
