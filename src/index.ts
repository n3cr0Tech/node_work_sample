import express from 'express';
const app = express();
import dotenv from 'dotenv';
import mongoose, { ConnectOptions } from 'mongoose';
import {ThrowErrorMessage} from "./utils/errorHandler";
import authRoute from './routes/auth';
import trophyAssignerRoute from './routes/trophyAssigner' ;
import eventsRoute from './routes/spinEvents';
import leaderboardRoute from './routes/leaderboard';
import { RabbitMQMsgHandlerInstance } from './modules/rabbitMQMsgHandler';
import { RabbitMQConnData } from './models/RabbitMQConnData';
import { LeaderboardHandlerInstance } from './modules/leaderboardHandler';
import { MongoClientHelperInstance } from './utils/mongoClientHelper';
import { TrophyHandlerInstance } from './utils/trophyHandler';
import { BadgeHandlerInstance } from './utils/badgeHandler';
import { CannedPlayerEgmData } from './models/CannedPlayerEgmData';
import { CannedPlayerEgmMappingsInstance } from './modules/cannedPlayerEgmMappings';
import { GetRabbitConnectionInfo } from './common/rabbitMQInfraHelper';
import cors from 'cors';
import { CannedPlayerInitData } from './models/CannedPlayerInitData';

dotenv.config();

//Import Routes
let PORT_NUM = process.env.PORT_NUM ?? ThrowErrorMessage('ERROR! PORT_NUM is null in the .env file');
let MONGODB_URL = process.env.MONGODB_URL ?? ThrowErrorMessage("ERROR: Null value for env variable MONGODB_URL");
let DB_NAME = process.env.DB_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable DB_NAME");
let PLAYER_PAIR_MACHINE_COLLECTION_NAME = process.env.PLAYER_PAIR_MACHINE_COLLECTION_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable PLAYER_PAIR_MACHINE_COLLECTION_NAME");
let mongoConnectOpt = {useUnifiedTopology: true } as ConnectOptions;

let rabbitMQConnectionData = GetRabbitConnectionInfo();

let cannedPlayerEgmData = {} as CannedPlayerEgmData;
let tmpEgm1 = process.env.EGM_UUID_1 ?? ThrowErrorMessage('ERROR! EGM_UUID_1 is null in the .env file');
let tmpEgm2 = process.env.EGM_UUID_2 ?? ThrowErrorMessage('ERROR! EGM_UUID_2 is null in the .env file');
let tmpMobilePlayerUUID1 = process.env.CANNED_PHONE_UUID_1 ?? ThrowErrorMessage('ERROR! CANNED_PHONE_UUID_1 is null in the .env file');
let tmpMobilePlayerUUID2 = process.env.CANNED_PHONE_UUID_2 ?? ThrowErrorMessage('ERROR! CANNED_PHONE_UUID_2 is null in the .env file');
cannedPlayerEgmData.egmUUIDList = [] as string[];
cannedPlayerEgmData.cannedMobilePlayerUUIDList = [] as string[];
cannedPlayerEgmData.egmUUIDList.push(tmpEgm1);
cannedPlayerEgmData.egmUUIDList.push(tmpEgm2);
cannedPlayerEgmData.cannedMobilePlayerUUIDList.push(tmpMobilePlayerUUID1);
cannedPlayerEgmData.cannedMobilePlayerUUIDList.push(tmpMobilePlayerUUID2);


