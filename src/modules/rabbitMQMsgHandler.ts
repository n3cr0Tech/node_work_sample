import {RabbitMQUtilInstance} from '../utils/rabbitMQUtil';
import { RabbitMQConnData } from '../models/RabbitMQConnData';
import { channel } from 'diagnostics_channel';
import { TrophyData } from '../models/TrophyData';
import { LeaderboardHandlerInstance } from './leaderboardHandler';
import SpinEventIngressT, {DecodeData} from '../models/SpinEventIngress';
import { LeaderboardData } from '../models/LeaderboardData';
import { MongoClientHelperInstance } from '../utils/mongoClientHelper';
import { TrophyHandlerInstance } from '../utils/trophyHandler';
import { ClientTypes } from '../common/clientTypes';
import { ThrowErrorMessage } from '../utils/errorHandler';
import { json } from 'body-parser';
import { RabbitMQPlayer } from '../models/RabbitMQPlayer';
import { SpinEventsHandlerInstance } from './spinEventsHandler';
import { User } from '../models/User';
import { CreateClientQName, CreateRabbitMQPlayerRecord } from '../common/rabbitMQInfraHelper';
import { BadgeHandlerInstance } from '../utils/badgeHandler';
import { UserInfo, machine } from 'os';
import { BadgeData } from '../models/BadgeData';

export class RabbitMQMsgHandler{    
    protected connectionData: RabbitMQConnData;    
    protected egmClientQNames: { [key: number]: string }; // { 123: "QueueForClient123", 555: "QueueForClient555", ... }
    protected mobileClientQNames: { [key: number]: string }; // { 123: "QueueForClient123", 555: "QueueForClient555", ... }
    protected leaderboardClientQNames: { [key: number]: string }; // { 123: "QueueForClient123", 555: "QueueForClient555", ... }
    protected leaderboardInstance: typeof LeaderboardHandlerInstance;
    protected mongoClientInstance: typeof MongoClientHelperInstance;
    protected trophyHandlerInstance: typeof TrophyHandlerInstance;
    protected badgeHandlerInstance: typeof BadgeHandlerInstance;
    protected PLAYER_PAIR_MACHINE_COLLECTION_NAME: string;
    protected gameDay: number;

    constructor(){
        this.PLAYER_PAIR_MACHINE_COLLECTION_NAME = "";
        this.connectionData = {} as RabbitMQConnData;        
        this.egmClientQNames = {};   
        this.mobileClientQNames = {};   
        this.leaderboardClientQNames = {};   
        this.leaderboardInstance = {} as typeof LeaderboardHandlerInstance;
        this.mongoClientInstance = {} as typeof MongoClientHelperInstance;
        this.trophyHandlerInstance = {} as typeof TrophyHandlerInstance;
        this.badgeHandlerInstance = {} as typeof BadgeHandlerInstance;
        this.gameDay = Number(process.env.G2E_DAY_BADGE);
    }

    public InitRabbitMQUtil(connData: RabbitMQConnData, _leaderboardInstance: typeof LeaderboardHandlerInstance, 
            _mongoClient: typeof MongoClientHelperInstance, _trophyHandlerInstance: typeof TrophyHandlerInstance, 
            _badgeHandlerInstance: typeof BadgeHandlerInstance, playerMachinePairCollName: string){

        this.PLAYER_PAIR_MACHINE_COLLECTION_NAME = playerMachinePairCollName;
        this.leaderboardInstance = _leaderboardInstance;
        this.mongoClientInstance = _mongoClient;
        this.trophyHandlerInstance = _trophyHandlerInstance;
        this.badgeHandlerInstance = _badgeHandlerInstance;
        this.connectionData = connData;
        (async () => {
            await RabbitMQUtilInstance.ConnectQueue(this.connectionData);            
            RabbitMQUtilInstance.Listen(this.ListenCallback, this.connectionData.serverQName);
        })();
    }

    public ListenCallback = (data: string) => {
        let jsonObj = JSON.parse(data);
        console.log(`--> received: ${jsonObj.msg} from uuid: ${JSON.stringify(jsonObj.data)}`);        
        this.HandleEventsBasedOnClientType(jsonObj, channel);        
    }

