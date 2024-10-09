import config from '../config';
// utils/rewardParser.js
export const parseReward = (rewardString) => {
    const regex = /(\d+)\s*sh/i;
    const match = regex.exec(rewardString);
    if (match) {
        return parseInt(match[1], 10);
    }
    return 0;
};

