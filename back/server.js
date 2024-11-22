// server.js
import express from 'express';
import cors from 'cors';
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
import setupSocketServer from './src/socket/socket.js'; // Importa la configuración de socket.io

// Obtener la ruta del directorio actual
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Configura las rutas para la API REST
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

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

/*import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import PostsController from './src/controllers/post-controller.js';
import UsersController from './src/controllers/user-controller.js';
import DesignController from './src/controllers/design-controller.js';
import ImageController from './src/controllers/image-controller.js';
import PaymentController from './src/controllers/payment-controller.js';
import PurchaseController from './src/controllers/purchase-controller.js';
import ChatController from './src/controllers/chat-controller.js';

import { AuthMiddleware } from './src/auth/authMiddleware.js';
import setupSocketServer from './src/socket/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Configuración de CORS
app.use(cors({ origin: 'http://localhost:3000' }));

// Configuración de parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use("/post", PostsController);
app.use("/user", UsersController);
app.use("/design", DesignController);
app.use("/image", ImageController);
app.use("/payment", PaymentController);
app.use("/purchase", PurchaseController);
app.use("/chat", ChatController);

// Configuración de Socket.io
const io = setupSocketServer(server);

const port = 3508;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});*/