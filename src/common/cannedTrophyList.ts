import { TrophyData } from "../models/TrophyData";

const CannedTrophyList = [
    {
        "uid":"BuffaloGold-001",
        "name":"Wealthy Winner",
        "conditionsToAchieve":"Get a Win Multiplier of 50x"
    },
    {
        "uid":"WildLepreCoins-001",
        "name":"Wealthy Winner",
        "conditionsToAchieve":"Get a Win Multiplier of 50x"
    }
]

export function GetCannedTrophyList(): TrophyData[]{
    let deepCopy = CannedTrophyList.map(x => Object.assign({}, x));
    return deepCopy;
}