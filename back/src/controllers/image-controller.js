import express from 'express';
import multer from 'multer';
import shortid from 'shortid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });  // Configuración de multer para almacenar archivos

const unlinkAsync = promisify(fs.unlink);

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const shortUrl = `${shortid.generate()}.jpg`;

    // Mover el archivo al directorio final
    fs.renameSync(filePath, path.join('public/uploads', shortUrl));

    // Aquí puedes implementar la lógica para almacenar la URL en una base de datos, si es necesario

    res.json({ shortUrl: `/uploads/${shortUrl}` });
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    res.status(500).send('Error al procesar la imagen.');
  }
});

export default router;
