

const CannedPlayersDragonGame = [
    {
        "username": "MoonlitSorcerer",
        "playerUUID": "canned-player-8532",
        "machineUUID": "canned-machine-5137",
        "gameName": "dragon-game",
        "multiplier": 36784,
        "prevPosition": 1,
        "curPosition": 1,
        "avatarID": "cat"
    },
    {
        "username": "SilentNinja",
        "playerUUID": "canned-player-5848",
        "machineUUID": "canned-machine-9658",
        "gameName": "dragon-game",
        "multiplier": 29672,
        "prevPosition": 2,
        "curPosition": 2,
        "avatarID": "cat"
    },
    {
        "username": "SolarPhoenix",
        "playerUUID": "canned-player-7012",
        "machineUUID": "canned-machine-1378",
        "gameName": "dragon-game",
        "multiplier": 94523,
        "prevPosition": 3,
        "curPosition": 3,
        "avatarID": "cat"
    },
    {
        "username": "VortexStorm",
        "playerUUID": "canned-player-4532",
        "machineUUID": "canned-machine-3967",
        "gameName": "dragon-game",
        "multiplier": 9481,
        "prevPosition": 4,
        "curPosition": 4,
        "avatarID": "cat"
    },
    {
        "username": "MightyDragon",
        "playerUUID": "canned-player-3356",
        "machineUUID": "canned-machine-7931",
        "gameName": "dragon-game",
        "multiplier": 69037,
        "prevPosition": 5,
        "curPosition": 5,
        "avatarID": "cat"
    },
    {
        "username": "DaringAdventurer",
        "playerUUID": "canned-player-1862",
        "machineUUID": "canned-machine-1565",
        "gameName": "dragon-game",
        "multiplier": 31542,
        "prevPosition": 6,
        "curPosition": 6,
        "avatarID": "cat"
    },
    {
        "username": "ThunderPunch",
        "playerUUID": "canned-player-7703",
        "machineUUID": "canned-machine-7895",
        "gameName": "dragon-game",
        "multiplier": 44102,
        "prevPosition": 7,
        "curPosition": 7,
        "avatarID": "cat"
    },
    {
        "username": "StarGazer88",
        "playerUUID": "canned-player-5769",
        "machineUUID": "canned-machine-1489",
        "gameName": "dragon-game",
        "multiplier": 5230,
        "prevPosition": 8,
        "curPosition": 8,
        "avatarID": "cat"
    },
    {
        "username": "WhisperingShade",
        "playerUUID": "canned-player-6039",
        "machineUUID": "canned-machine-1269",
        "gameName": "dragon-game",
        "multiplier": 6234,
        "prevPosition": 9,
        "curPosition": 9,
        "avatarID": "cat"
    },
    {
        "username": "CeruleanWave",
        "playerUUID": "canned-player-6794",
        "machineUUID": "canned-machine-8130",
        "gameName": "dragon-game",
        "multiplier": 24010,
        "prevPosition": 10,
        "curPosition": 10,
        "avatarID": "cat"
    }
  
]

export function GetCannedPlayers(){
    let deepCopy = CannedPlayersDragonGame.map(x => Object.assign({}, x));
    return deepCopy;
}