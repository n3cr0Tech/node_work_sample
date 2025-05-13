
const { MongoClient } = require('mongodb');
import mongoose, { Collection, ConnectOptions, mongo } from 'mongoose';
import { LeaderboardData } from '../models/LeaderboardData';
import { GameNames } from '../common/gameNames';
import { GetCannedPlayers as GetCannedPlayersDragon } from '../common/cannedPlayersDragonGame';
import { GetCannedPlayers as GetCannedPlayersBuffalo } from '../common/cannedPlayersBuffaloGame';
import { GetCannedPlayers as GetCannedPlayersBuffaloGold } from '../common/cannedPlayersBuffaloGold';
import { GetCannedPlayers as GetCannedPlayersGoldStacks } from '../common/cannedPlayersGoldStacksDancingFooGame';
import { GetCannedPlayers as GetCannedPlayersMightyCashLTHX } from '../common/cannedPlayersMightyCashLTHXGame';
import { GetCannedPlayers as GetCannedPlayersLepreCoins } from '../common/cannedPlayersWildLepreCoinsGame';
import { GetCannedPlayers as GetCannedPlayersBZZFRedFestival } from '../common/cannedPlayersBZZFRedFestivalGame';
import { GetCannedBadgeList } from '../common/cannedBadgeList';
import { GetCannedTrophyList } from '../common/cannedTrophyList';
import { User } from '../models/User';
import { RabbitMQPlayer } from '../models/RabbitMQPlayer';
import { assertTSExpressionWithTypeArguments } from '@babel/types';
import { BadgeData } from '../models/BadgeData';
import { TrophyData } from '../models/TrophyData';
import { cons } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { UserInfo } from 'os';
import { ThrowErrorMessage } from './errorHandler';
import { CannedPlayerInitData } from '../models/CannedPlayerInitData';
import bcrypt from "bcryptjs";



class MongoClientHelper{

    private mongoURL: string;
    private mongoDBName: string;
    private db: any;

    constructor(){
        this.mongoURL = "";
        this.mongoDBName = "";
    }



    public async InitMongoConnection(mongoUrl: string, mongoDBName: string){               
        this.mongoURL = mongoUrl;
        this.mongoDBName = mongoDBName;
        try{
            
            let mongoClient = new MongoClient(mongoUrl);
            await mongoClient.connect();
            this.db = mongoClient.db(mongoDBName);              
            
        }catch(err){
            console.error(`UH OH! Error: `, err);
        }   
    }

    public async ResetPlayerMachinePairingsCollection(collectionName: string){
        
        //this.DropCollection(collectionName);
        
        //this.CreateCollection(collectionName);
    }

    

    public async GetPlayerMachinePairings(collectionName: string): Promise<RabbitMQPlayer[]>{
        let result = await this.db.collection(collectionName).find().toArray();        
        return result;
    }

    public async GetMachinePairingForPlayer(collectionName: string, uuid:string): Promise<RabbitMQPlayer>{
        
        let player = await this.db.collection(collectionName).findOne({playerUUID: uuid});

        return player;
    }

    public async GetPlayerPairingForMachine(collectionName: string, machineID:string): Promise<RabbitMQPlayer>{
        console.log(`Fetching Machine Pairing for MachineUUID: ${machineID} from: ${collectionName}`);
        let player = await this.db.collection(collectionName).findOne({egmUUID: machineID});

        console.log('Player Record found: ' + JSON.stringify(player));

        return player;
    }

    public async RemoveMachinePairingForPlayer(collectionName: string, playerID:string, machineID:number){
        const query = { playerUUID: playerID, egmUUID: machineID};
        await this.db.collection(collectionName).findOneAndDelete(query);
    }

    public async UpdateUserData(userData: typeof User){
        const query = { uid: userData.uid };
        const update = {
            $set:{
                currentEventIndex: userData.currentEventIndex,
                trophies: userData.trophies,
                badges: userData.badges
            }
        }
        await this.db.collection('users').updateOne(query, update);
    }

