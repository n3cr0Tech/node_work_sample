import { User } from '../models/User';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import {ThrowErrorMessage} from "../utils/errorHandler";
import ShortUniqueId from "short-unique-id";
import { GameNames } from '../common/gameNames';
import { connect } from 'http2';
import { LeaderboardData } from '../models/LeaderboardData';
import SpinEventIngressT from '../models/SpinEventIngress';
import { unsubscribe } from 'diagnostics_channel';
import { PlayerData } from '../models/PlayerData';
import { MongoClientHelperInstance } from '../utils/mongoClientHelper';
import { json } from 'stream/consumers';

dotenv.config(); //read the .env file


export class LeaderboardHandler{       
    private leaderboardNames: string[];
    private leaderboardCache :Map<string, LeaderboardData[]>;
    

    constructor(){       
        this.leaderboardNames = [
            GameNames.BuffaloGold,
            GameNames.LepreCoins,
            GameNames.GoldStacks,
            GameNames.BZZFRedFestival];
        this.leaderboardCache = new Map<string, LeaderboardData[]>(); 
        
    }

    public GetLeaderboardNames(): string[]{
        return this.leaderboardNames;
    }

    public async Init(){
        
    }

    public async CacheLeaderboards()
    {
         for(var i = 0; i < this.leaderboardNames.length; ++i)
         {
             var boardName = this.leaderboardNames[i];
             let leaderboard = await(MongoClientHelperInstance.GetLeaderboard(boardName));             
             this.leaderboardCache.set(boardName, leaderboard);
        }        
    }

    public UpdateLeaderboardCache(board:LeaderboardData[])
    {
        this.leaderboardCache.set(board[0].gameName, board);
    }

    public GetLeaderboardCache()
    {
        return this.leaderboardCache;
    }

    public GetResolvedLeaderboardDataWithPlayerSpinEvent(dbLeaderboard: LeaderboardData[], playerData: SpinEventIngressT, userData:typeof User): LeaderboardData[]{        
        // attach player to the end if they're not already on the Leaderboard       
        let resolvedLeaderboard: LeaderboardData[] = this.ResolveLeaderboardBasedOnIngressSpinEvent(dbLeaderboard, playerData, userData.avatarID);               
        return resolvedLeaderboard;
    }
    
    public ResolveLeaderboardBasedOnIngressSpinEvent(dbLeaderboard: LeaderboardData[], playerData: SpinEventIngressT, avatarID:string): LeaderboardData[]{          
        let playerLBData = this.GetPlayerDataOfTypeLeaderboardData(dbLeaderboard, playerData, avatarID);  
        let leaderboardWithPlayerData: LeaderboardData[] = this.EnsureInsertPlayerDataIntoLB(dbLeaderboard, playerLBData);   
        let resolvedLeaderboard:LeaderboardData[] = this.SortLeaderboardAscendingOrderByMultiplier(leaderboardWithPlayerData, playerLBData);
        this.UpdatePositionTracking(resolvedLeaderboard);        
        return resolvedLeaderboard;
    }

    public async UpdateLeaderboardDB(leaderboard: LeaderboardData[], gameName:string)
    {
        for(var i = 0; i < leaderboard.length; ++i)
        {
            await MongoClientHelperInstance.UpsertPlayerDataOnLeaderboardDB(leaderboard[i], gameName);
        }
    }

    // Ensures to return player data of type LeaderboardData
    public GetPlayerDataOfTypeLeaderboardData(dbLeaderboard: LeaderboardData[], playerData: SpinEventIngressT, avatarID:string): LeaderboardData{
        let playerLeaderboardData = {} as LeaderboardData;     
        //New player being added to leaderboard list            
        playerLeaderboardData = this.ConvertIngressPlayerDataToLeaderboardData(playerData);
        playerLeaderboardData.avatarID = avatarID;      
        return playerLeaderboardData;
    }

    public async ResetPlayerOnLeaderboard(machineUUID:string){

        let playerData = this.GetPlayerLBData(machineUUID);

        if(playerData !== undefined)
        {
            await MongoClientHelperInstance.DeletePlayerFromLeaderboardDB(playerData.playerUUID, playerData.gameName);

            //resort leadboard
            let dbLeaderboard = await MongoClientHelperInstance.GetLeaderboard(playerData.gameName);
            dbLeaderboard.sort((a, b) => (a.multiplier > b.multiplier) ? -1 : 1);
            this.UpdatePositionTracking(dbLeaderboard);
            this.UpdateLeaderboardCache(dbLeaderboard);
            await this.UpdateLeaderboardDB(dbLeaderboard, playerData.gameName);
        }
    }

