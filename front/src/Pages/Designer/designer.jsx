import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import './designer.css';
import shirt from '../../vendor/imgs/shirtpng.png';
import html2canvas from 'html2canvas';
import { AuthContext } from '../../AuthContext';
import axios from 'axios';
import config from '../../config';
import ContextMenu from '../../components/ContextMenu/ContextMenu';
import { redirect, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';


const Designer = () => {
  
const frontRef = useRef(null); // Para la vista frontal
const backRef = useRef(null);  // Para la vista trasera
  const location = useLocation();
  const { designId } = location.state || {};
  const { isLoggedIn, setIsLoggedIn, openModalNavBar } = useContext(AuthContext);
  const shirtRef = useRef(null);
  const [color, setColor] = useState('#FFFFFF');
  const [pattern, setPattern] = useState('none'); 
  const [texts, setTexts] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [images, setImages] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [paths, setPaths] = useState([]);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [canDraw, setCanDraw] = useState(false);
  const inputFile = useRef(null);   
  const [activeImageId, setActiveImageId] = useState(null);
  const [currentView, setCurrentView] = useState('front');
  const [hasChanges, setHasChanges] = useState(false); //
  const [selectedItem, setSelectedItem] = useState(null);
  const [zindexes,setZindexes]=useState([])
  const {brushColor,setBrushColor}=useState('rgba(56, 117, 109, 1)')
  const [selectedItemType, setSelectedItemType] = useState(null); // 'text', 'shape', 'image', o null
  const Z_DISPONIBLE  = 10000

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuOptions, setContextMenuOptions] = useState([]);



  const [elements, setElements] = useState({ //
    front: {
      texts: [],
      shapes: [],
      images: [],
      paths: [],
    },
    back: {
      texts: [],
      shapes: [],
      images: [],
      paths: [],
    }
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [savedShirtId, setSavedShirtId] = useState(null)
  const [designData, setDesignData] = useState({ //
    color,
    pattern,
    texts,
    shapes,
    images,
    paths,
  });
  //
  useEffect(() => {//ahh dice y xd :V
    const saveDesignToLocalStorage = () => { 
      const storedDesign = localStorage.getItem('design');
      const isDuplicate = storedDesign && JSON.stringify(designData) === storedDesign;
      if (!isDuplicate) {
        localStorage.setItem('design', JSON.stringify(designData));
      }
    };

    saveDesignToLocalStorage();
  }, [color, pattern, texts, shapes, images, paths]);
  useEffect(() => {
    setDesignData({//
      color,
      pattern,
      texts,
      shapes,
      images,
      paths,
    });
    setHasChanges(true); // Marca como cambiado cuando se actualiza el diseño
  }, [color, pattern, texts, shapes, images, paths]);


  /*useEffect(() => { //ORDENAR Z USADO CADA VEZ QUE CAMBIA
    setZindexes((prevZUsado) => [...prevZUsado].sort((a, b) => a - b));
  }, [zindexes])*/

  const nav = useNavigate();

  const getShirt = useCallback(async () => {
   
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${config.url}design/get/${designId}`,
          {
            headers:  {Authorization: `Bearer ${token}`}
          },
        
      );
      console.log("HOLAAA")
      const data = JSON.parse(response.data);


      setColor(data.info.design_data.color || 'rgb(255,255,255)');
      setPattern(data.info.design_data.pattern || 'none');
      setTexts(Array.isArray(data.info.design_data.texts) ? data.info.design_data.texts : []);
      setShapes(Array.isArray(data.info.design_data.shapes) ? data.info.design_data.shapes : []);
      setImages(Array.isArray(data.info.design_data.image) ? data.info.design_data.image : []);
      setPaths(Array.isArray(data.info.design_data.paths) ? data.info.design_data.paths : []);
      
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, [designId]);

  useEffect(() => {

    if (designId) {
      getShirt();
    }
  }, [designId, getShirt]);
  
  const handleColorChange = (e) => setColor(e.target.value); 
  const handlePatternChange = (e) => setPattern(e.target.value);
  const handlePatternColorChange = (e) => document.documentElement.style.setProperty('--pattern-color', e.target.value);

    const addTextInput = () => {
      const z = newObjectZ()
      const newText = { id: Date.now(), text: 'Texto de ejemplo', x: 50, y: 50, z:z, width: 100, height: 50, fontSize: '16px', fontFamily: 'Arial',  view: currentView }
      setTexts(prevTexts => [...prevTexts, newText]);
      setSelectedItem(newText);
    };  

 
  const newObjectZ = () => {
    let z = Math.floor(Z_DISPONIBLE / 2); // Start at the middle

    // Find the closest available z-index
    if (!zindexes.includes(z)) {
      setZindexes((prev) => [...prev, z].sort((a, b) => a - b));
      return z;
    }

    let offset = 1;
    while (true) {
      if (!zindexes.includes(z + offset)) {
        setZindexes((prev) => [...prev, z + offset].sort((a, b) => a - b));
        return z + offset;
      }
      if (!zindexes.includes(z - offset)) {
        setZindexes((prev) => [...prev, z - offset].sort((a, b) => a - b));
        return z - offset;
      }
      offset++;
    }
  };

  const handleClick = (event) => {
    hideContextMenu();
  };
  

  const handleImageDragStart = (id) => {
    setActiveImageId(id);
    setCanDraw(false);
  
  };
  const handleImageResizeStart = (id) => {
    setActiveImageId(id);
    setCanDraw(false);
  
  };
  const removeTextInput = (id) => {
    setTexts(prevTexts => prevTexts.filter((text) => text.id !== id));
    setSelectedItem(null)
  };

  const handleTextChange = (id, newText) => {
    setTexts(prevTexts => prevTexts.map((text) => (text.id === id ? { ...text, text: newText } : text)));
    selectedItem.text = newText
  };

  const handleImageResizeStop = (id, _width,_height, position) => {
    setImages(prevImages => prevImages.map((image) => {
      if (image.id === id) {
        return {
          ...image,
          width: _width,
          height: _height,
          x: position.x,
          y: position.y
        };
      }
      return image;
    }));
    setActiveImageId(null);
  };
  

  const handleTextDragStop = (id, x, y) => {
    setTexts(prevTexts => prevTexts.map((text) => (text.id === id ? { ...text, x, y } : text)));
  };

  const handleTextResizeStop = (id, width, height) => {
    setTexts(prevTexts => prevTexts.map((text) => 
      text.id === id ? { ...text, width, height } : text
    ));
  };

  const handleFontColorChange = (id, color) => {
    setTexts(prevTexts => prevTexts.map((text) => (text.id === id ? { ...text, color } : text)));
  };

  const handleFontSizeChange = (id, fontSize) => {
    const newFontSize = parseInt(fontSize, 10);
    fontSize = newFontSize > 100 ? "100px" : `${newFontSize}px`;
    fontSize = newFontSize < 0 ? "0" : `${newFontSize}px`;
    setTexts(prevTexts => prevTexts.map((text) => (text.id === id ? { ...text, fontSize } : text)));
    selectedItem.fontSize = fontSize
  };

  const handleFontFamilyChange = (id, family) => {
    setTexts(prevTexts => prevTexts.map((text) => (text.id === id ? { ...text, fontFamily: family } : text)));
  };

  const addShape = () => {
    const z = newObjectZ()
    const newShape={ id: Date.now(), shape: 'square', x: 50, y: 50,z:z, width: 50, height: 50,  view: currentView }
    setShapes(prevShapes => [...prevShapes, newShape]);
    setSelectedItem(newShape)
  };
  const setDrawFalse = () =>{
    setCanDraw(false)
   // setBrushColor('rgba(56, 117, 109, 1)')//que hace esto? cuando esta puesto da error (setBrushColor is not a function)
  }
  const setDrawTrue = () =>{
    setCanDraw(false)
   // setBrushColor('rgb(68, 138, 128)')
  }
  const setDraw616Southside = (_op) =>{
    setCanDraw(_op)
    const defBrushColor = (brushColor === 'rgba(56, 117, 109, 1)' ? 'rgb(68, 138, 128)' : 'rgba(56, 117, 109, 1)')
    //setBrushColor('' + defBrushColor) //que hace esto? cuando esta puesto da error (setBrushColor is not a function)
    // setBrushColor('defBrushColor')
  }
  const addImage = (event) => {
    const z = newObjectZ()
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImages(prevImages => [...prevImages, { 
        id: Date.now(), 
        src: reader.result, 
        name: file.name, 
        x: 50, 
        y: 50, 
        z: z,
        width: 100, 
        height: 100,
        view: currentView
      }]);
      const newImage= { 
        id: Date.now(), 
        src: reader.result, 
        name: file.name, 
        x: 50, 
        y: 50, 
        width: 100, 
        height: 100,
        view: currentView
      };
      setSelectedItem(newImage)
    };
  
      if (event.target.files[0]) {
          // ...
          event.target.value = "";
      }
  
    reader.readAsDataURL(file);

  };
  const renderPaths = () => {
    return paths
      .filter((path) => path.view === currentView)
      .map((path) => (
        <g key={path.id || Math.random()}>
          <path
            d={`M ${path.points[0].x} ${path.points[0].y} ${path.points
              .slice(1)
              .map(p => `L ${p.x} ${p.y}`)
              .join(' ')}`}
            stroke={path.color}
            strokeWidth={path.size}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ 
              zIndex: path.z || Z_DISPONIBLE,
              pointerEvents: canDraw ? 'none' : 'auto'
            }}
          />
          <path
            d={`M ${path.points[0].x} ${path.points[0].y} ${path.points
              .slice(1)
              .map(p => `L ${p.x} ${p.y}`)
              .join(' ')}`}
            stroke="transparent"
            strokeWidth={Math.max(10, path.size + 5)}
            fill="none"
            style={{ 
              cursor: 'pointer',
              pointerEvents: canDraw ? 'none' : 'auto',
              zIndex: path.z || Z_DISPONIBLE // Ensure z-index is applied to the hit area
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectItem(path, 'path');
            }}
            onContextMenu={(e) => handleRightClickOnItem(e, path, "path")}
          />
        </g>
      ));
  };

  const moveItem = (id, direction, type) => {
    // Get all z-indexes from all elements, ensuring paths are included correctly
    const allZIndexes = [
      ...texts.map(t => ({ z: t.z || 0, id: t.id, type: 'text' })),
      ...shapes.map(s => ({ z: s.z || 0, id: s.id, type: 'shape' })),
      ...images.map(i => ({ z: i.z || 0, id: i.id, type: 'image' })),
      ...paths.map(p => ({ z: p.z || 0, id: p.id, type: 'path' }))
    ].sort((a, b) => a.z - b.z);

    const currentItemIndex = allZIndexes.findIndex(item => item.id === id && item.type === type);
    if (currentItemIndex === -1) return;

    let newZ;
    switch (direction) {
      case "sendBack":
        newZ = Math.min(...allZIndexes.map(item => item.z)) - 1;
        break;
      case "bringFront":
        newZ = Math.max(...allZIndexes.map(item => item.z)) + 1;
        break;
      case "up":
        if (currentItemIndex < allZIndexes.length - 1) {
          newZ = allZIndexes[currentItemIndex + 1].z + 1;
        }
        break;
      case "down":
        if (currentItemIndex > 0) {
          newZ = allZIndexes[currentItemIndex - 1].z - 1;
        }
        break;
      default:
        return;
    }

    // Ensure newZ is defined before proceeding
    if (typeof newZ !== 'number') return;

    // Update the item based on its type
    switch (type) {
      case "text":
        setTexts(prev => prev.map(item => 
          item.id === id ? { ...item, z: newZ } : item
        ));
        break;
      case "shape":
        setShapes(prev => prev.map(item => 
          item.id === id ? { ...item, z: newZ } : item
        ));
        break;
      case "image":
        setImages(prev => prev.map(item => 
          item.id === id ? { ...item, z: newZ } : item
        ));
        break;
        case "path":
        setPaths(prev => prev.map(path => 
          path.id === id ? { ...path, z: newZ } : path
        ));
        // Update selectedItem if it's the current path
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(prev => ({ ...prev, z: newZ }));
        }
        break;
    }

    // Update zindexes state
    setZindexes(prev => [...prev.filter(z => z !== allZIndexes[currentItemIndex].z), newZ].sort((a, b) => a - b));
  };
  const handleImageDragStop = (id, x, y) => {
    setImages(prevImages => prevImages.map((image) => 
      (image.id === id ? { ...image, x, y } : image)
    ));
  };
  
  const removeImage = (id) => {
    setImages(prevImages => prevImages.filter((image) => image.id !== id));
    setSelectedItem(null)
  };

  const removeShape = (id) => {
    setShapes(prevShapes => prevShapes.filter((shape) => shape.id !== id));
    setSelectedItem(null)   
  };
  


  const handleShapeChange = (id, newShape) => {
    setShapes(prevShapes => prevShapes.map((shape) => (shape.id === id ? { ...shape, shape: newShape } : shape)));
    selectedItem.shape = newShape
  };

  const handleShapeDragStop = (id, x, y) => {
    setShapes(prevShapes => prevShapes.map((shape) => shape.id === id ? { ...shape, x, y } : shape));
  };

  const handleShapeResizeStop = (id, width, height) => {
    setShapes(prevShapes => prevShapes.map((shape) => shape.id === id ? { ...shape, width, height } : shape));
  };
  
  
  const handleDrawStart = (event) => {
    if (!canDraw) return;
    
    setIsDrawing(true);
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Get current highest z-index
    const allZIndexes = [
      ...texts.map(t => t.z || 0),
      ...shapes.map(s => s.z || 0),
      ...images.map(i => i.z || 0),
      ...paths.map(p => p.z || 0)
    ];
    
    const newZ = allZIndexes.length > 0 ? Math.max(...allZIndexes) + 1 : Z_DISPONIBLE;
    
    const newPath = {
      id: Date.now(),
      points: [{x, y}],
      color: drawingColor,
      size: brushSize,
      view: currentView,
      z: newZ
    };
    
    setCurrentPath(newPath);
    setZindexes(prev => [...prev, newZ].sort((a, b) => a - b));
  };
  const handleDrawMove = useCallback((event) => {
    if (!isDrawing || !canDraw) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setCurrentPath(prevPath => {
      if (!prevPath) return null;
      return {
        ...prevPath,
        points: [...prevPath.points, {x, y}]
      };
    });
  }, [isDrawing, canDraw]);
  
  const handleDrawEnd = () => {
    if (!isDrawing || !currentPath) return;
    
    setPaths(prevPaths => [...prevPaths, currentPath]);
    setCurrentPath(null);
    setIsDrawing(false);
  };
  const handleBrushSizeChange = (e) => {
    setBrushSize(parseInt(e.target.value));
  };
  const handleSelectItem = (item, type) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setCanDraw(false); // Disable drawing when selecting an item
  };
  const handlePathColorChange = (id, newColor) => {
    setPaths(prevPaths => prevPaths.map(path => 
      path.id === id ? { ...path, color: newColor } : path
    ));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, color: newColor }));
    }
  };
  const handlePathSizeChange = (id, newSize) => {
    setPaths(prevPaths => prevPaths.map(path => 
      path.id === id ? { ...path, size: newSize } : path
    ));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => ({ ...prev, size: newSize }));
    }
  };
  const removePath = (id) => {
    setPaths(prevPaths => prevPaths.filter(path => path.id !== id));
    setSelectedItem(null);
    setSelectedItemType(null);
  };
  const clearSelection = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
  };
 
 
  const [isLoading, setIsLoading] = useState(false);

  const handleCapture = async () => { 
    if (shirtRef.current && isLoggedIn) {
      try {
        setIsLoading(true);
        clearSelection()
        const currentViewThatWas = currentView
  
        // Capturar vista frontal
        setCurrentView('front')
        await new Promise(resolve => setTimeout(resolve, 100));
        const canvas1 = await html2canvas(shirtRef.current, {
          ignoreElements: (element) => {
            // This will exclude the loading modal from the screenshot
            return element.classList.contains('modal-overlay');
          }
        });
        const dataUrl1 = canvas1.toDataURL('image/jpeg', 0.8);
        
        // Capturar vista trasera
        setCurrentView('back')
        await new Promise(resolve => setTimeout(resolve, 100));
        const canvas2 = await html2canvas(shirtRef.current, {
          ignoreElements: (element) => {
            // This will exclude the loading modal from the screenshot
            return element.classList.contains('modal-overlay');
          }
        });
        const dataUrl2 = canvas2.toDataURL('image/jpeg', 0.8);
        
        setCurrentView(currentViewThatWas)
        saveImage(dataUrl1, dataUrl2);
        modalPublish();
        setHasChanges(false);
      } catch (error) {
        console.error('Error capturing design', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      openModalNavBar()
    }
  };
  // Add this to your return statement, after the existing modals
  
  const modalPublish = () => {
    setModalVisible(true);
  }

  const handleModalClose = () => {
    setModalVisible(false)
  }

  const handlePublicar = () => {
    nav(`/NewPost/${savedShirtId}`)
    
  }

  const saveImage = (dataUrl1, dataUrl2) => {
    const link = document.createElement('a');
  //  link.href = dataUrl1;
  //console.log("LLEGO HASTA ACA VIVO",link) //ey a vos te aparece el user en la navbar o vacio? desaparecio, quiza error mio pero yo cambie back solo ok a ver
    link.addEventListener('click', (e) => {
      e.preventDefault();
      saveShirt(dataUrl1,dataUrl2);
    });
  
    link.click();
    setHasChanges(false)
  }

  const saveShirt = async (dataUrl1,dataUrl2) => {
    const designData = {
      color,
      pattern,
      texts,
      shapes,
      images,
      paths, 
    };

    const designJSON = JSON.stringify(designData);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${config.url}design/save`, { designId: designId, front_image: dataUrl1,back_image: dataUrl2, designData: designJSON }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data)
      setSavedShirtId(response.data)
    } catch (error) {
  //   console.log("EL ERROR ESTA AQUIIIIII")
      console.error('Error saving shirt:', error);
    }
  };

  const showContextMenu = (event) => {
    // Get the shirt element's bounds
    const shirtElement = shirtRef.current;
    if (!shirtElement) return;
    
    const shirtRect = shirtElement.getBoundingClientRect();
    
    // Check if click is inside the shirt bounds
    if (
      event.clientX >= shirtRect.left &&
      event.clientX <= shirtRect.right &&
      event.clientY >= shirtRect.top &&
      event.clientY <= shirtRect.bottom
    ) {
      event.preventDefault(); // Only prevent default if click is inside shirt
      setContextMenuPosition({ x: event.pageX, y: event.pageY });
      setContextMenuOptions([
        { label: 'Add Text', action: addTextOption },
        { label: 'Add Shape', action: addShapeOption },
      ]);
      setContextMenuVisible(true);
    }
  };

  const hideContextMenu = () => {
    setContextMenuVisible(false);
  };

  const addTextOption = () => {
    addTextInput()
    hideContextMenu();
  };

  const addShapeOption = () => {
    addShape()
    hideContextMenu();
  };

  

  const handleRightClickOnItem = (event, item,type) => {
    event.preventDefault();
    event.stopPropagation()
    setContextMenuPosition({ x: event.pageX, y: event.pageY });
    setContextMenuOptions([
      { label: 'Adelante', action: () =>  moveItem(item.id,"up",type) },
      { label: 'Atras', action: () =>  moveItem(item.id,"down",type) },
      { label: 'Traer al frente', action: () =>  moveItem(item.id,"bringFront",type) },
      { label: 'Enviar al fondo', action: () =>  moveItem(item.id,"sendBack",type) },
    ]);
    setContextMenuVisible(true);
  };

 
  return (
    <>
    {isLoading && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Guardando diseño...</h2>
          <p>Por favor, espera un momento</p>
        </div>
      </div>
    )}
    <div className="designer" onClick={handleClick}>
      <h2>Crea un Diseño</h2>
      
      <div className="view-controls">
        <button 
          className={`view-button ${currentView === 'front' ? 'active' : ''}`}
          onClick={() => {setCurrentView('front');clearSelection()}}
          
        >
          Vista Frontal
        </button>
        <button 
          className={`view-button ${currentView === 'back' ? 'active' : ''}`}
          onClick={() => {setCurrentView('back'); clearSelection()}}
        >
          Vista Trasera
        </button>
      </div>
     
<div className="_616southside"> <div className="controls">
        <label>
          Color:
          <input type="color" value={color} onChange={handleColorChange} />
        </label>
        <label>
          Patrón:
          <select value={pattern} onChange={handlePatternChange}>
            <option value="none">Ninguno</option>
            <option value="stripes">Rayas</option>
            <option value="dots">Puntos</option>
            <option value="diagonal-stripes">Rayas Diagonales</option>
            <option value="grid">Cuadrícula</option>
            <option value="zigzag">Zig Zag</option>
          </select>
        </label>
        <label>
          Color del Patrón:
          <input type="color" onChange={handlePatternColorChange} />
        </label>
        <button className="designer-button" onClick={addTextInput}>+ Texto</button>
        
        <button className="designer-button" onClick={addShape}>+ Forma</button>
        
         {/* Imágenes */}
      
         <label for="file-upload" className='designer-button'>+ Imagen</label>
<input className='inputParaEsconder' type="file" id="file-upload" onChange={addImage} accept="image/*" />

      

        {/* Pincel */}
      <button className={`designer-button ${canDraw ? 'active' : ''}`} onClick={() => setDraw616Southside(!canDraw)} style={{backgroundColor:{brushColor}}}  >
        {canDraw ? '✏️' : '✏️'}
      </button>
      <label>
        Color del Dibujo:
        <input type="color" value={drawingColor} onChange={(e) => setDrawingColor(e.target.value)} />
      </label>
      <label>
        Tamaño del Pincel:
        <input type="range" min="1" max="20" value={brushSize} onChange={handleBrushSizeChange} />
        {brushSize}px
      </label>
    </div>
    {selectedItem !== null && (
      <div className="properties-panel">
        <div className='properties'>
          <h3>Propiedades</h3>
      {selectedItem.fontSize &&
        (
          
          <div key={selectedItem.id}>
              <label>
                Texto
            <input
              type="text"
              className="gamer"
              value={selectedItem.text}
              onChange={(e) => handleTextChange(selectedItem.id, e.target.value)}
            />
              </label>
            <label>
              Color de fuente
              <input
                type="color"
                value={selectedItem.color}
                onChange={(e) => handleFontColorChange(selectedItem.id, e.target.value)}
              />
            </label>
            <label>
              Tamaño de fuente
              <input
                type="number"
                value={parseInt(selectedItem.fontSize, 10)}
                onChange={(e) => handleFontSizeChange(selectedItem.id, `${e.target.value}px`)}
              />
            </label>
            <label>
              Fuente
              <select
                value={selectedItem.fontFamily}
                onChange={(e) => handleFontFamilyChange(selectedItem.id, e.target.value)}
              >
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>
            </label>
            <button className="designer-button" onClick={() => removeTextInput(selectedItem.id)}>Eliminar</button>
          </div>
        
        )
        
        }
        
        
      {selectedItem.src && (
      
            <div key={selectedItem.id}>
              
              
              <p>{selectedItem.name}</p>
              <button className="designer-button" onClick={() => removeImage(selectedItem.id)}>Eliminar Imagen</button>
            </div>
          )}
     {selectedItem.shape &&
        (
          <div key={selectedItem.id}>
            <select
              value={selectedItem.shape}
              onChange={(e) => handleShapeChange(selectedItem.id, e.target.value)}
            >
              <option value="square">Cuadrado</option>
              <option value="circle">Círculo</option>
            </select>
            <button className="designer-button" onClick={() => removeShape(selectedItem.id)}>-</button>
          </div>
        )}
      {selectedItemType === 'path' && (
            <div key={selectedItem.id}>
              <label>
                Color del trazo
                <input
                  type="color"
                  value={selectedItem.color}
                  onChange={(e) => handlePathColorChange(selectedItem.id, e.target.value)}
                />
              </label>
              <label>
                Grosor del trazo
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={selectedItem.size}
                  onChange={(e) => handlePathSizeChange(selectedItem.id, parseInt(e.target.value))}
                />
                {selectedItem.size}px
              </label>
              <button className="designer-button" onClick={() => removePath(selectedItem.id)}>
                Eliminar trazo
              </button>
            </div>
          )}
        </div>
      </div>
    )}</div>
      

      <div 
        className="preview"
        onClick={(e) => {
          clearSelection();
          hideContextMenu();
        }}
        onMouseDown={(e) => {
          if (canDraw) handleDrawStart(e);
        }}
        onMouseMove={handleDrawMove}
        onMouseUp={handleDrawEnd}
        onMouseLeave={handleDrawEnd}
      >
        <div 
          className={`shirt ${currentView}`} 
          ref={shirtRef}
          onContextMenu={showContextMenu}
          style={{ position: 'relative', zIndex: 1 }} // Ensure shirt is above other elements
        >
        <svg 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: canDraw ? 'auto' : 'none',
        zIndex: Z_DISPONIBLE - 1
      }}
    >
      {renderPaths()}
      {currentPath && currentPath.view === currentView && (
        <path
          d={`M ${currentPath.points[0].x} ${currentPath.points[0].y} ${currentPath.points
            .slice(1)
            .map(p => `L ${p.x} ${p.y}`)
            .join(' ')}`}
          stroke={currentPath.color}
          strokeWidth={currentPath.size}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ zIndex: currentPath.z }}
        />
      )}
    </svg>
    
          <img
            src={shirt}
            alt={`Shirt ${currentView} view`}
            className="shirt-image"
            style={{ transform: currentView === 'back' ? 'scaleX(-1)' : 'none' }}
          />
          <div className="color-overlay" style={{ backgroundColor: color }}></div>
          <div className={`pattern-overlay ${pattern}`}></div>
          <div className={`design-elements ${currentView}`}>
    {texts && texts
      .filter((text) => text.view === currentView)
      .map((text) => (
        <Rnd
          key={text.id}
          onContextMenu={(e) => handleRightClickOnItem(e, text, "text")}
          size={{ width: text.width, height: 'auto' }} // Set height to auto
          position={{ x: text.x, y: text.y }}
          style={{ 
            zIndex: text.z,
            pointerEvents: selectedItem ? (selectedItem.id === text.id ? 'auto' : 'none') : 'auto'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectItem(text, 'text');
          }}
          bounds=".shirt"
          onDragStart={() => setDrawFalse()}
          onDragStop={(e, d) => handleTextDragStop(text.id, d.x, d.y)}
          onResizeStop={(e, direction, ref, delta, position) => {
            handleTextResizeStop(text.id, parseInt(ref.style.width, 10), parseInt(ref.style.height, 10));
            handleTextDragStop(text.id, position.x, position.y);
          }}
          enableResizing={{ right: true, left: true }} // Restrict resizing to horizontal only
          disableDragging={!selectedItem || selectedItem.id !== text.id}
        >
          <div
            className="text-overlay"
            style={{ 
              fontSize: text.fontSize, 
              fontFamily: text.fontFamily, 
              width: '100%', 
              height: '100%', 
              color: text.color,
              border: selectedItem && selectedItem.id === text.id ? '2px dashed rgba(56, 117, 109, 1)' : 'none',
              wordWrap: 'break-word', // Ensure text wraps within its container
              overflow: 'hidden', // Hide overflow text
              whiteSpace: 'pre-wrap', // Ensure text goes to a new line within its container
              wordBreak: 'break-all' // Ensure long words also wrap within the container
            }}
          >
            {text.text}
          </div>
        </Rnd>
      ))}

    {shapes && shapes
      .filter((shape) => shape.view === currentView)
      .map((shape) => (
        <Rnd
          key={shape.id}
          onContextMenu={(e) => handleRightClickOnItem(e, shape, "shape")}
          size={{ width: shape.width, height: shape.height }}
          position={{ x: shape.x, y: shape.y }}
          style={{ 
            zIndex: shape.z,
            pointerEvents: selectedItem ? (selectedItem.id === shape.id ? 'auto' : 'none') : 'auto'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectItem(shape, 'shape');
          }}
          bounds=".shirt"
          onDragStart={() => setDrawFalse()}
          onDragStop={(e, d) => handleShapeDragStop(shape.id, d.x, d.y)}
          onResizeStop={(e, direction, ref, delta, position) => {
            handleShapeResizeStop(shape.id, parseInt(ref.style.width, 10), parseInt(ref.style.height, 10));
            handleShapeDragStop(shape.id, position.x, position.y);
          }}
          enableResizing={selectedItem && selectedItem.id === shape.id}
          disableDragging={!selectedItem || selectedItem.id !== shape.id}
        >
          <div
            className={`shape-overlay ${shape.shape}`}
            style={{ 
              width: '100%', 
              height: '100%',
              border: selectedItem && selectedItem.id === shape.id ? '2px dashed rgba(56, 117, 109, 1)' : 'none'
            }}
          />
        </Rnd>
      ))}

    {images && images
      .filter((image) => image.view === currentView)
      .map((image) => (
        <Rnd
          key={image.id}
          onContextMenu={(e) => handleRightClickOnItem(e, image, "image")}
          size={{ width: image.width, height: image.height }}
          position={{ x: image.x, y: image.y }}
          style={{ 
            zIndex: image.z,
            pointerEvents: selectedItem ? (selectedItem.id === image.id ? 'auto' : 'none') : 'auto'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectItem(image, 'image');
          }}
          bounds=".shirt"
          onDragStart={() => setDrawFalse()}
          onDragStop={(e, d) => handleImageDragStop(image.id, d.x, d.y)}
          onResizeStop={(e, direction, ref, delta, position) => {
            handleImageResizeStop(image.id, ref.style.width, ref.style.height, position);
          }}
          enableResizing={selectedItem && selectedItem.id === image.id}
          disableDragging={!selectedItem || selectedItem.id !== image.id}
        >
          <img 
            draggable={false}
            src={image.src} 
            alt={image.name}
            className='image-added'
            style={{ 
              width: '100%', 
              height: '100%',
              border: selectedItem && selectedItem.id === image.id ? '2px dashed rgba(56, 117, 109, 1)' : 'none'
            }}
          />
        </Rnd>
      ))}
        </div>
      </div>
      
      {hasChanges ? (
      <div className="centrador">
        <button className="designer-button" onClick={handleCapture}>
          Guardar diseño
        </button>
      </div>
    ) : (
      <h3 className='guardadoCoso'>Diseño guardado.</h3> // Mensaje cuando no hay cambios
    )}
     {contextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          position={contextMenuPosition}
          onClose={hideContextMenu}
          style={{ zIndex: Z_DISPONIBLE + 1 }} // Ensure context menu is above everything
        />
      )}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            <h2>¡Diseño guardado!</h2>
            <p>¿Quieres publicarlo?</p>
            <div className="modal-actions">
              <button onClick={handlePublicar}>Sí</button>
              <button onClick={handleModalClose}>No</button>
            </div>
          </div>
          </div> 
      )}
    </div>
        </div>
        </>
  );
};

export default Designer;