import { LeaderboardData } from "../models/LeaderboardData";
const CannedGoldStacksDancingFooGame = [
    {
        "username": "WhitneyLL",
        "playerUUID": "canned-player-4507",
        "machineUUID": "canned-machine-6602",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 282,
        "prevPosition": 1,
        "curPosition": 1,
        "avatarID": "cards"
    },
    {
        "username": "CliffMach5",
        "playerUUID": "canned-player-3591",
        "machineUUID": "canned-machine-5202",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 223,
        "prevPosition": 2,
        "curPosition": 2,
        "avatarID": "football"
    },
    {
        "username": "IAmBatman",
        "playerUUID": "canned-player-1160",
        "machineUUID": "canned-machine-7324",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 216,
        "prevPosition": 3,
        "curPosition": 3,
        "avatarID": "bike"
    },
    {
        "username": "Zigmar52",
        "playerUUID": "canned-player-2033",
        "machineUUID": "canned-machine-1415",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 196,
        "prevPosition": 4,
        "curPosition": 4,
        "avatarID": "pizza"
    },
    {
        "username": "Woldorf",
        "playerUUID": "canned-player-663",
        "machineUUID": "canned-machine-546",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 170,
        "prevPosition": 5,
        "curPosition": 5,
        "avatarID": "chess"
    },
    {
        "username": "SevenOhTwo",
        "playerUUID": "canned-player-1725",
        "machineUUID": "canned-machine-9235",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 123,
        "prevPosition": 6,
        "curPosition": 6,
        "avatarID": "coffee"
    },
    {
        "username": "Zoltar",
        "playerUUID": "canned-player-3048",
        "machineUUID": "canned-machine-6947",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 90,
        "prevPosition": 7,
        "curPosition": 7,
        "avatarID": "cherries"
    },
    {
        "username": "OptimusPrime",
        "playerUUID": "canned-player-5646",
        "machineUUID": "canned-machine-2",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 88,
        "prevPosition": 8,
        "curPosition": 8,
        "avatarID": "car"
    },
    {
        "username": "BBRJR",
        "playerUUID": "canned-player-413",
        "machineUUID": "canned-machine-452",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 59,
        "prevPosition": 9,
        "curPosition": 9,
        "avatarID": "palmtree"
    },
    {
        "username": "Slotzzy",
        "playerUUID": "canned-player-8039",
        "machineUUID": "canned-machine-4226",
        "gameName": "GoldStacksDancingFoo",
        "multiplier": 47,
        "prevPosition": 10,
        "curPosition": 10,
        "avatarID": "car"
    }
]
export function GetCannedPlayers(){
    let deepCopy = CannedGoldStacksDancingFooGame.map(x => Object.assign({}, x));
    return deepCopy;
}