    protected EnsureInsertPlayerDataIntoLB(dbLeaderboard: LeaderboardData[], playerData: LeaderboardData):LeaderboardData[]{
        let result:LeaderboardData[] = dbLeaderboard;
        let playerIndexOnLB = this.PlayerIndexOnLeaderboard(dbLeaderboard, playerData.playerUUID);
        let playerIsOnLB = playerIndexOnLB > -1;
        if(playerIsOnLB){
            //Update the multiplier field, only if its better
            if(playerData.multiplier > dbLeaderboard[playerIndexOnLB].multiplier){
                dbLeaderboard[playerIndexOnLB].multiplier = playerData.multiplier;
            }
                      
        }else{
            result.push(playerData);
        }
        return result;
    }

    protected ConvertIngressPlayerDataToLeaderboardData(playerData: SpinEventIngressT): LeaderboardData{
        let playerLeaderboardData = {} as LeaderboardData;
        let userInfo = MongoClientHelperInstance.GetUserByPlayerUUID(playerData.playerUUID, 'ConvertIngressPlayerDataToLeaderboardData') as typeof User;

        playerLeaderboardData.gameName = playerData.gameName;
        playerLeaderboardData.machineUUID = playerData.machineUUID;
        playerLeaderboardData.multiplier = Math.floor(playerData.winAmount / playerData.betAmount);
        playerLeaderboardData.playerUUID = playerData.playerUUID;
        playerLeaderboardData.username = playerData.username;
        playerLeaderboardData.avatarID = userInfo.avatarID;

        if(Number.isNaN(playerLeaderboardData.multiplier))
        {
            console.log("!!!! Multiplier resulted in NaN");
        }

        return playerLeaderboardData;      
    }

    // returns an index of player on array based on playerUUID
    // if NOT FOUND, then return -1
    public PlayerIndexOnLeaderboard(leaderboard: LeaderboardData[], playerUUID:string): number{
        let result = -1;
        for(let i = 0; i < leaderboard.length; i++){
            if(leaderboard[i].playerUUID == playerUUID){
                result = i;
                break;
            }
        } 
        return result;
    }
    
    public GetPlayerLBData(machineID:string): LeaderboardData | undefined{
        let playerLeaderboardData = undefined;

        for(let i = 0; i < this.leaderboardNames.length; ++i){
            let leaderboard = this.GetLeaderboardCache().get(this.leaderboardNames[i]);

            if(leaderboard !== undefined){
                let player = leaderboard.find(element => element.machineUUID === machineID);

                if(player !== undefined){
                    playerLeaderboardData = player;
                    break;
                }
            }

        }

        return playerLeaderboardData
    }

    private SortLeaderboardAscendingOrderByMultiplier(unresolvedLeaderboard: LeaderboardData[], playerData: LeaderboardData): LeaderboardData[]{              
        unresolvedLeaderboard.sort((a, b) => (a.multiplier > b.multiplier) ? -1 : 1);
        unresolvedLeaderboard = this.EnsureHandleAnyTiesWithPlayer(unresolvedLeaderboard, playerData);
        return unresolvedLeaderboard;
    }

    //Makes sure that if there's a tie between the current player being resolved and the element ahead of them
    //then swap places such that the player being resolved will be on the higher spot on the leaderboard
    private EnsureHandleAnyTiesWithPlayer(unresolvedLeaderboard: LeaderboardData[], playerData: LeaderboardData): LeaderboardData[]{
        let playerBeingResolvedIndex = this.PlayerIndexOnLeaderboard(unresolvedLeaderboard, playerData.playerUUID);
        
        // ONLY do this operation if the player is between the first and last positions
        if(playerBeingResolvedIndex > 0 && playerBeingResolvedIndex < unresolvedLeaderboard.length - 1){
            let indexOfPlayerAhead = playerBeingResolvedIndex - 1;
            let playerBeingResolvedHasAieWithPlayerAhead = unresolvedLeaderboard[indexOfPlayerAhead].multiplier === playerData.multiplier;
            if(playerBeingResolvedHasAieWithPlayerAhead){
                //swap the players so that the player being resolved ends up ahead
                let tmp = unresolvedLeaderboard[indexOfPlayerAhead];
                unresolvedLeaderboard[indexOfPlayerAhead] = playerData;
                unresolvedLeaderboard[playerBeingResolvedIndex] = tmp;
            }
        }
        return unresolvedLeaderboard;
    }

    private UpdatePositionTracking(resolvedLeaderboard: LeaderboardData[]){
        for(var i = 0; i < resolvedLeaderboard.length; ++i)
        {
            if(resolvedLeaderboard[i].prevPosition === null || resolvedLeaderboard[i].prevPosition === undefined)
            {
                resolvedLeaderboard[i].prevPosition = i + 1;
            }
            else
            {
                resolvedLeaderboard[i].prevPosition = resolvedLeaderboard[i].curPosition;
            }

            resolvedLeaderboard[i].curPosition = i + 1;
        }
    }


}


export const LeaderboardHandlerInstance = new LeaderboardHandler();