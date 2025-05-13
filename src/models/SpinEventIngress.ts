import * as typeHelper from "io-ts";
import {PathReporter} from "io-ts/PathReporter";
import {isLeft} from "fp-ts/Either";

const SpinEventIngress = typeHelper.type({
    machineUUID: typeHelper.string,
    playerUUID: typeHelper.string,
    username: typeHelper.string,
    gameName: typeHelper.string,
    winAmount: typeHelper.number,
    betAmount: typeHelper.number
});
type SpinEventIngressT = typeHelper.TypeOf<typeof SpinEventIngress>;


//setting betAmount to a hardcoded magic number for demo, value will always be 60 millicents
export function DecodeData(data:any): SpinEventIngressT{
    let result = {} as SpinEventIngressT;
    result.machineUUID = data.machineUUID;
    result.playerUUID = data.playerUUID;
    result.username = data.username;
    result.gameName = data.gameName;
    result.winAmount = data.finalWin;
    result.betAmount = 60000;

    return result;
}

export default SpinEventIngressT;