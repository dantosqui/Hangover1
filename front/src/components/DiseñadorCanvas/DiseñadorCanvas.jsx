import React, { useRef, useState, useEffect } from 'react';
import shirt from '../vendor/imgs/shirtpng.png';
import './DiseñadorCanvas.css';
import { Rnd } from 'react-rnd';
const DiseñadorCanvas = () => {
  const canvasRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [drawingActions, setDrawingActions] = useState([]);
  const [texts, setTexts] = useState([]);
  const [canDraw,setCanDraw] = useState(false)
  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 333;
  const SCALE = 2;

  useEffect(() => {
    const img = new Image();
    img.src = shirt;
    img.onload = () => {
      setBackgroundImage(img);
      redrawCanvas();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = CANVAS_WIDTH * SCALE;
      canvas.height = CANVAS_HEIGHT * SCALE;
      canvas.style.width = `${CANVAS_WIDTH}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;
      const context = canvas.getContext('2d');
      context.scale(SCALE, SCALE);
      redrawCanvas();
    }
  }, [backgroundColor, backgroundImage, drawingActions]);
  const handleTextChange = (id, newText) => {
    setTexts(texts.map((text) => (text.id === id ? { ...text, text: newText } : text)));
  };

  const handleTextDragStop = (id, x, y) => {
    setTexts(texts.map((text) => (text.id === id ? { ...text, x, y } : text)));
  };

  const handleTextResizeStop = (id, width, height) => {
    const newFontSize = Math.min(width, height) / 5; // Adjust as needed
    setTexts(texts.map((text) => (text.id === id ? { ...text, width, height, fontSize: `${newFontSize}px` } : text)));
  };
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (canvas && context) {
      // 1. Dibujar el color de fondo
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Dibujar el pincel (las acciones de dibujo)
      drawingActions.forEach(action => {
        context.beginPath();
        context.moveTo(action.start.x, action.start.y);
        context.lineTo(action.end.x, action.end.y);
        context.strokeStyle = action.color;
        context.lineWidth = action.brushSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.stroke();
      });

      // 3. Dibujar la imagen de la remera
      if (backgroundImage) {
        drawBackground(backgroundImage);
      }
    }
  };

  const handleBackgroundColorChange = (e) => {
    setBackgroundColor(e.target.value);
  };

  const drawBackground = (img) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = true;

    if (canvas && context) {
      const aspectRatio = img.width / img.height;
      let drawWidth = CANVAS_WIDTH;
      let drawHeight = CANVAS_HEIGHT;
      
      if (aspectRatio > CANVAS_WIDTH / CANVAS_HEIGHT) {
        drawHeight = CANVAS_WIDTH / aspectRatio;
      } else {
        drawWidth = CANVAS_HEIGHT * aspectRatio;
      }
      
      const offsetX = (CANVAS_WIDTH - drawWidth) / 2;
      const offsetY = (CANVAS_HEIGHT - drawHeight) / 2;
      
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  };

  const handleBrushSizeChange = (e) => {
    setBrushSize(parseInt(e.target.value));
  };

  const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) * (CANVAS_WIDTH / rect.width),
      y: (evt.clientY - rect.top) * (CANVAS_HEIGHT / rect.height)
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    setLastPoint(getMousePos(canvasRef.current, e));
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const currentPoint = getMousePos(canvasRef.current, e);

    setDrawingActions(prevActions => [
      ...prevActions,
      {
        start: lastPoint,
        end: currentPoint,
        color: drawingColor,
        brushSize: brushSize
      }
    ]);

    setLastPoint(currentPoint);
  };
  const handleFontColorChange = (id, color) => {
    setTexts(texts.map((text) => (text.id === id ? { ...text, color } : text)));
  };
  const removeTextInput = (id) => {
    setTexts(texts.filter((text) => text.id !== id));
  };

  const handleFontSizeChange = (id, fontSize) => {
    const newFontSize = parseInt(fontSize, 10);
    if (newFontSize > 100) {
      fontSize = "60px";
    } else {
      fontSize = `${newFontSize}px`;
    }
    setTexts(texts.map((text) => (text.id === id ? { ...text, fontSize } : text)));
  };

  const handleFontFamilyChange = (id, family) => {
    setTexts(texts.map((text) => (text.id === id ? { ...text, fontFamily: family } : text)));
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };
  const addTextInput = () => {
    setTexts([...texts, { id: Date.now(), text: '', x: 50, y: 50, width: 100, height: 50, fontSize: '16px', fontFamily: 'Arial' }]);
};
  return (
    <div>
      <h1>Diseñador</h1>
      <label>
        Color de fondo:
        <input type="color" value={backgroundColor} onChange={handleBackgroundColorChange} />
      </label>
      <button class="designer-button" onClick={addTextInput}>+ Text</button>
      <label>
        Tamaño del pincel:
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={handleBrushSizeChange}
        />
        {brushSize}px
      </label>
      <label>
        Color de dibujo:
        <input type="color" value={drawingColor} onChange={(e) => setDrawingColor(e.target.value)} />
      </label>
      <div className="canvasClass">
        <canvas
          ref={canvasRef}
          style={{
            border: '1px solid black',
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
        >
           </canvas>
           {texts && texts.map((text) => (
          <div key={text.id}>
            <input type="text" value={text.text} onChange={(e) => handleTextChange(text.id, e.target.value)} />
            <button class="designer-button" onClick={() => removeTextInput(text.id)}>-</button>
            <label>
              Font Color:
              <input
                type="color"
                value={text.color}
                onChange={(e) => handleFontColorChange(text.id, e.target.value)}
              />
            </label>
            <label>
              Font Size:
              <input
                type="number"
                value={parseInt(text.fontSize, 10)}
                onChange={(e) => handleFontSizeChange(text.id, `${e.target.value}px`)}
              />
            </label>
            <label>
              Font Family:
              <select
                value={text.fontFamily}
                onChange={(e) => handleFontFamilyChange(text.id, e.target.value)}
              >
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>
            </label>
          </div>
        ))}
          {texts && texts.map((text) => (
          <Rnd
            key={text.id} 
            size={{ width: text.width, height: text.height }}
            position={{ x: text.x, y: text.y }}
            bounds=".shirt"
           // onDragStart={() => setCanDraw(false)}
            onDragStop={(e, d) => handleTextDragStop(text.id, d.x, d.y)}
            onResizeStop={(e, direction, ref, delta, position) => {
              handleTextResizeStop(text.id, parseInt(ref.style.width, 10), parseInt(ref.style.height, 10));
              handleTextDragStop(text.id, position.x, position.y);
            }}
            enableResizing={{
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }}
          >
            <div
              className="text-overlay"
              style={{ fontSize: text.fontSize, fontFamily: text.fontFamily, width: '100%', height: '100%', color: text.color }}
            >
              {text.text}
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  );
};

export default DiseñadorCanvas;