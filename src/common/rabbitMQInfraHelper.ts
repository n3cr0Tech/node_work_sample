// machineUUID will be null if the flow is coming from the Mobile App 

import { RabbitMQConnData } from "../models/RabbitMQConnData";
import { RabbitMQPlayer } from "../models/RabbitMQPlayer";
import { ThrowErrorMessage } from "../utils/errorHandler";
import { ClientTypes } from "./clientTypes";

// machineUUID will have a value if the flow is coming from the QRScanner Code
export function CreateRabbitMQPlayerRecord(jsonObj: any, mobileQName: string, egmQName: string = ""): RabbitMQPlayer{        
    let playerRecord = {} as RabbitMQPlayer;
    playerRecord.playerUsername = jsonObj.data.username;
    playerRecord.playerUUID = jsonObj.data.playerUUID;
    playerRecord.mobileQName = mobileQName;
    playerRecord.mobileUUID = jsonObj.data.mobileUUID;            
    playerRecord.egmUUID = jsonObj.data.machineUUID;
    playerRecord.egmQName = egmQName; //NOTE: HUGE assumption that EGM's are turned on before mobile users connect to Server
    playerRecord.avatarID = jsonObj.data.avatarID;        
    return playerRecord
}

export function CreateClientQName(clientUUID: string, clientType: string, connectionData: RabbitMQConnData): string{
    let prefix = ""; //default

    if(clientType === ClientTypes.EGM){
        prefix = connectionData.egmClientQPrefix;
    }
    else if(clientType === ClientTypes.Leaderboard){
        prefix = connectionData.leaderboardQPrefix;
    }else if(clientType === ClientTypes.Mobile){
        prefix = connectionData.mobileClientQPrefix;        
    }else if(clientType == ClientTypes.QRScanner){
        prefix = connectionData.qrClientQPrefix;
    }else{
        ThrowErrorMessage(`OH NOES! ${clientUUID} gave me an invalid clientType: ${clientType}, so I can't create the proper queue name for them`);
    }

    return prefix + clientUUID;
}

export function GetRabbitConnectionInfo(): RabbitMQConnData{
    let rabbitMQConnectionData = {} as RabbitMQConnData;
    rabbitMQConnectionData.username = process.env.RABBITMQ_USER ?? ThrowErrorMessage('ERROR! RABBITMQ_USER is null in the .env file');
    rabbitMQConnectionData.password = process.env.RABBITMQ_PWD ?? ThrowErrorMessage('ERROR! RABBITMQ_PWD is null in the .env file');
    rabbitMQConnectionData.hostAddress = process.env.RABBITMQ_URL ?? ThrowErrorMessage('ERROR! RABBITMQ_URL is null in the .env file');
    rabbitMQConnectionData.vhost = process.env.RABBITMQ_VHOST ?? ThrowErrorMessage('ERROR! RABBITMQ_VHOST is null in the .env file');
    rabbitMQConnectionData.serverQName = process.env.RABBITMQ_SERVER_QNAME ?? ThrowErrorMessage('ERROR! RABBITMQ_SERVER_QNAME is null in the .env file');
    rabbitMQConnectionData.leaderboardQPrefix = process.env.RABBITMQ_LEADERBOARD_CLIENT_QPREFIX ?? ThrowErrorMessage('ERROR! RABBITMQ_LEADERBOARD_CLIENT_QPREFIX is null in the .env file');
    rabbitMQConnectionData.egmClientQPrefix = process.env.RABBITMQ_EGM_CLIENT_QPREFIX ?? ThrowErrorMessage('ERROR! RABBITMQ_EGM_CLIENT_QPREFIX is null in the .env file');
    rabbitMQConnectionData.mobileClientQPrefix = process.env.RABBITMQ_MOBILE_CLIENT_QPREFIX ?? ThrowErrorMessage('ERROR! RABBITMQ_MOBILE_CLIENT_QPREFIX is null in the .env file');
    rabbitMQConnectionData.qrClientQPrefix = process.env.RABBITMQ_QR_SCANNER_CLIENT_QPREFIX ?? ThrowErrorMessage('ERROR! RABBITMQ_QR_SCANNER_CLIENT_QPREFIX is null in the .env file');
    return rabbitMQConnectionData;
}