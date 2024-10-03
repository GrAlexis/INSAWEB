import WEI_TC from '../assets/events/WEI_TC.png';
import config from "../config";
import WEC_TC from '../assets/events/WEC_TC.png';
import RALLYE from '../assets/events/RALLYE.jpg'
import Pigeon from '../assets/icons/sheesh/pigeon.jpg';
import Cup from '../assets/icons/sheesh/cup.png';
import Pied from '../assets/icons/sheesh/pied.jpg';
import Canoe from '../assets/icons/sheesh/canoe.jpg';
import SousEau from '../assets/icons/sheesh/sousEau.jpg';

import fries_reward_icon from '../assets/icons/rewards/fries.png';
import default_reward_icon from '../assets/icons/rewards/default.png';
import beer_reward_icon from '../assets/icons/rewards/beer.png';

import gold_prestige_icon from '../assets/icons/prestige/gold.png';
import silver_prestige_icon from '../assets/icons/prestige/silver.webp';
import bronze_prestige_icon from '../assets/icons/prestige/bronze.png';

export const imageMapper = {
  'RALLYE': RALLYE,
  'WEI_TC': WEI_TC,
  'WEC_TC': WEC_TC,
  'pigeon': Pigeon,
  'cup': Cup,
  'pied': Pied,
  'canoe': Canoe,
  'sousEau': SousEau,
};

export const getImageByKey = (key) => {
  return imageMapper[key] || null;
};

//to manage reward icon specific images

const rewardIconMapper = {
  'frite': fries_reward_icon,
  'frites': fries_reward_icon,
  'pinte': beer_reward_icon,
  'biere': beer_reward_icon,
  'bieres': beer_reward_icon,
};

export const getRewardIcon = (reward) => {
  const normalizedReward = reward.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [key, icon] of Object.entries(rewardIconMapper)) {
    if (normalizedReward.includes(key)) {
      return icon;
    }
  }

  return default_reward_icon;
};

//to manage rarity/prestige icon specific images

const prestigeIconMapper = {
  'gold': gold_prestige_icon,
  'silver': silver_prestige_icon,
  'bronze': bronze_prestige_icon,
};

export const getPrestigeIcon = (prestige) => {
  return prestigeIconMapper[prestige.toLowerCase()] || null;
};