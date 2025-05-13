import { UserInfo } from "os";
import { BadgeData } from "../models/BadgeData";
import { PlayerData } from "../models/PlayerData";
import { User } from '../models/User';
import { MongoClientHelperInstance } from "./mongoClientHelper";

export class BadgeHandler{

    

    //TODO: this should be much more robust in a final product, but we don't need it to be complex for G2E
    public EnsureGetBadgesUserQualifiesFor(userInfo: typeof User , allBadgesFromDB: Array<BadgeData>): BadgeData[]{
        var result = [] as BadgeData[];
        var currentDay = process.env.G2E_DAY_BADGE;        

        for(var i = 0; i < allBadgesFromDB.length; ++i){
            let newBadge = this.QualifiesForBadge('G2E-00' + currentDay, userInfo.badges, allBadgesFromDB) as BadgeData;

            if(newBadge)
            {
                result.push(newBadge);
                break;
            }
        }
               

        return result;
    }
    
    public EnsureSaveUniqueBadgeIntoUserRecord(newBadges: Array<BadgeData>, userInfo: typeof User){
        // Add uniqueBadges (if any) into the User DB record       
        var allBadges = userInfo.badges.concat(newBadges);     
        this.UpdateBadgesRecord(userInfo, allBadges);
    }

    public UpdateBadgesRecord(userInfo: typeof User, allBadgesUpdate: Array<BadgeData>){
        userInfo.badges = allBadgesUpdate;
        MongoClientHelperInstance.UpdateUserData(userInfo);
    }

    public GetUniqueBadges(newBadges: Array<BadgeData>, playerBadges: Array<BadgeData>){
        return newBadges.filter(newTropy => !playerBadges.some(playerBadge => playerBadge.uid === newTropy.uid));
    }
   

    private QualifiesForBadge(uid:string, userBadges: Array<BadgeData>, allBadgesFromDB: Array<BadgeData>): BadgeData | undefined{
        let result = undefined;

        var badge = userBadges.find(b => b.uid === uid);

        if(!badge)
        {
            result = Object.assign({}, allBadgesFromDB.find(b => b.uid === uid));
        }

        return result;
    }
}

export const BadgeHandlerInstance = new BadgeHandler();