    private async HandleEventsBasedOnClientType(jsonObj: any, channel: any){

        if(!jsonObj.data){
            ThrowErrorMessage(`Missing data object for ${jsonObj.msg}`);
        }
        else if(jsonObj.data.clientType === ClientTypes.EGM){
            // console.log("!!! clientType is EGM");
            this.HandleEGMEvents(jsonObj, channel, this.egmClientQNames);
        }else if(jsonObj.data.clientType === ClientTypes.Mobile){
            this.HandleMobileEvents(jsonObj, channel, this.mobileClientQNames);
        }else if(jsonObj.data.clientType === ClientTypes.Leaderboard){
            this.HandleLeaderboardEvents(jsonObj, channel, this.leaderboardClientQNames);
        }else if(jsonObj.data.clientType === ClientTypes.QRScanner){
            this.HandleQRScannerEvents(jsonObj, channel, this.mobileClientQNames);
        }else{
            ThrowErrorMessage(`OH NOES! ${jsonObj.data.machineUUID} gave me an invalid clientType: ${jsonObj.data.client}, so I can't create the proper queue name for them`);
        }
    }
    

    private async MobileConnectProcedures(jsonObj:any, newQName: string){
        // console.log("!!! EnsureDoMobileConnectProcedures" );
        let rabbitMQPlayers: RabbitMQPlayer[] = await this.mongoClientInstance.GetPlayerMachinePairings(this.PLAYER_PAIR_MACHINE_COLLECTION_NAME);
      
        let playerRabbitMQRecord = this.EnsureGetRabbitMQPlayerRecord(jsonObj, newQName, rabbitMQPlayers);
        await this.mongoClientInstance.EnsureDeleteExistingPairingRecordOfPlayer(playerRabbitMQRecord);
        await this.mongoClientInstance.UpsertPlayerMachinePairing(playerRabbitMQRecord, this.PLAYER_PAIR_MACHINE_COLLECTION_NAME);
            
        //Temporary for DEBUGGING; TODO: replace with actual login
        //this.NotifyEGMAboutPlayer(playerRabbitMQRecord, playerRabbitMQRecord.egmQName);        
    }

    private async QRScannerConnectProcedures(jsonObj:any, newQName:string){
        let user = await MongoClientHelperInstance.GetUserByPlayerUUID(jsonObj.data.playerUUID, 'QRScannerConnectProcedures') as typeof User;
        user.currentEventIndex = -1;
        await MongoClientHelperInstance.UpdateUserData(user);
        LeaderboardHandlerInstance.ResetPlayerOnLeaderboard(jsonObj.data.machineUUID);
        let playerRabbitMQRecord = CreateRabbitMQPlayerRecord(jsonObj, newQName, this.connectionData.egmClientQPrefix + jsonObj.data.machineUUID);
        await this.mongoClientInstance.EnsureDeleteExistingPairingRecordOfPlayer(playerRabbitMQRecord);
        await this.mongoClientInstance.UpsertPlayerMachinePairing(playerRabbitMQRecord, this.PLAYER_PAIR_MACHINE_COLLECTION_NAME);
        this.NotifyEGMAboutPlayer(playerRabbitMQRecord, playerRabbitMQRecord.egmQName);
    }

    // private EnsureAddNewPlayerRecord(playerRecord:RabbitMQPlayer, rabbitMQPlayers: RabbitMQPlayer[]): RabbitMQPlayer[]{
    //     let playerIndex = this.GetRabbitMQPlayerRecordIndex(playerRecord.playerUUID, rabbitMQPlayers);
    //     let playerRecordExists = playerIndex > -1;
    //     if(!playerRecordExists){   
    //         rabbitMQPlayers.push(playerRecord);
    //     }
    //     return rabbitMQPlayers;
    // }

    //ONLY called when entity connecting is Mobile (NOT EGM)
    private EnsureGetRabbitMQPlayerRecord(jsonObj:any, qName: string, rabbitMQPlayers: RabbitMQPlayer[]): RabbitMQPlayer{
        console.assert(jsonObj.data.playerUUID != null, "Uh OH!! EnsureGetRabbitMQPlayerRecord() got null for playerUUID");
        let playerIndex = this.GetRabbitMQPlayerRecordIndex(jsonObj.data.playerUUID, rabbitMQPlayers);
        let playerRecordExists = playerIndex > -1;
        let playerRecord = {} as RabbitMQPlayer
        if(!playerRecordExists){                   
            playerRecord = CreateRabbitMQPlayerRecord(jsonObj, qName, this.egmClientQNames[jsonObj.data.machineUUID]);
        }
        rabbitMQPlayers.push(playerRecord);
        return playerRecord;
    }

