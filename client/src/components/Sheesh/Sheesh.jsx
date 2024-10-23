import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getImageByKey } from '../../utils/imageMapper';
import { useUser } from '../../hooks/commonHooks/UserContext';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';
import config from '../../config';
import EventCard from '../Events/EventCard';
import ChallengeCard from './ChallengeCard';
import Animation from '../Animation';
import SearchBar from '../SearchBar/SearchBar';
import './Sheesh.css';

const Sheesh = ({ showNavBar }) => {
  const { challengeId } = useParams();
  const { selectedUniverse } = useUniverse();
  const { user, setUser } = useUser();
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]); 
  const [pinnedChallenges, setPinnedChallenges] = useState([]);
  const [openChallengeId, setOpenChallengeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); 
  const challengeRefs = useRef({});
  const [openEventId, setOpenEventId] = useState(null);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    reward: '',
    eventId: '',
    isCollective: false,
  });
  const [backgroundColor, setBackgroundColor] = useState('#E8EACC'); 

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStyles = async () => {
      var bgColor = '#E8EACC';
      if (selectedUniverse.styles && selectedUniverse.styles['mainBackgroundColor']) {
        bgColor = selectedUniverse.styles['mainBackgroundColor'];
      }
      console.log("bgColor "+bgColor)

      setBackgroundColor(bgColor);
    }
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    showNavBar();

    const fetchEvents = async () => {
      try {
        const eventResponse = await axios.get(`${config.backendAPI}/events`, {
          params: { universeId: selectedUniverse._id }
        });
        const eventsWithImages = eventResponse.data.map(event => ({
          ...event,
          image: event.image
        }));
        setEvents(eventsWithImages);
      } catch (error) {
        console.error('Error fetching events', error);
      }
    };

    const fetchChallenges = async () => {
      try {
        const challengeResponse = await axios.get(config.backendAPI + '/challenges');
        const challengesWithIcons = challengeResponse.data.map(challenge => ({
          ...challenge,
          icon: getImageByKey(challenge.icon)
        }));
        setChallenges(challengesWithIcons);
        setFilteredChallenges(challengesWithIcons); 
      } catch (error) {
        console.error('Error fetching challenges', error);
      }
    };

    const calculatePinnedChallenges = () => {
      if (user && challenges.length > 0) {
        const userPinnedChallenges = challenges.filter(challenge =>
          user.pinnedChallenges.includes(challenge.id) &&
          selectedUniverse.events.includes(challenge.eventId)  // Ensure the challenge's eventId belongs to the selectedUniverse
        );
        setPinnedChallenges(userPinnedChallenges);
      }
    };
    if (selectedUniverse) {
      fetchStyles()
    }

    fetchEvents();
    fetchChallenges();
    calculatePinnedChallenges();
  }, [user]);

  useEffect(() => {
    if (challengeId && challengeRefs.current[challengeId]) {
      challengeRefs.current[challengeId].scrollIntoView({ behavior: 'smooth' });
    }
  }, [challengeId, challenges]);

  const initializeAndFetchData = async (eventId) => {
    try {
      const universe = user.universes[selectedUniverse._id];
      if (!universe || !universe.events[eventId]) {
        // Initialize the universe and event if they don't exist
        await axios.post(`${config.backendAPI}/users/initialize-universe`, {
          userId: user._id,
          universeId: selectedUniverse._id,
          eventId: eventId,
        });
      }
    } catch (error) {
      console.error('Error initializing universe and event:', error);
    }
  };

  useEffect(() => {
    if (events.length > 0) {
      // Initialize each event in the selected universe
      events.forEach(event => {
        initializeAndFetchData(event._id);
      });
    }
  }, [events, user, selectedUniverse]);

  const toggleForm = (eventId) => {
    if (openEventId === eventId) {
      setOpenEventId(null); // Close the form if it's already open
    } else {
      setNewChallenge({ ...newChallenge, eventId });
      setOpenEventId(eventId); // Open the form for the selected event
    }
  };

  const handleInputChange = (e) => {
      setNewChallenge({
        ...newChallenge,
        [e.target.name]: e.target.value,
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Fetch all challenges to generate a unique ID
      const allChallengeIdsResponse = await axios.get(config.backendAPI + '/challenges/ids');
      const allChallengeIds = allChallengeIdsResponse.data.map(challenge => parseInt(challenge.id, 10));

      const newId = (allChallengeIds.length > 0 ? Math.max(...allChallengeIds) + 1 : 10) || 10;
      const response = await axios.post(config.backendAPI + '/challenges', {
        id: newId,
        ...newChallenge,
        reward: "X Sh",
        isAccepted: false
      });
      if (response.status === 201) {
        alert('Challenge suggested successfully!');
        setOpenEventId(null); // Close the form on success
      }
    } catch (error) {
      console.error('Error suggesting challenge', error);
    }
  };

  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); 
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    const normalizedQuery = normalizeString(query);

    const filtered = challenges.filter(challenge =>
      normalizeString(challenge.title).includes(normalizedQuery)
    );
    setFilteredChallenges(filtered); 
  };

  const getEventChallenges = (eventChallenges) => {
    if (!eventChallenges || typeof eventChallenges !== 'string') {
      console.warn('No valid eventChallenges provided or challenges is undefined');
      return [];
    }

    const challengeIds = eventChallenges.split(',').map(id => id.trim());
    return filteredChallenges.filter(challenge => challengeIds.includes(challenge.id) && challenge.isAccepted === true); 
  };

  return (
    <Animation>
      <div className="sheesh-page" style={{backgroundColor}}>
        <header>
          {/* Info banner */}
        </header>
        <div className="SearchBar">
          <SearchBar onSearch={handleSearch} />
        </div>
        
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

        {events.map(event => (
          <div key={event._id} className="event-section">
            {/* Re-render when forceRender changes */}
            <EventCard event={event} key={`${event._id}`} />
            <button className="sheesh-button" onClick={() => toggleForm(event._id)}>
              {openEventId === event._id ? 'Annuler' : 'Proposer un Sheesh'}
            </button>

            {openEventId === event._id && (
              <form onSubmit={handleSubmit} className="suggest-challenge-form">
                <label>Défi :</label>
                <input
                  type="text"
                  name="title"
                  value={newChallenge.title}
                  onChange={handleInputChange}
                  required
                />
                <label>
                  Collectif :
                  <input
                    type="checkbox"
                    name="isCollective"
                    checked={newChallenge.isCollective}
                    onChange={(e) =>
                      setNewChallenge({ ...newChallenge, isCollective: e.target.checked })
                    }
                  />
                </label>
                <button className="sheesh-button" type="submit">Envoyer propal</button>
              </form>
            )}

            {getEventChallenges(event.challenges).map(challenge => (
              <div
                key={challenge.id}
                ref={el => (challengeRefs.current[challenge.id] = el)}
              >
                <ChallengeCard
                  challenge={challenge}
                  isOpen={openChallengeId === challenge.id}
                  setOpenChallengeId={setOpenChallengeId}
                  initializeAndFetchData={initializeAndFetchData}
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