    /*    
    1. Check for any records in the playerToMachinePairings for NewUser
    2. Delete the record (if any)    
    */
    public async EnsureDeleteExistingPairingRecordOfPlayer(newUserData: typeof User){
        
        /* Delete the first document in the "movies" collection that matches
        the specified query document */
        const query = { playerUUID: newUserData.playerUUID };
        let PLAYER_MACHINE_COLLECTION_NAME = 'playersToMachinePairings';
        await this.db.collection(PLAYER_MACHINE_COLLECTION_NAME).deleteOne(query);
    }

    public async GetUserByPlayerUUID(_playerUUID: string, calledBy:string): Promise<typeof User>{
        console.log(`!!! GetUserByPlayerUUID: ${calledBy} : uuid: ${_playerUUID}`);
        let result = {} as typeof User;
        result = await this.db.collection('users').findOne({uid: _playerUUID});
        if(result){
            console.log(`!!! GetUserByPlayerUUID: ${calledBy} : uuid${_playerUUID}; username: ${result.username}`);
        }else{
            console.log(`!!! GetUserByPlayerUUID did NOT find any player with uuid${_playerUUID}`);
        }
        return result;
    }

    public async GetLeaderboard(gameName: string): Promise<LeaderboardData[]>{
        // get an ascending order leaderboard; sorted based on a player's curPosition field
        let dbLeaderboard:LeaderboardData[] = await this.db.collection(gameName).find({}).sort({curPosition: 1}).toArray();
        return dbLeaderboard;
    }

    public async GetBadges() : Promise<BadgeData[]>{
        let dbBadges:BadgeData[] = await this.db.collection('badges').find({}).toArray();
        return dbBadges;
    }

    public async GetTrophies() : Promise<TrophyData[]>{
        let dbBadges:TrophyData[] = await this.db.collection('trophies').find({}).toArray();
        return dbBadges;
    }

    
    
    public async GenerateBadgeCollection(collectionName:string){
        await this.DropCollection(collectionName);
        await this.CreateCollection(collectionName);
        let badgeList = GetCannedBadgeList();
        await this.PopulateCollection(collectionName, badgeList);        
    }

    public async GenerateTrophyCollection(collectionName:string){
        await this.DropCollection(collectionName);
        await this.CreateCollection(collectionName);
        let trophyList = GetCannedTrophyList();
        await this.PopulateCollection(collectionName, trophyList);
    }

    //generic method to reset and populate a collection with data
    public async ResetAndPopulateCollection(collectionName:string, data:any[]){
       
        try{
            await this.CreateCollection(collectionName);
            await this.db.collection(collectionName).deleteMany();
        }
        catch{
            console.error(` !!!! Something went wrong while creating ${collectionName} collection`);
        }

        try{
            await this.PopulateCollection(collectionName, data);
        }catch(err){
            console.error(` !!!! Something went wrong while populating ${collectionName} collection`);
        }
        
    }

    //generic method to drop collection
    protected async DropCollection(collectionName:string){
        try{
            await this.db.collection(collectionName).drop();
        }
        catch(err){
            console.error(` !!!! Failed to drop ${collectionName} collection`);
        }
    }

    //generic helper method to create a collection
    protected async CreateCollection(collectionName:string){
        

        let collections = await this.db.listCollections({name: collectionName}).toArray();
        if(collections.length === 0){
            await this.db.createCollection(collectionName);
            console.log(`!!! Created collection: ${collectionName}`);
        }        
    }

    //generic helper method to populate a collection
    protected async PopulateCollection(collectionName:string, data:any[])
    {
        let collection = await this.db.collection(collectionName);

        if(collection)
        {
            for(var i = 0; i < data.length; i++){                        
                await collection.insertOne(data[i]);
            }
        }
    }

    protected GetCannedPlayersBasedOnGame(gameName: string): LeaderboardData[]{
        var result:LeaderboardData[] = GetCannedPlayersDragon();
        if(gameName === GameNames.BuffaloGame){
            result = GetCannedPlayersBuffalo();
        }
        else if(gameName === GameNames.BuffaloGold)
        {
            result = GetCannedPlayersBuffaloGold();
        }        
        else if(gameName === GameNames.GoldStacks)
        {
            result = GetCannedPlayersGoldStacks();
        }
        else if(gameName === GameNames.MightyCashLTHX)
        {
            result = GetCannedPlayersMightyCashLTHX();
        }
        else if(gameName === GameNames.LepreCoins)
        {
            result = GetCannedPlayersLepreCoins();
        }
        else if(gameName === GameNames.BZZFRedFestival)
        {
            result = GetCannedPlayersBZZFRedFestival();
        }
        return result;
    }
    
