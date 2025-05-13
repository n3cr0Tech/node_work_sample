import { MongoClientHelperInstance } from './mongoClientHelper';
import {ThrowErrorMessage} from "./errorHandler";
import { CreateRabbitMQPlayerRecord, CreateClientQName, GetRabbitConnectionInfo } from '../common/rabbitMQInfraHelper';
import { ClientTypes } from '../common/clientTypes';
import dotenv from 'dotenv';



export class MobileAPIPairing{

    protected PLAYER_PAIR_MACHINE_COLLECTION_NAME: string;

    constructor(){
        this.PLAYER_PAIR_MACHINE_COLLECTION_NAME = "";
    }

    private async InitDBClient(): Promise<any>{
        
        dotenv.config();

        let PORT_NUM = process.env.PORT_NUM ?? ThrowErrorMessage('ERROR! PORT_NUM is null in the .env file');
        let MONGODB_URL = process.env.MONGODB_URL ?? ThrowErrorMessage("ERROR: Null value for env variable MONGODB_URL");
        let DB_NAME = process.env.DB_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable DB_NAME");
        this. PLAYER_PAIR_MACHINE_COLLECTION_NAME = process.env.PLAYER_PAIR_MACHINE_COLLECTION_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable PLAYER_PAIR_MACHINE_COLLECTION_NAME");

        let mongoClient = MongoClientHelperInstance;
        await MongoClientHelperInstance.InitMongoConnection(MONGODB_URL, DB_NAME);
        return mongoClient;
    }


    public async EmulateRabbitMQMobileHandshake(playerUUID: string, machineUUID: string, mobileUUID: string){        
        let mongoClient = await this.InitDBClient();
        
        let simJsonObj = {
            "data": {
                playerUUID: playerUUID,
                mobileUUID: mobileUUID ,
                machineUUID: machineUUID          
            }
        }
        let rabbitConnData = GetRabbitConnectionInfo();
        let mobileQName = CreateClientQName(mobileUUID, ClientTypes.Mobile, rabbitConnData);
        let egmQName = CreateClientQName(machineUUID, ClientTypes.EGM, rabbitConnData);
        let playerRabbitMQRecord = CreateRabbitMQPlayerRecord(simJsonObj, mobileQName, egmQName);

        console.assert(this.PLAYER_PAIR_MACHINE_COLLECTION_NAME.length > 0, "ERROR!! empty PLAYER_PAIR_MACHINE_COLLECTION_NAME param");
        mongoClient.UpsertPlayerMachinePairing(playerRabbitMQRecord, this.PLAYER_PAIR_MACHINE_COLLECTION_NAME);
    }

}
export const MobileAPIPairingInstance = new MobileAPIPairing();