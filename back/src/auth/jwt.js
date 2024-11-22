import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const createToken = (user) => {
    const payload = {
        id: user[0].id,
        username: user[0].username
    };

    const secretKey = process.env.SECRET_KEY;

    const options = {
        expiresIn : '30d',
        issuer : 'localhost'
    };
    return jwt.sign(payload,secretKey,options);
}

export const decryptToken = (encryptedToken) => {
    const secretKey = process.env.SECRET_KEY;
    let token = encryptedToken;
    let payloadOriginal = null;
    try {
        payloadOriginal = jwt.verify(token, secretKey);
    } catch(e) {
        console.error(e);
    }
    return payloadOriginal;
};
