import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


import './Sheesh.css';
import EventCard from '../Events/EventCard';
import ChallengeCard from './ChallengeCard';
import { getImageByKey } from '../../utils/imageMapper';

const Sheesh = () => {
  const { challengeId } = useParams();
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [openChallengeId, setOpenChallengeId] = useState(null);
  const challengeRefs = useRef({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventResponse = await axios.get('http://localhost:5000/events');
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
        const challengeResponse = await axios.get('http://localhost:5000/challenges');
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

  useEffect(() => {
    if (challengeId && challengeRefs.current[challengeId]) {
      challengeRefs.current[challengeId].scrollIntoView({ behavior: 'smooth' });
    }
  }, [challengeId, challenges]);

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
              <div
                key={challenge.id}
                ref={el => (challengeRefs.current[challenge.id] = el)}
              >
                <ChallengeCard 
                  challenge={challenge}
                  isOpen={openChallengeId === challenge.id}
                  setOpenChallengeId={setOpenChallengeId}
                />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Sheesh;