    // returns index if found in list, returns -1 if NOT found
    private GetRabbitMQPlayerRecordIndex(playerUUID: string, rabbitMQPlayers: RabbitMQPlayer[]): number{
        let result = -1;
        for(var i = 0; i < rabbitMQPlayers.length; i++){
            if(rabbitMQPlayers[i].playerUUID === playerUUID){
                result = i;
                break;
            }
        }
        return result;
    }

    // At this point, the queue for a machine should have been created
    private async HandleEGMEvents(jsonObj: any, channel: any, qNames: { [key: number]: string }){
        //TODO: SAD PATH needs to be accounted for where jsonObj is missing data or machineUUID attribute
        let clientQName = this.egmClientQNames[jsonObj.data.machineUUID];
        if(jsonObj.msg == "OnConnect"){
            let newQName = CreateClientQName(jsonObj.data.machineUUID, jsonObj.data.clientType, this.connectionData);
            RabbitMQUtilInstance.EnsureCreateNewQueueInChannel(newQName);
            this.AddNewClientQueueToProperList(jsonObj.data.machineUUID, newQName, jsonObj.data.clientType);            
            let onConnectReply = {
                msg: "OnConnectSuccess"
            }
            RabbitMQUtilInstance.SendData(JSON.stringify(onConnectReply), newQName);
            // console.log(`!!! clientQNames count: ${Object.keys(this.clientQNames).length}`); 
        }else if(jsonObj.msg == "SpinEvent"){
            if(jsonObj.data)
            {
                let decodedIngress = DecodeData(jsonObj.data);

                let rabbitMQPlayer = await this.mongoClientInstance.GetPlayerPairingForMachine(this.PLAYER_PAIR_MACHINE_COLLECTION_NAME, decodedIngress.machineUUID);

                console.log('DECODED INGRESS: ' + JSON.stringify(decodedIngress));

                if(rabbitMQPlayer)
                {
                    if(!decodedIngress.playerUUID)
                    {                                
                        decodedIngress.playerUUID = rabbitMQPlayer.playerUUID;
                        decodedIngress.username = rabbitMQPlayer.playerUsername;
                    }

                    console.log('DECODED INGRESS post add: ' + JSON.stringify(decodedIngress));
                    
                    let userInfo:typeof User = await this.mongoClientInstance.GetUserByPlayerUUID(rabbitMQPlayer.playerUUID, 'HandleEGMEvents');        
                    //let rabbitMQPlayers = await this.mongoClientInstance.GetPlayerMachinePairings(this.PLAYER_PAIR_MACHINE_COLLECTION_NAME);
                    //let rabbitMQPlayer = await this.mongoClientInstance.GetMachinePairingForPlayer(this.PLAYER_PAIR_MACHINE_COLLECTION_NAME, decodedIngress.playerUUID);
                    
                    // convert data to Leaderboard friendly data
                    let dbLeaderboard = await this.mongoClientInstance.GetLeaderboard(decodedIngress.gameName);
                    let resolvedLeaderboard = this.leaderboardInstance.GetResolvedLeaderboardDataWithPlayerSpinEvent(dbLeaderboard, decodedIngress, userInfo);
                    await this.leaderboardInstance.UpdateLeaderboardDB(resolvedLeaderboard, decodedIngress.gameName);            
                    
                    //update cached leaderboard copy
                    LeaderboardHandlerInstance.UpdateLeaderboardCache(resolvedLeaderboard);
                    this.SendUpdateToLeaderboardClients(resolvedLeaderboard, this.connectionData.leaderboardQPrefix);

                    //check to see if the player
                    let playerEntry = resolvedLeaderboard.find(element => element.playerUUID === decodedIngress.playerUUID);

                    if(playerEntry !== undefined && playerEntry.curPosition !== playerEntry.prevPosition)
                    {
                        this.SendLeaderBoardPositionUpdate(playerEntry, rabbitMQPlayer.egmQName);
                    }
                    
                    //check to see if player earned a badge on spin
                    await this.BadgeProcedures(userInfo, rabbitMQPlayer);            

                    //check to see if player earned an achievement (trophy) on spin
                    await this.TrophyProcedures(decodedIngress, rabbitMQPlayer);

                    let updatedUser = await this.ResolveSpinEvent(decodedIngress.playerUUID);
                    
                    this.SendSpinEventIndex(rabbitMQPlayer.egmQName, updatedUser.currentEventIndex as number, this.gameDay);
                    this.SpinEventReply(rabbitMQPlayer.egmQName);
                }
            }
            
        }else if(jsonObj.msg == "LogoutRequest"){
            //reset player's badges and trophies
            await this.mongoClientInstance.ResetPlayerBadgesAndTrophies(jsonObj.data.playerUUID);
            await this.mongoClientInstance.RemoveMachinePairingForPlayer(this.PLAYER_PAIR_MACHINE_COLLECTION_NAME, 
                jsonObj.data.playerUUID, Number(jsonObj.data.machineUUID));
            this.LogoutReply(clientQName);
        }
    }

