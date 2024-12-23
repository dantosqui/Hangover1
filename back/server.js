import express from 'express';
import cors from 'cors';
import multer from 'multer';
import PostsController from './src/controllers/post-controller.js';
import UsersController from './src/controllers/user-controller.js';
import DesignController from './src/controllers/design-controller.js';
import ImageController from './src/controllers/image-controller.js';
import PaymentController from './src/controllers/payment-controller.js';
import PurchaseController from './src/controllers/purchase-controller.js';
import ChatController from './src/controllers/chat-controller.js';
import http from 'http';
import path from 'path';
import url from 'url';
import { AuthMiddleware } from './src/auth/authMiddleware.js';
import setupSocketServer from './src/socket/socket.js';
import fs from 'fs';

// Obtener la ruta del directorio actual
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer para el almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Almacena las imágenes en el directorio public/images del backend
    const uploadDir = path.join(__dirname, 'public', 'images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}-${timestamp}${extension}`);
  }
});

// Configuración del filtro de archivos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

const app = express();
const server = http.createServer(app);

// Configuraciones de CORS y middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Servir archivos estáticos de imágenes
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Middleware para manejar errores de multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.'
      });
    }
    return res.status(400).json({
      error: 'Error en la subida del archivo: ' + err.message
    });
  }
  next(err);
});

// Ruta para subir imágenes
app.post('/vendor/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se ha proporcionado ningún archivo" });
  }
  // Responde con el nombre del archivo subido
  res.json({ filename: req.file.filename });
});

// Rutas de controladores (resto del código permanece igual)
app.use("/post", PostsController);
app.use("/user", UsersController);
app.use("/design", DesignController);
app.use("/image", ImageController);
app.use("/payment", PaymentController);
app.use("/purchase", PurchaseController);
app.use("/chat", ChatController);

const io = setupSocketServer(server);

const port = 3508;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});