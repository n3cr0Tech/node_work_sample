
import { LeaderboardData } from "../models/LeaderboardData";
import { PlayerData } from "../models/PlayerData";
import { TrophyData } from "../models/TrophyData";
import { User } from '../models/User';
import { MongoClientHelperInstance } from "./mongoClientHelper";

export class TrophyHandler{
    public EnsureGetTrophiesUserQualifiesFor(userData:typeof User, lbData:LeaderboardData, trophyList:Array<TrophyData>): Array<TrophyData>{
        var result = [] as TrophyData[];
        //hard coding for demo purposes
        
        for(var i = 0; i < trophyList.length; ++i){
            const trophyUID = lbData.gameName + '-00' + (i + 1);
            const newTrophy = this.QualifiesForTrophy(trophyUID, userData.trophies, trophyList);

            if(newTrophy !== undefined && Object.keys(newTrophy).length !== 0)
            {
                result.push(newTrophy);
                break;
            }
        }

        return result;                        
    }



    public EnsureSaveUniqueTrophyIntoUserRecord(newTrophies: Array<TrophyData>, userInfo: typeof User){        
        var allTrophies = userInfo.trophies.concat(newTrophies);     
        this.UpdateTrophiesRecord(userInfo, allTrophies);
    }

    public UpdateTrophiesRecord(userInfo: typeof User, allTrophiesUpdate: Array<TrophyData>){
        userInfo.trophies = allTrophiesUpdate;
        MongoClientHelperInstance.UpdateUserData(userInfo);
    }

    public GetUniqueTrophies(newTrophies: Array<TrophyData>, playerTrophies: Array<TrophyData>){
        return newTrophies.filter(newTropy => !playerTrophies.some(playerTrophy => playerTrophy.uid === newTropy.uid));
    }

    private QualifiesForTrophy(uid:string, userTrophies:Array<TrophyData>, allTrophiesFromDB:Array<TrophyData>): TrophyData | undefined{
        let result = undefined;

        var trophy = userTrophies.find(b => b.uid === uid);

        if(!trophy)
        {
            result = Object.assign({}, allTrophiesFromDB.find(b => b.uid === uid));
        }

        return result;
    }
}

export const TrophyHandlerInstance = new TrophyHandler();