    private async ResolveSpinEvent(playerUUID: string){
        console.log(`-- Resolving Spin Event for ${playerUUID}`);
        let userData:typeof User = await this.mongoClientInstance.GetUserByPlayerUUID(playerUUID, 'ResolveSpinEvent');
        let updatedUserData:typeof User = SpinEventsHandlerInstance.ResolveSpinEvent(userData);
        await this.mongoClientInstance.UpdateUserData(updatedUserData);

        return updatedUserData;
    }

    private async HandleMobileEvents(jsonObj: any, channel: any, qNames: { [key: number]: string }){
        //TODO: SAD PATH needs to be accounted for where jsonObj is missing data or machineUUID attribute
        console.log(`HandleMobileEvents... mobileUUID: ${jsonObj.data.mobileUUID}`);
        let clientQName = qNames[jsonObj.data.mobileUUID];
       
        //TODO
        if(jsonObj.msg === "OnConnect"){            
            let newQName = CreateClientQName(jsonObj.data.mobileUUID, jsonObj.data.clientType, this.connectionData);            
            console.log(`newQName: ${newQName}`);
            this.AddNewClientQueueToProperList(jsonObj.data.mobileUUID, newQName, jsonObj.data.clientType);            
            // console.log("!!! HandleMobileEvents...mobile queue names: ");
            // console.log(qNames);

            //DRY
            let onConnectReply = {
                msg: "OnConnectSuccess"
            }
            RabbitMQUtilInstance.SendData(JSON.stringify(onConnectReply), newQName);
            this.MobileConnectProcedures(jsonObj, newQName);
            //TODO: DEBUGGING TEMP
            //this.QRScannerConnectProcedures(jsonObj, newQName);
        }
        else if(jsonObj.msg == "LoginRequest"){       
            this.LoginReply(clientQName);
        }
    }

    private async HandleQRScannerEvents(jsonObj: any, channel: any, qNames: { [key: number]: string }){
        console.log(`HandleQRScannerEvents... mobileUUID: ${jsonObj.data.mobileUUID}`);
        let clientQName = qNames[jsonObj.data.mobileUUID];
                
        if(jsonObj.msg === "OnConnect"){            
            let newQName = CreateClientQName(jsonObj.data.mobileUUID, jsonObj.data.clientType, this.connectionData);            
            console.log(`newQName: ${newQName}`);
            this.AddNewClientQueueToProperList(jsonObj.data.mobileUUID, newQName, jsonObj.data.clientType);            
            // console.log("!!! HandleMobileEvents...mobile queue names: ");
            // console.log(qNames);

            //DRY
            let onConnectReply = {
                msg: "OnConnectSuccess"
            }
            
            RabbitMQUtilInstance.SendData(JSON.stringify(onConnectReply), newQName);
            await this.QRScannerConnectProcedures(jsonObj, newQName);
        }
        else if(jsonObj.msg == "LoginRequest"){       
            this.LoginReply(clientQName);
        }

    }

    private async HandleLeaderboardEvents(jsonObj: any, channel: any, qNames: { [key: number]: string }){
        //TODO: SAD PATH needs to be accounted for where jsonObj is missing data or machineUUID attribute
        let clientQName = qNames[jsonObj.data.machineUUID];
        //TODO
        if(jsonObj.msg === "OnConnect"){
            let newQName = CreateClientQName(jsonObj.data.leaderboardUUID, jsonObj.data.clientType, this.connectionData);
            let onConnectReply = {
                msg: "OnConnectSuccess"
            }
            RabbitMQUtilInstance.SendData(JSON.stringify(onConnectReply), newQName);
        }
    }

