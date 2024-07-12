import React, { useEffect, useState } from 'react';
import axios from 'axios';

import './Sheesh.css';
import EventCard from '../Events/EventCard';
import ChallengeCard from './ChallengeCard';
import { getImageByKey } from '../../utils/imageMapper';



// const events = [
//   {
//     id: 1,
//     image: WEI_TC,
//     title: 'WEI TC',
//     date: '21-23 septembre',
//     participants: 25,
//     sheeshes: 10,
//     Organisateur: 'Astus',
//     challenges: [
//       { id: 1, icon: Pigeon, title: 'Attraper un pigeon', reward: '1 pinte + 200 sh', limitDate: '24/09/2024' },
//       { id: 2, icon: Cup, title: 'Ramasser 20 eco-cups', reward: '1 frite + 100 sh', limitDate: '25/09/2024'  },
//       { id: 3, icon: Pied, title: 'Trouver 3 pieds nus', reward: '1 frite + 50 sh', limitDate: '26/09/2024' },
//     ],
//   },
//   {
//     id: 2,
//     image: WEC_TC,
//     title: 'Week-End canoë TC',
//     date: '26-27 mai',
//     participants: 25,
//     sheeshes: 10,
//     organisateur: 'Astus',
//     challenges: [
//       { id: 4, icon: Canoe, title: 'Gagner la course de canoë', reward: '1 pinte + 200 sh', limitDate: '27/09/2024' },
//       { id: 5, icon: Canoe, title: 'Retourner un canoë', reward: '1 frite + 100 sh', limitDate: '28/09/2024' },
//       { id: 6, icon: SousEau, title: 'Prendre une photo sous l\'eau', reward: '1 frite + 50 sh', limitDate: '29/09/2024' },
//     ],
//   },
// ];

const Sheesh = () => {
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventResponse = await axios.get('http://localhost:5001/events');
        const eventsWithImages = eventResponse.data.map(event => ({
          ...event,
          image: getImageByKey(event.image)
        }));
        setEvents(eventsWithImages);
      } catch (error) {
        console.error('Error fetching events', error);
      }
    };

    const fetchChallenges = async () => {
      try {
        const challengeResponse = await axios.get('http://localhost:5001/challenges');
        console.log(challengeResponse.data)
        const challengesWithIcons = challengeResponse.data.map(challenge => ({
          ...challenge,
          icon: getImageByKey(challenge.icon)
        }));
        setChallenges(challengesWithIcons);
      } catch (error) {
        console.error('Error fetching challenges', error);
      }
    };

    fetchEvents();
    fetchChallenges();
  }, []);

  const getEventChallenges = (eventChallenges) => {
    const challengeIds = eventChallenges.split(',').map(id => id.trim());
    return challenges.filter(challenge => challengeIds.includes(challenge.id));
  };

  return (
    <div className="home-page">
      <header>
        {/* <button className="back-button">vers Place Publique</button> */}
        <div className="sort-options">
          <label>trier par :</label>
          <select>
            <option value="datePlusRecent">Date + recents</option>
            <option value="dateMoinRecent">Date - recents</option>
            <option value="plusParticipants">Participants +</option>
            <option value="moinsParticipants">Participants -</option>
            <option value="gainsImportant">Gains +</option>

          </select>
        </div>
      </header>
      {events.map(event => (
        <div key={event.id} className="event-section">
          <EventCard event={event} />
          {getEventChallenges(event.challenges).map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Sheesh;
