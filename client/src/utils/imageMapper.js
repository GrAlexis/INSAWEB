import WEI_TC from '../assets/events/WEI_TC.png';
import WEC_TC from '../assets/events/WEC_TC.png';
import Pigeon from '../assets/icons/sheesh/pigeon.jpg';
import Cup from '../assets/icons/sheesh/cup.png';
import Pied from '../assets/icons/sheesh/pied.jpg';
import Canoe from '../assets/icons/sheesh/canoe.jpg';
import SousEau from '../assets/icons/sheesh/sousEau.jpg';

const imageMapper = {
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
