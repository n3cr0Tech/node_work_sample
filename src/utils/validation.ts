import { Schema } from "mongoose";
import Joi from '@hapi/joi';


class Validation{    

    //Register Validation
    public RegisterValidation(data:any){
        const schema = Joi.object({
            username: Joi.string().min(1).required(), 
            password: Joi.string().min(6),
            playerUUID: Joi.string().min(3),
            avatarID: Joi.string().min(1)
        });

        return schema.validate(data);
    };

    //Login Validation
    public LoginValidation(data:any){
        const schema = Joi.object({    
            username: Joi.string().min(1).required(),
            password: Joi.string().min(6).required(),
            playerUUID: Joi.string().min(3).required(),
            mobileUUID: Joi.string().min(6).required(),
            machineUUID: Joi.string().min(1).required(),
            avatarID: Joi.string().min(1)
        });

        return schema.validate(data);
    };
}

export const ValidationInstance = new Validation();