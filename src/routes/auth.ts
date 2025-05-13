import { Router } from 'express';
import { User } from '../models/User';
import bcrypt from "bcryptjs";
import {ValidationInstance} from '../utils/validation';
import { ThrowErrorMessage } from '../utils/errorHandler';
import jwt  from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AuthorizeValidToken } from '../utils/verifyToken';
import { request } from 'http';
import ShortUniqueId from "short-unique-id";
import { CannedPlayerEgmMappingsInstance } from '../modules/cannedPlayerEgmMappings';
import { MobileAPIPairing, MobileAPIPairingInstance } from '../utils/mobileAPIPairing';
import { MongoClientHelperInstance } from '../utils/mongoClientHelper';

var router = Router();


function GeneratePlayerUID(): number{    
    let uidGenerator = new ShortUniqueId({length: 9});     
    uidGenerator.setDictionary('number');
    let result = uidGenerator();    
    return result;
}

router.post('/register', async(req:Request, res:Response) => {
    console.log(`!!! INSIDE /register ENDPOINT`);
    console.log(req.body);
    //VALIDATE INPUT DATA BEFORE CREATING A NEW USER
    const {error} = ValidationInstance.RegisterValidation(req.body); //pull out the error property from validation result
        
    // console.log(error);
    if(error){
        console.log(`!!! INSIDE ERROR CLAUSE: ${error.details[0].message}`);
        return res.status(400).send(error.details[0].message);
    }

    //CHECK IF USER ALREADY EXISTS BASED ON EMAIL
    const usernameExists = await User.findOne({uid: req.body.playerUUID});
    if(usernameExists){
        console.log(`User: ${req.body.username} - ${req.body.playerUUID} - already exists`);
        return res.status(200).send(`User: ${req.body.username} - ${req.body.playerUUID} - already exists`);        
    }

    let hashPassword = ""
    if(req.body.password){
        //HASH the password
        const salt = await bcrypt.genSalt(10);
        hashPassword = await bcrypt.hash(req.body.password, salt);
    }else{
        return res.status(400).send('Register payload missing password');
    }
    

    console.log(`!!! PlayerUUID from payload: ${req.body.playerUUID}`);
    var newPlayerUUID = GeneratePlayerUID();

    console.log(`Registering user: ${req.body.username}; uuid: ${newPlayerUUID}`);
    const user = new User({
        uid: newPlayerUUID,
        username: req.body.username,
        password: hashPassword,
        avatarID: req.body.avatarID
    });

    try{
        const savedUser = await user.save();
        res.send(savedUser);
    }catch(err){
        console.log(`ERROR - Failed to create user - ${err}`);
        res.status(400).send(err);
    }
});

//LOGIN
router.post('/login', async(req:Request, res:Response) => {
    //VALIDATE INPUT DATA BEFORE CREATING A NEW USER
    const {error} = ValidationInstance.LoginValidation(req.body); //pull out the error property from validation result    
        
    if(error){
        var removedQuotationMarks = error.details[0].message.replace(new RegExp('\"', 'g'), '');
        return res.status(400).send(removedQuotationMarks);
    }

    // //CHECK IF USER ALREADY EXISTS BASED ON EMAIL
    const user = await User.findOne({uid: req.body.playerUUID});


    if(!user){
        return res.status(400).send(`User does not exist: ${req.body.username} - ${req.body.playerUUID}`);
    }

    if(!req.body.password){
        return res.status(400).send(`Payload needs a password`);
    }

    if(!req.body.mobileUUID){
        return res.status(500).send(`Payload needs a mobileUUID`);
    }

    if(!req.body.machineUUID){
        return res.status(500).send(`Payload needs a machineUUID`);
    }

    // //CHECK PASSWORD IF IT IS CORRECT
    const pwdIsValid = await bcrypt.compare(req.body.password, user.password);
    if(!pwdIsValid){
        return res.status(400).send('Invalid password');        
    }

    //CREATE AND ASSIGN A TOKEN
    //stores userID into the JWT token, then send back via header response
    //Ex: "auth-token-header-key": "asldkfjwefweweig-wej203ijf2oi3g"
    var tokenSecret = process.env.TOKEN_SECRET ?? ThrowErrorMessage("ERROR: Null value for env variable TOKEN_SECRET");
    const token = jwt.sign({_id: user._id}, tokenSecret);

    // CannedPlayerEgmMappingsInstance.EnsureGetEGMUUIDBasedOnPlayerUUID() was called because of the method involving tying a demo mobile device to a specific EGM
    // const machineUUID = CannedPlayerEgmMappingsInstance.EnsureGetEGMUUIDBasedOnPlayerUUID(req.body.playerUUID);
    const machineUUID = req.body.machineUUID;
    const json_response = {
       jwt_token: token,
       machineUUID: machineUUID
    };

    //RESET USER FOR DEMO
    //reset the event index to -1 and update the db
    user.currentEventIndex = -1;
    await MongoClientHelperInstance.UpdateUserData(user);
    
    let header = process.env.AUTH_TOKEN_HEADER_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable AUTH_TOKEN_HEADER_NAME");
    MobileAPIPairingInstance.EmulateRabbitMQMobileHandshake(req.body.playerUUID, machineUUID, req.body.mobileUUID);
    res.header(header, token).send(json_response);
    console.log(`==> sent out jwt_token: ${json_response}`);
});

