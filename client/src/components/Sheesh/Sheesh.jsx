import React, { useEffect, useState, useRef } from 'react';
import config from '../../config';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Sheesh.css';
import EventCard from '../Events/EventCard';
import ChallengeCard from './ChallengeCard';
import Animation from '../Animation';
import { getImageByKey } from '../../utils/imageMapper';
import { useUser } from '../../hooks/commonHooks/UserContext';
import { useNavigate } from 'react-router-dom';

const Sheesh = ({ showNavBar }) => {
  const { challengeId } = useParams();
  const { user, setUser } = useUser(); // Assuming you have a setUser function to update the user context
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [pinnedChallenges, setPinnedChallenges] = useState([]); // Add state to store pinned challenges
  const [openChallengeId, setOpenChallengeId] = useState(null);
  const challengeRefs = useRef({});
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');

        if (!token) {
          // If no token, redirect to login page
          navigate('/login');
          return; // Exit useEffect early to prevent further code execution
        }

    showNavBar()
    const fetchEvents = async () => {
      try {
        const eventResponse = await axios.get(config.backendAPI+'/events');
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
        const challengeResponse = await axios.get(config.backendAPI+'/challenges');
        const challengesWithIcons = challengeResponse.data.map(challenge => ({
          ...challenge,
          icon: getImageByKey(challenge.icon)
        }));
        setChallenges(challengesWithIcons);
      } catch (error) {
        console.error('Error fetching challenges', error);
      }
    };

    // Calculate pinned challenges when both user and challenges are available
    const calculatePinnedChallenges = () => {
      if (user && challenges.length > 0) {
        const userPinnedChallenges = challenges.filter(challenge => user.pinnedChallenges.includes(challenge.id));
        setPinnedChallenges(userPinnedChallenges);
      }
    };

    fetchEvents();
    fetchChallenges();
    calculatePinnedChallenges();
  }, [user]);

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
    <Animation>
      <div className="home-page">
        <header>
          {/* Sort options or other header elements */}
        </header>
        
        {/* Display pinned challenges first */}
        {pinnedChallenges.length > 0 && (
          <div className="pinned-challenges">
            <h2>Sheesh épinglés</h2>
            {pinnedChallenges.map(challenge => (
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
        )}

        {/* Display other challenges under their respective events */}
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
    </Animation>
  );
};

export default Sheesh;
