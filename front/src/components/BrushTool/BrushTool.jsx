import React, { useState, useEffect, useRef } from 'react';

const BrushTool = ({ canvasRef, backgroundImage, drawImageOnTop, brushColor, brushSize, setDrawings, getMousePos }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef(null);
  const currentStroke = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!canvas || !context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';

    const startDrawing = (e) => {
      const { x, y } = getMousePos(canvas, e);
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);

      currentStroke.current = {
        color: brushColor,
        size: brushSize,
        points: [{x, y}]
      };
      lastPoint.current = { x, y };
    };

    const draw = (e) => {
      if (!isDrawing) return;

      const { x: newX, y: newY } = getMousePos(canvas, e);
      const { x: lastX, y: lastY } = lastPoint.current;

      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(newX, newY);
      context.stroke();

      currentStroke.current.points.push({x: newX, y: newY});
      lastPoint.current = { x: newX, y: newY };

      if (backgroundImage) {
        drawImageOnTop(backgroundImage);
      }
    };

    const stopDrawing = () => {
      setIsDrawing(false);

      if (currentStroke.current) {
        setDrawings((prevDrawings) => [
          ...prevDrawings,
          currentStroke.current
        ]);

        currentStroke.current = null;
        lastPoint.current = null;
      }
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, [brushColor, brushSize, isDrawing, canvasRef, backgroundImage, drawImageOnTop, setDrawings, getMousePos]);

  return <></>;
};

export default BrushTool;