router.post('/login-app', async(req:Request, res:Response) => {
    //VALIDATE INPUT DATA BEFORE CREATING A NEW USER
    //const {error} = ValidationInstance.LoginValidation(req.body); //pull out the error property from validation result    
        
    // if(error){
    //     var removedQuotationMarks = error.details[0].message.replace(new RegExp('\"', 'g'), '');
    //     return res.status(400).send(removedQuotationMarks);
    // }

    // //CHECK IF USER ALREADY EXISTS BASED ON EMAIL
    const user = await User.findOne({username: req.body.username});
    if(!user){
        return res.status(400).send(`Username does not exist: ${req.body.username}`);
    }

    if(!req.body.password){
        return res.status(400).send(`Payload needs a password`);
    }

    if(!req.body.mobileUUID){
        return res.status(500).send(`Payload needs a mobileUUID`);
    }

    // //CHECK PASSWORD IF IT IS CORRECT
    const pwdIsValid = await bcrypt.compare(req.body.password, user.password);
    if(!pwdIsValid){
        return res.status(400).send('Invalid password');        
    }

    //CREATE AND ASSIGN A TOKEN
    //stores userID into the JWT token, then send back via header response
    //Ex: "auth-token-header-key": "asldkfjwefweweig-wej203ijf2oi3g"
    var tokenSecret = process.env.TOKEN_SECRET ?? ThrowErrorMessage("ERROR: Null value for env variable TOKEN_SECRET");
    const token = jwt.sign({_id: user._id}, tokenSecret);

    // CannedPlayerEgmMappingsInstance.EnsureGetEGMUUIDBasedOnPlayerUUID() was called because of the method involving tying a demo mobile device to a specific EGM
    // const machineUUID = CannedPlayerEgmMappingsInstance.EnsureGetEGMUUIDBasedOnPlayerUUID(req.body.playerUUID);
    //const machineUUID = req.body.machineUUID;
    const json_response = {
       jwt_token: token
    };

    //RESET USER FOR DEMO
    //reset the event index to -1 and update the db
    user.currentEventIndex = -1;
    await MongoClientHelperInstance.UpdateUserData(user);
    
    let header = process.env.AUTH_TOKEN_HEADER_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable AUTH_TOKEN_HEADER_NAME");
    //MobileAPIPairingInstance.EmulateRabbitMQMobileHandshake(req.body.playerUUID, machineUUID, req.body.mobileUUID);
    res.header(header, token).send(json_response);
    console.log(`==> sent out jwt_token: ${json_response}`);
});

// this was added to have a way to write a test for AuthorizeValidToken
router.post('/test', async(req:Request, res:Response) => {
    let foo = (() => {});
    AuthorizeValidToken(req, res, foo);
});




export default router;