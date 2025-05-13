import { BadgeData } from "../models/BadgeData";

const CannedBadgeList = [
    {
        "uid":"G2E-001",
        "name":"G2E Day 1",
        "conditionsToAchieve":"Login and spin once on day 1 at G2E"
    },
    {
        "uid":"G2E-002",
        "name":"G2E Day 2",
        "conditionsToAchieve":"Login and spin once on day 1 at G2E"
    },
    {
        "uid":"G2E-003",
        "name":"G2E Day 3",
        "conditionsToAchieve":"Login and spin once on day 1 at G2E"
    }
]

export function GetCannedBadgeList(): BadgeData[]{
    let deepCopy = CannedBadgeList.map(x => Object.assign({}, x));
    return deepCopy;
}