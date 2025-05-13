import jwt  from 'jsonwebtoken';
import { ThrowErrorMessage } from './errorHandler';

//If token is VALID, then request.userObj = verified userID
//Else return status 400, Access Denied
export function AuthorizeValidToken(req:any, res:any, next:Function){
    let token:string|null = null;

    let authTokenHeaderKey = process.env.AUTH_TOKEN_HEADER_NAME ?? ThrowErrorMessage('ERROR! AUTH_TOKEN_HEADER_NAME is null in the .env file');
    token = req.header(authTokenHeaderKey);

    if(!token){
        return res.status(401).send('Access Denied: No access token found');
    }

    try{
        var tokenSecret = process.env.TOKEN_SECRET ?? ThrowErrorMessage("ERROR: Null value for env variable TOKEN_SECRET");
        const verifiedUserIDFromToken = jwt.verify(token, tokenSecret);
        req.user = verifiedUserIDFromToken;
        next();
    }catch(err){
        return res.status(400).send('Invalid Token');
    }
}