// -- Canned player data
let CANNED_PLAYER_UUID_1 = process.env.CANNED_PLAYER_UUID_1 ?? ThrowErrorMessage('ERROR! CANNED_PLAYER_UUID_1 is null in the .env file');
let CANNED_PLAYER_AVATARID_1 = process.env.CANNED_PLAYER_AVATARID_1 ?? ThrowErrorMessage('ERROR! CANNED_PLAYER_AVATARID_1 is null in the .env file');
let CANNED_PLAYER_USERNAME_1 = process.env.CANNED_PLAYER_USERNAME_1 ?? ThrowErrorMessage('ERROR! CANNED_PLAYER_USERNAME_1 is null in the .env file');
let CANNED_PLAYER_UUID_2 = process.env.CANNED_PLAYER_UUID_2 ?? ThrowErrorMessage('ERROR! CANNED_PLAYER_UUID_2 is null in the .env file');
let CANNED_PLAYER_AVATARID_2 = process.env.CANNED_PLAYER_AVATARID_2 ?? ThrowErrorMessage('ERROR! CANNED_PLAYER_AVATARID_2 is null in the .env file');
let CANNED_PLAYER_USERNAME_2 = process.env.CANNED_PLAYER_USERNAME_2 ?? ThrowErrorMessage('ERROR! CANNED_PLAYER_USERNAME_2 is null in the .env file');


let serverIsEnabled = process.env.SERVER_ENABLED;

if(serverIsEnabled === '1')
{
    CannedPlayerEgmMappingsInstance.InitEGMUUIDValues(cannedPlayerEgmData);

    LeaderboardHandlerInstance.Init();

    MongoClientHelperInstance.InitMongoConnection(MONGODB_URL, DB_NAME).then(() => {
        MongoClientHelperInstance.ResetAndPopulateLeaderboards(LeaderboardHandlerInstance.GetLeaderboardNames());
        MongoClientHelperInstance.ResetPlayerMachinePairingsCollection(PLAYER_PAIR_MACHINE_COLLECTION_NAME);
        MongoClientHelperInstance.GenerateBadgeCollection('badges');
        MongoClientHelperInstance.GenerateTrophyCollection('trophies');

        let cannedPlayer1 = {} as CannedPlayerInitData;
        cannedPlayer1.uuid = CANNED_PLAYER_UUID_1;
        cannedPlayer1.username = CANNED_PLAYER_USERNAME_1;
        cannedPlayer1.avatarId = CANNED_PLAYER_AVATARID_1;
        MongoClientHelperInstance.EnsureCreateThenResetCannedPlayer(cannedPlayer1);

        let cannedPlayer2 = {} as CannedPlayerInitData;
        cannedPlayer2.uuid = CANNED_PLAYER_UUID_2;
        cannedPlayer2.username = CANNED_PLAYER_USERNAME_2;
        cannedPlayer2.avatarId = CANNED_PLAYER_AVATARID_2;
        MongoClientHelperInstance.EnsureCreateThenResetCannedPlayer(cannedPlayer2);    
    }).finally(()=>{
        LeaderboardHandlerInstance.CacheLeaderboards();
    });



    RabbitMQMsgHandlerInstance.InitRabbitMQUtil(rabbitMQConnectionData, LeaderboardHandlerInstance, 
        MongoClientHelperInstance, TrophyHandlerInstance, BadgeHandlerInstance, PLAYER_PAIR_MACHINE_COLLECTION_NAME);

    //Connect to DB
    mongoose
        .connect(MONGODB_URL, mongoConnectOpt)
        .then(() => console.log("connected to Mongoose DB!"));

    //MiddleWare
    app.use(express.json());
    app.use(cors());

    //Routes Middleware
    //in order to reach "register", use "/api/user/register"
    app.use('/auth', authRoute);
    app.use('/api/user', authRoute);
    app.use('/api/trophyAssigner', trophyAssignerRoute);
    app.use('/api/spinEvents', eventsRoute);
    app.use('/api/leaderboard', leaderboardRoute);

    app.use('/connex', express.static('ati_collective/dist/ati_collective'));
    app.use('/connex-leaderboard', express.static('connex-leaderboard/dist/leaderboard'));
    app.use('/assets', express.static('connex-leaderboard/dist/leaderboard/assets') );
}


app.get('/apitest', (req:any, res:any) => {    
    const egress = {
        message: "Hello there"
    };
    res.json(egress);
});

app.get('/health', (req:any, res:any) => {    
    const egress = {
        message: "Hello there AWS Healthchecker"
    };
    res.json(egress);
});


app.listen(PORT_NUM, () => console.log(`SERVER up and running, listening on port: ${PORT_NUM}`));
export default app;