    public async ResetAndPopulateLeaderboards(leaderboardNames: string[]){       
        
        for(var i = 0; i < leaderboardNames.length; i++){
            var lbData = this.GetCannedPlayersBasedOnGame(leaderboardNames[i]);
            await this.ResetAndPopulateCollection(leaderboardNames[i], lbData);
        }
    }

    public async UpsertPlayerMachinePairing(playerData: RabbitMQPlayer, collectionName: string){
        try{           
            console.log(`!!! updating player on DB: ${JSON.stringify(playerData)}`);
            var playerMachinePairings = this.db.collection(collectionName);   
            
            const query = { egmUUID: playerData.egmUUID };
            const update = { $set: playerData};
            const options = { upsert: true };
            
            await playerMachinePairings.updateOne(query, update, options);    
        }catch(err){
            console.error(`Uh Oh! error in UpsertPlayerMachinePairing()`, err);
        }
    }

    // This will create a new record for playerData if it is NOT on the leaderboard collection yet
    // OR it will update the playerData record on the DB if it already exists
    public async UpsertPlayerDataOnLeaderboardDB(playerData: LeaderboardData, leaderboardName: string){
        try{           
            console.log(`!!! updating player on DB: ${JSON.stringify(playerData)}`);
            var leaderboardColl = this.db.collection(leaderboardName);   
            
            const query = { playerUUID: playerData.playerUUID };
            const update = { $set: playerData};
            const options = { upsert: true };
            
            await leaderboardColl.updateOne(query, update, options);    
        }catch(err){
            console.error(`Uh Oh! error in UpdatePlayerDataOnLeaderboardDB()`, err);
        }
    }

    public async UpsertUserData(userData: typeof User, userCollectionName: string){
        try{           
            console.log(`!!! updating player on DB: ${JSON.stringify(userData)}`);
            var collection = this.db.collection(userCollectionName);   
            
            const query = { playerUUID: userData.uid};
            const update = { $set: userData};
            const options = { upsert: true };
            
            await collection.updateOne(query, update, options);    
        }catch(err){
            console.error(`Uh Oh! error in UpsertUserData()`, err);
        }
    }

    public async DeletePlayerFromLeaderboardDB(playerID:string, leaderboardName:string){
        var leaderboard = this.db.collection(leaderboardName);

        await leaderboard.deleteMany({playerUUID: playerID});
    }

    public async EnsureCreateThenResetCannedPlayer(cannedUserInitData: CannedPlayerInitData){
        let user = await this.GetUserByPlayerUUID(cannedUserInitData.uuid, 'ResetPlayerBadgesAndTrophies') as typeof User;
        if(user){
            user = this.ResetUserData(user);                        
            await this.UpdateUserData(user);
        }else{
            let newCannedUser = {} as typeof User;
            newCannedUser.uid = cannedUserInitData.uuid;
            newCannedUser.avatarID = cannedUserInitData.avatarId;
            newCannedUser.username = cannedUserInitData.username;
            newCannedUser.trophies = [];
            newCannedUser.badges = [];
            let txtPwd = process.env.DEFAULT_PASSWORD ?? ThrowErrorMessage("ERROR: Null value for env variable DEFAULT_PASSWORD");
            //HASH the password
            const salt = await bcrypt.genSalt(10);
            newCannedUser.password = await bcrypt.hash(txtPwd, salt);
            await this.UpsertUserData(newCannedUser, "users");
        }
    }

    public async ResetPlayerBadgesAndTrophies(playerUUID:string){
        
        let user = await this.GetUserByPlayerUUID(playerUUID, 'ResetPlayerBadgesAndTrophies') as typeof User;
        if(user){
            user = this.ResetUserData(user);                        
            await this.UpdateUserData(user);
        }else{
            console.error(`Failed to reset badges & trophies for non-existent player; uuid: ${playerUUID}}`);
        }
    }

    private ResetUserData(user: typeof User): typeof User{
        user.badges.length = 0;
        user.trophies.length = 0;
        return user;
    }


}

export const MongoClientHelperInstance = new MongoClientHelper();