    protected EnsureGetPlayerRecordByMachineUUID(machineUUID: string, rabbitMQPlayers: RabbitMQPlayer[]): RabbitMQPlayer{
        let result = {} as RabbitMQPlayer;
        // console.log("!!! EnsureGetPlayerRecordByMachineUUID")
        for(var i = 0; i < rabbitMQPlayers.length; i++){
            // console.log(`!!! searching for: ${machineUUID} <VS> ${rabbitMQPlayers[i].egmUUID}`)
            if(rabbitMQPlayers[i].egmUUID === machineUUID){
                result = rabbitMQPlayers[i];
                break;
            }
        }
        console.assert(result.playerUUID != null, `ERROR: failed to find corresponding player record for machineUUID: ${machineUUID}`);
        return result;
    }

    protected async BadgeProcedures(userInfo:typeof User, playerRecord: RabbitMQPlayer){
        console.log("-- Running Badge Procedures");
        let dbBadges = await this.mongoClientInstance.GetBadges();
        let newBadges = this.badgeHandlerInstance.EnsureGetBadgesUserQualifiesFor(userInfo, dbBadges);
        this.badgeHandlerInstance.EnsureSaveUniqueBadgeIntoUserRecord(newBadges, userInfo);

        //send badge update if needed
        if(newBadges.length > 0)
        {
            this.SendBadgeUpdate(userInfo, newBadges, playerRecord.mobileQName, playerRecord.egmQName);
        }
    }
    // Will call functions from TrophyHandler instance and then send out the update to the mobile client
    protected async TrophyProcedures(spinEventData: SpinEventIngressT, playerRecord: RabbitMQPlayer){
        console.log("-- Running Trophy Procedures");
        //GET mobile client qname
        //let playerRecord = this.EnsureGetPlayerRecordByMachineUUID(spinEventData.machineUUID, rabbitMQPlayers);
        
        //get all the leaderboard info we need for the player
        let leaderboardData = LeaderboardHandlerInstance.GetLeaderboardCache().get(spinEventData.gameName);
        let playerLeaderboardEntry = leaderboardData?.find(element => element.playerUUID == playerRecord.playerUUID);


        //make sure its valid
        if(playerLeaderboardEntry !== undefined)
        {
            console.log("-- Player has a leaderboard entry");
            //test that their multiplier meets the threshold
            if(playerLeaderboardEntry.multiplier >= 50)
            {
                console.log("-- Player meets trophy criteria");
                let userData = await MongoClientHelperInstance.GetUserByPlayerUUID(playerRecord.playerUUID, 'TophyProcedures') as typeof User;
                
                //make sure they don't already have this achievement
                let trophyList = await MongoClientHelperInstance.GetTrophies();
                let newTrophies = this.trophyHandlerInstance.EnsureGetTrophiesUserQualifiesFor(userData, playerLeaderboardEntry, trophyList);
                this.trophyHandlerInstance.EnsureSaveUniqueTrophyIntoUserRecord(newTrophies, userData);
                
                if(newTrophies.length > 0){
                    this.SendTrophyUpdate(userData, newTrophies, playerRecord.mobileQName, playerRecord.egmQName);
                }
            }            
        }
    }

    private SendUpdateToLeaderboardClients(updatedLeaderboard: LeaderboardData[], qName: string){
        let lbUpdateEgress = {
            msg: "LeaderboardUpdate",
            data: {
                leaderboard: updatedLeaderboard
            }
        }
        RabbitMQUtilInstance.SendData(JSON.stringify(lbUpdateEgress), qName);
    }
    
