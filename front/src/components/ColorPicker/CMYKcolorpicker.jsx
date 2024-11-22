import React, { useState, useEffect, useRef, useCallback } from 'react';

const CMYKColorPicker = ({ onColorChange }) => {
  const [c, setC] = useState(0);
  const [m, setM] = useState(0);
  const [y, setY] = useState(0);
  const [k, setK] = useState(0);
  const [rgb, setRgb] = useState(`rgb(0, 0, 0)`); // Color inicial en RGB
  const canvasRef = useRef(null);

  // Función para convertir CMYK a RGB
  const cmykToRgb = (c, m, y, k) => {
    const r = 255 * (1 - c / 100) * (1 - k / 100);
    const g = 255 * (1 - m / 100) * (1 - k / 100);
    const b = 255 * (1 - y / 100) * (1 - k / 100);
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  };

  // Función para dibujar el gradiente en el canvas
  const drawGradient = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Crear un gradiente que muestra una mezcla de CMYK
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    
    for (let i = 0; i <= 100; i += 10) {
      const { r, g, b } = cmykToRgb(i, 0, 0, 0); // Solo C para el gradiente
      gradient.addColorStop(i / 100, `rgb(${r}, ${g}, ${b})`);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Efecto para dibujar el gradiente en el canvas
  useEffect(() => {
    drawGradient();
  }, [drawGradient]);

  // Efecto para actualizar el color RGB cuando cambian los valores CMYK
  useEffect(() => {
    const { r, g, b } = cmykToRgb(c, m, y, k);
    const rgbColor = `rgb(${r}, ${g}, ${b})`;
    setRgb(rgbColor);
    onColorChange(rgbColor); // Llama a la función de callback con el color RGB
  }, [c, m, y, k, onColorChange]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Selecciona un color CMYK</h2>
      {/* Div que muestra el color resultante */}
      <div 
        style={{ 
          marginBottom: '20px', 
          backgroundColor: rgb, 
          width: '100%', 
          height: '100px', 
          border: '1px solid #000' 
        }} 
      />
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        style={{ border: '1px solid #000', cursor: 'pointer' }}
      />
      
      <div>
        <label>
          C: 
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={c} 
            onChange={(e) => setC(Number(e.target.value))} 
          />
          {Number(c).toFixed(0)}%
        </label><br />
        <label>
          M: 
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={m} 
            onChange={(e) => setM(Number(e.target.value))} 
          />
          {Number(m).toFixed(0)}%
        </label><br />
        <label>
          Y: 
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={y} 
            onChange={(e) => setY(Number(e.target.value))} 
          />
          {Number(y).toFixed(0)}%
        </label><br />
        <label>
          K: 
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={k} 
            onChange={(e) => setK(Number(e.target.value))} 
          />
          {Number(k).toFixed(0)}%
        </label><br />
      </div>
    </div>
  );
};

export default CMYKColorPicker;
