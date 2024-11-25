import express from "express";

import { MercadoPagoConfig, Preference } from 'mercadopago';
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-5698974043614735-112507-c763e9987f50b5e35d795bbfba52b030-2115173863' });

const router = express.Router();

router.post("/create_preference", async (req, res) => {
  
  try{
    const body = {
      items: [{
        title: req.body.title,
        quantity: Number(req.body.quantity),
        unit_price: Number(req.body.price),
        currency_id: "ARS",
      }],
      back_urls: {
        success: "https://www.youtube.com/watch?v=-VD-l5BQsuE",
        failure:"https://www.youtube.com/watch?v=-VD-l5BQsuE",
        pending: "https://www.youtube.com/watch?v=-VD-l5BQsuE"
      },
      auto_return: "approved",
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });
    res.json({
      id: result.id,
    });

  }catch (error){
    console.log(error);
    console.log("#olaaa");
    res.status(500).json({
      error: "Error al crear la preferencia :(",
    });
  }
});


router.get("/success", (req, res) => res.send("Success"));

export default router;