    protected LoginReply(qName: string){
        let reply = {
            msg: "LoginSuccess"
        }
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), qName);
        console.log(`<-- sending to ${qName}: ${JSON.stringify(reply)}`);
    }

    protected SpinEventReply(qName: string){
        let reply = {
            msg: "SpinEventReceived"
        }
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), qName); 
        console.log(`<-- sending: ${JSON.stringify(reply)}`);       
    }

    protected SendSpinEventIndex(qName: string, eventIndex:number, day:number){
        console.log("-- SendSpinEventIndex");
        let reply = {
            msg: "SpinEventIndex",
            data:{
                spinEventIndex: eventIndex,
                gameDay:day
            }
        }

        RabbitMQUtilInstance.SendData(JSON.stringify(reply), qName); 
        console.log(`<-- sending to ${qName}: ${JSON.stringify(reply)}`);
    }

    protected LogoutReply(qName: string){
        let reply = {
            msg: "LogoutSuccess"
        }
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), qName);   
        console.log(`<-- sending: ${JSON.stringify(reply)}`);     
    }

    private NotifyEGMAboutPlayer(playerRecord: RabbitMQPlayer, egmQName: string){
        // NUC scanner has a local config file that has corresponding EGM machineUUID
        // NUC sends Server playerUUID, machineUUID        
        let reply = {
            msg: "PlayerLoggedIn",
            data: {
                "machineUUID": playerRecord.egmUUID,
                "playerUUID": playerRecord.playerUUID,
                "username": playerRecord.playerUsername,
                "avatarID": playerRecord.avatarID
            }
        }

        RabbitMQUtilInstance.SendData(JSON.stringify(reply), egmQName);   
        console.log(`<-- sending to ${egmQName}: ${JSON.stringify(reply)}`);  
    }

    private SendLeaderBoardPositionUpdate(dataObj: LeaderboardData, qName: string){
        
        console.log(`user: ${dataObj.playerUUID} moved in the leaderboard; from ${dataObj.prevPosition} to ${dataObj.curPosition}`);

        let reply = {
            msg: "LeaderBoardPositionUpdate",
            data: {
                prevSpot: dataObj.prevPosition,
                curSpot: dataObj.curPosition
            }
        }
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), qName);   
        console.log(`<-- sending: ${JSON.stringify(reply)}`);  
    }

    // Just for Testing for now
    //TODO: make actual trophy decisions with trophyHandler module
    protected MockGiveTrophy(dataObj: any, mobileQName: string, egmQName: string){
        console.log(`MockGiveTrophy: user: ${dataObj.playerUUID} won: ${dataObj.winAmount}`);

        let mockTrophy1 = {} as TrophyData;
        let mockTrophy2 = {} as TrophyData;

        mockTrophy1.uid="1";
        mockTrophy1.name="100 Points Achieved";
        mockTrophy1.conditionsToAchieve="Get 100 points";

        mockTrophy2.uid="2";
        mockTrophy2.name="500 Points Achieved";
        mockTrophy2.conditionsToAchieve="Get 500 points";

        let reply = {
            msg: "TrophyUpdate",
            data: {
                allTrophies: [mockTrophy1, mockTrophy2],
                newTrophies: [mockTrophy2]
            }
        }
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), mobileQName);   
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), egmQName);
        console.log(`<-- sending: ${JSON.stringify(reply)}`);  
    }

    protected SendTrophyUpdate(dataObj: typeof User, newTrophies: Array<TrophyData>, mobileQName: string, egmQName: string){
        console.log(`SendTrophyUpdate: user: ${dataObj.uid}`);        
        let reply = {
            msg: "TrophyUpdate",
            data: {
                allTrophies: dataObj.trophies,
                newTrophies: newTrophies
            }
        }
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), mobileQName);   
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), egmQName);
        console.log(`<-- sending: ${JSON.stringify(reply)}`);  
    }

    protected SendBadgeUpdate(dataObj: typeof User, newBadges: Array<BadgeData>, mobileQName: string, egmQName: string){
        console.log(`SendBadgeUpdate: user: ${dataObj.uid}`);        
        let reply = {
            msg: "BadgeUpdate",
            data: {
                allBadges: dataObj.badges,
                newBadges: newBadges
            }
        }
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), mobileQName);   
        RabbitMQUtilInstance.SendData(JSON.stringify(reply), egmQName);
        console.log(`<-- sending: ${JSON.stringify(reply)}`);  
    }

   

    private AddNewClientQueueToProperList(uuid: number, newQName: string, clientType: string){
        if(clientType === ClientTypes.EGM){
            this.egmClientQNames[uuid] = newQName;
        }else if(clientType === ClientTypes.Mobile || clientType === ClientTypes.QRScanner){
            this.mobileClientQNames[uuid] = newQName;
        }else if(clientType === ClientTypes.Leaderboard){
            this.leaderboardClientQNames[uuid] = newQName;
        }else{
            ThrowErrorMessage(`OH NOES! ${uuid} gave me an invalid clientType: ${clientType}, so I can't add them to the proper list`);
        }
    }

}

export const RabbitMQMsgHandlerInstance = new RabbitMQMsgHandler();