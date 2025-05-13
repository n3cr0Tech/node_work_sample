import { CannedPlayerEgmData } from "../models/CannedPlayerEgmData";



class CannedPlayerEgmMappings{

    private EGM_UUID_LIST:string[];
    private CANNED_MOBILE_PLAYER_UUID: string[];

    constructor(){
        this.EGM_UUID_LIST = [] as string[];
        this.CANNED_MOBILE_PLAYER_UUID = [] as string[];
    }

    public InitEGMUUIDValues(values: CannedPlayerEgmData){
        this.EGM_UUID_LIST = values.egmUUIDList;
        this.CANNED_MOBILE_PLAYER_UUID = values.cannedMobilePlayerUUIDList;
    }


    public EnsureGetEGMUUIDBasedOnPlayerUUID(playerUUID: string): string{
        let result = this.EGM_UUID_LIST[0]; //by default send the first machine's UUID
        if(playerUUID == this.CANNED_MOBILE_PLAYER_UUID[0]){
            result = this.EGM_UUID_LIST[0];
        }else if(playerUUID == this.CANNED_MOBILE_PLAYER_UUID[1]){
            result = this.EGM_UUID_LIST[1];
        }
        return result;
    }

    // returns -1 if not found
    //returns index if found
    // private GetIndexOfPlayerUUIDFromList(playerUUID: string, cannedPlayers: string[]): number{
    //     let result = -1;
    //     for(var i = 0; i < cannedPlayers.length; i++){
    //         if(playerUUID == cannedPlayers[i]){
    //             result = i;
    //             break;
    //         }
    //     }
    //     return result;
    // }

}

export const CannedPlayerEgmMappingsInstance = new CannedPlayerEgmMappings();