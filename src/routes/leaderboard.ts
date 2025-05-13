import { Router, json } from 'express';
import { AuthorizeValidToken } from "../utils/verifyToken";
import { User } from '../models/User';
import { LeaderboardData } from '../models/LeaderboardData';
import { MongoClientHelperInstance } from '../utils/mongoClientHelper';
import { LeaderboardHandler, LeaderboardHandlerInstance } from '../modules/leaderboardHandler';
import { userInfo } from 'os';

var router = Router();


router.get('/', AuthorizeValidToken, async (req:any, res:any) => {
    const user = req.user;

    if(user)
    {
       //compile update data
       let cache = LeaderboardHandlerInstance.GetLeaderboardCache();

       var payload = JSON.parse(JSON.stringify(Object.fromEntries(cache)));
       res.status(200).json(payload);
       
       //send response
    }
    else
    {
        res
            .status(500)
            .json({
                message: "Woopsie Daisy - looks like your token has expired OR the matching user was NOT found"
            });
    }

        
    
});

export default router;