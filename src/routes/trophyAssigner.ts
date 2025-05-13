import { Router } from 'express';
import { TrophyHandlerInstance } from "../utils/trophyHandler"
import { AuthorizeValidToken } from "../utils/verifyToken";
import { User } from '../models/User';
import { PlayerData } from "../models/PlayerData";

var router = Router();

router.get('/', AuthorizeValidToken, async(req:any , res:any) => {
    const userInfo = await User.findOne({_id: req.user._id});    // user obj is attached by verifyToken

    // console.log(`userId: ${req.user._id}, winAmount: ${req.body.winAmount}`);

    // check that the corresponding User account was found
    // if(userInfo){
    //     var playerData = {} as PlayerData;
    //     playerData.uid = userInfo.uid;
    //     playerData.username = userInfo.username
    //     playerData.winAmount = req.body.winAmount
    //     playerData.totalCredits = req.body.totalCredits;
    //     var trophy = TrophyHandlerInstance.EnsureGetTrophiesUserQualifiesFor(playerData);
        
    //     TrophyHandlerInstance.EnsureSaveUniqueTrophyIntoUserRecord(trophy, userInfo)      
        
    //     res
    //         .status(200)
    //         .json({
    //             message: 
    //             {
    //                 playerName: `${userInfo.username}`,
    //                 trophy: trophy,                     
    //             }
    //         });        
    // }else{
    //     // error code concerning the token is handled by AuthorizedValidToken
    //     res
    //         .status(500)
    //         .json({
    //             message: `Woopsie Daisy - looks user was NOT found; uuid: ${req.user._id}`
    //         });
    // }
});

export default router;