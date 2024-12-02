                                                                                                                                                                    import express from "express";
import {UsersService} from "../services/user-service.js";
import { User } from "../entities/user.js";
import { body, validationResult } from 'express-validator';
import {AuthMiddleware} from "../auth/AuthMiddleware.js" 

const router = express.Router();
const userService = new UsersService();

router.post("/login", async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
        const [success, token, statusCode] = await userService.ValidateUser(username, password);
            return res.status(statusCode).send({
                success: success,
                token: token
            });  
});

const validateUserFields = [
    body('username').notEmpty(),
    body('first_name').notEmpty(),
    body('last_name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('date_of_birth').isDate(),
    //body('description').optional(),
    //body('profile_photo').optional(),
    //body('role_id').isInt({ min: 1 }),
];

router.post("/register", validateUserFields, async (req,res)=>{
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), message: "campos no son correctos" });
    }

    const user = new User(
        null,
        req.body.username,
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.password,
        req.body.date_of_birth,
        req.body.description,
        req.body.profile_photo,
        req.body.role_id
    );
    

    if (!checkBirthDate(user)) 
       { return res.status(400).json({message:"Debe ser mayor de 13 años"}); }

    const [success, statusCode, message] = await userService.TryRegister(user);
    return res.status(statusCode).send({
        success: success,
        message: message
    });
    
});

    router.get("/checkToken",AuthMiddleware, async (req,res)=>{
        if(req.user){
            return res.status(200).send("OK")
        }
        else{
            return res.status(401).send("Unauthorized")
        }
    })

    router.get("/friends",AuthMiddleware,async (req,res)=> {
        if (req.user){
            const result = await userService.getFriends(req.user.id)
            return res.status(200).send(result)
        }
        else return res.status(401).send("unauthorisesd")
    })

const checkBirthDate = (user) => {
    const today = new Date();
    const birthDate = new Date(user.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if monthDiff is negative (not yet birthday this year)
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if(age < 13){
        return false
    }
    return true
}

router.get("/", AuthMiddleware, async (req, res) => {
    const user = req.user;
    let userFound;
    
    if(user !== null){
        userFound = await userService.GetUserById(user.id);
        if(userFound === null){
            return res.status(404).send("No existe el usuario");
        }
        else{
            return res.status(200).json(userFound);
        }
    }else{
        return res.status(401).send();
    }

    
    
});

router.get("/library",AuthMiddleware,async (req,res) => {
    const saved = await userService.getSavedLikedPosts(req.user.id)
    return res.status(200).json(saved);
})

router.get("/profile/:id", AuthMiddleware,async (req, res) => {
    const id = req.params.id;
    const info = await userService.getTotalUserInfo(req.user, id);
    return res.status(200).json(info);
});

router.put("/profile/simple/:id", AuthMiddleware, async (req, res) => {
    const userId = req.params.id;
    const newData = req.body;

    
    const updateProfileResult = await userService.updateProfile(newData, userId);

    if (updateProfileResult === 1) {
        return res.status(200).json({ message: "Perfil actualizado correctamente." });
    } else {
        return res.status(500).json({ message: "Error al actualizar el perfil." });
    }
});

router.post("/follow/:id",AuthMiddleware,async (req,res) => {
    if (req.user == null){
        return res.status(401).json("el usuario no esta autenticificado")
    }
    const id = req.params.id
    const r = await userService.postFollow(req.user.id,id)
    return res.status(201).json(r)
})

router.delete("/follow/:id",AuthMiddleware,async(req,res) => {
    const id=req.params.id
    const r = await userService.deleteFollow(req.user.id,id)
    return res.status(200).json(r)
})

router.get("/carrito", AuthMiddleware, async(req,res) => {
    const user = req.user;
    if(user !== null){
        const carrito = await userService.getCarrito(user.id);
        
        return res.status(200).json(carrito);
    }else{
        return res.status(401).send();
    }
});

router.delete("/carrito",AuthMiddleware,async(req,res) => {
    const user=req.user
    if (user!==null ){
        const carrito = await userService.clearCarrito(user.id)

        return res.status(200).json("exito")
    }
    else{
        return res.status(401).send()
    }
})

export default router;