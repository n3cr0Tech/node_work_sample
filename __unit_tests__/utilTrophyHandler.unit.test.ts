import { TrophyHandler, TrophyHandlerInstance } from '../src/utils/trophyHandler';
import mongoose, { mongo } from 'mongoose';
import { User } from '../src/models/User';
import { TrophyData } from '../src/models/TrophyData';
import { PlayerData } from '../src/models/PlayerData';
import { LeaderboardData } from '../src/models/LeaderboardData';

afterEach(()=>{    
    jest.clearAllMocks();
});

test('EnsureSaveUniqueTrophyIntoUserRecord calls proper functions', () => {    
    let expected = {};
    let mockUserInfo = User;
    mockUserInfo.uuid = "123-uid";
    mockUserInfo.username = "foo-username";
    mockUserInfo.password = "123-pwd";
    mockUserInfo.trophies = [];
    let mockTrophyData = {} as TrophyData;
    let mockNewTrophies: TrophyData[] = [mockTrophyData];
    let updateTrophiesFunc = jest.spyOn(TrophyHandlerInstance, 'UpdateTrophiesRecord').mockImplementation(() => expected);
    let getUniqueTrophiesFunc = jest.spyOn(TrophyHandler.prototype as any, 'GetUniqueTrophies').mockImplementation(() => mockNewTrophies);
    
    TrophyHandlerInstance.EnsureSaveUniqueTrophyIntoUserRecord(mockNewTrophies, mockUserInfo);    
    expect(updateTrophiesFunc).toBeCalledTimes(1);
});

test('EnsureSaveUniqueTrophyIntoUserRecord saves existing trophies with new trophies properly', () => {    
    let trophy1 = {} as TrophyData;
    trophy1.uid = "111";    
    let mockUserInfo = User;   
    mockUserInfo.trophies = [trophy1];    
    let trophy2 = {} as TrophyData;
    trophy2.uid = "222";
    let expected: TrophyData[] = [trophy1, trophy2];
    let mockNewTrophies: TrophyData[] = [trophy2];        
    let updateTrophiesFunc = jest.spyOn(TrophyHandlerInstance, 'UpdateTrophiesRecord').mockImplementation(() => expected);        
    
    TrophyHandlerInstance.EnsureSaveUniqueTrophyIntoUserRecord(mockNewTrophies, mockUserInfo);
    expect(updateTrophiesFunc).toBeCalledTimes(1);
    expect(TrophyHandlerInstance.UpdateTrophiesRecord).toHaveBeenCalledWith(mockUserInfo, expected);
});

test('EnsureSaveUniqueTrophyIntoUserRecord appends empty list of new trophies properly', () => {    
    let trophy1 = {} as TrophyData;
    trophy1.uid = "111";    
    let mockUserInfo = User;    
    mockUserInfo.trophies = [trophy1];        
    let expected: TrophyData[] = [trophy1];
    let mockNewTrophies: TrophyData[] = [];  
    let updateTrophiesFunc = jest.spyOn(TrophyHandlerInstance, 'UpdateTrophiesRecord').mockImplementation(() => expected);
    let getUniqueTrophiesFunc = jest.spyOn(TrophyHandler.prototype as any, 'GetUniqueTrophies').mockImplementation(() => mockNewTrophies);

    TrophyHandlerInstance.EnsureSaveUniqueTrophyIntoUserRecord(mockNewTrophies, mockUserInfo);    
    expect(updateTrophiesFunc).toHaveBeenCalledWith(mockUserInfo, expected);
});

test('GetUniqueTrophies returns ONLY trophies that the Player does NOT already have',() => {
    let trophy1 = {} as TrophyData;
    trophy1.uid = "111"; 
    let trophy2 = {} as TrophyData;
    trophy2.uid = "222";
    let trophy3 = {} as TrophyData;
    trophy3.uid = "333";
    let mockNewTrophies:TrophyData[] = [trophy1, trophy2, trophy3];
    let mockPlayerTrophies:TrophyData[] = [trophy1];
    let expected:TrophyData[] = [trophy2, trophy3];
    let result = TrophyHandlerInstance.GetUniqueTrophies(mockNewTrophies, mockPlayerTrophies);
    expect(result).toEqual(expected);
});

test('GetUniqueTrophies returns properly when there are no new unique trophies',() => {
    let trophy1 = {} as TrophyData;
    trophy1.uid = "111";    
    let mockNewTrophies:TrophyData[] = [trophy1];
    let mockPlayerTrophies:TrophyData[] = [trophy1];
    let expected:TrophyData[] = [];
    let result = TrophyHandlerInstance.GetUniqueTrophies(mockNewTrophies, mockPlayerTrophies);
    expect(result).toEqual(expected);
});