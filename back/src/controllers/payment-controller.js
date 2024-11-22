import express from "express";

import { MercadoPagoConfig, Preference } from 'mercadopago';
const client = new MercadoPagoConfig({ accessToken: 'YOUR_ACCESS_TOKEN' });

const router = express.Router();

router.post("/create-oreference", async (req, res) => {
  try{
    const body = {
      items: [{
        title: req.body.title,
        total_price: Number(req.body.total_price),
        currency_id: "ARS",
      }],
      back_urls: {
        success: "",
        failure:"",
        pending: ""
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
    res.status(500).json({
      error: "Error al crear la preferencia :(",
    });
  }
});


router.get("/success", (req, res) => res.send("Success"));

export default router;