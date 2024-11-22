import { decryptToken } from "./jwt.js";

export function AuthMiddleware(req, res, next){
    
    if(req.headers.authorization.length > ("Bearer").length){
        const token = req.headers.authorization.split(' ')[1];
        const decryptedToken = decryptToken(token);
        req.user = decryptedToken;
    }
    
    else{
        req.user = null;
    }
    
    

    next();
}