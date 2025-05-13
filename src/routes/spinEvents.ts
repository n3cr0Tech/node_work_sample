import { Router } from 'express';
import { AuthorizeValidToken } from "../utils/verifyToken";
import { User } from '../models/User';
import { PlayerData } from "../models/PlayerData";

var router = Router();

router.get('/', AuthorizeValidToken, async(req:any , res:any) => {
    const userInfo = await User.findOne({_id: req.user._id});    // user obj is attached by verifyToken
    // check that the corresponding User account was found
    if(userInfo){
        
        var eventIndex = userInfo.currentEventIndex;
        
        // console.log(`SpinEvents Requested - SENDING - {
        //     playerName: ${userInfo.username},
        //     playerUUID: ${req.user_id},
        //     curEventIndex: ${eventIndex},
        //     curDay: ${process.env.G2E_DAY_BADGE}         
        // }`);
        
        res
            .status(200)
            .json({
                message: 
                {
                    playerName: `${userInfo.username}`,
                    playerUUID: req.user_id,
                    curEventIndex: eventIndex,
                    curDay: process.env.G2E_DAY_BADGE         
                }
            });        
    }else{
        res
            .status(500)
            .json({
                message: "Woopsie Daisy - looks like your token has expired OR the matching user was NOT found"
            });
    }
});

export default router;