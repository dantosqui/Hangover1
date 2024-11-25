import  express from "express";
import { AuthMiddleware } from "../auth/authMiddleware.js";
import DesignService from "../services/design-service.js"

const router = express.Router()
const designService = new DesignService()

router.get("/get/:id", AuthMiddleware, async (req, res) => {
    
    const user = req.user.id;
    const designId = req.params.id;
    console.log("user",user,designId)
    const design = await designService.get(user, designId);
    if(design === false){
        return res.status(401).send();
    }else{
        return res.status(200).json(design);
    }
    
});

router.post("/save", AuthMiddleware, async (req, res) => {
    console.log("golaa")
    const user = req.user.id;
    const desingId = req.body.designId;
    const image = req.body.image;
    const data = req.body.designData;
    
    const saved = await designService.save(user, desingId, image,data);
    console.log(saved);
    if(saved === false){
        return res.status(401).send();
    }else{
        return res.status(200).json(saved);
    }
    
});


export default router;

/*import express from "express";
import multer from 'multer';
import path from 'path';
import { AuthMiddleware } from "../auth/authMiddleware.js";
import DesignService from "../services/design-service.js";
import fs from 'fs';

const router = express.Router();
const designService = new DesignService();

// Configuración de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/designs';
        fs.exists(dir, (exists) => {
            if (!exists) {
                fs.mkdir(dir, { recursive: true }, (err) => {
                    if (err) return cb(err);
                    cb(null, dir);
                });
            } else {
                cb(null, dir);
            }
        });
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/get/:id", AuthMiddleware, async (req, res) => {
  const user = req.user.id;
  const designId = req.params.id;
  console.log("user", user, designId);
  const design = await designService.get(user, designId);
  if (design === false) {
    return res.status(401).send();
  } else {
    return res.status(200).json(design);
  }
});

router.post("/save", AuthMiddleware, upload.single('image'), async (req, res) => {
  try {
    const user = req.user.id;
    const designId = req.body.designId;
    const data = req.body.designData;

    let image = null;
    if (req.file) {
      image = `/uploads/designs/${req.file.filename}`;
    }

    const saved = await designService.save(user, designId, image, data);
    console.log(saved);
    if (saved === false) {
      return res.status(401).send();
    } else {
      return res.status(200).json({ image: image });
    }
  } catch (error) {
    console.error("Error saving design:", error);
    return res.status(500).json({ error: "Error saving design" });
  }
});

export default router;*/