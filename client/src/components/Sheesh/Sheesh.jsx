import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getImageByKey } from '../../utils/imageMapper';
import { useUser } from '../../hooks/commonHooks/UserContext';
import config from '../../config';
import EventCard from '../Events/EventCard';
import ChallengeCard from './ChallengeCard';
import Animation from '../Animation';
import SearchBar from '../SearchBar/SearchBar';
import './Sheesh.css';

const Sheesh = ({ showNavBar }) => {
  const { challengeId } = useParams();
  const { user, setUser } = useUser();
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]); // Nouvel état pour les défis filtrés
  const [pinnedChallenges, setPinnedChallenges] = useState([]);
  const [openChallengeId, setOpenChallengeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Nouvel état pour la requête de recherche
  const challengeRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    showNavBar();

    const fetchEvents = async () => {
      try {
        const eventResponse = await axios.get(config.backendAPI + '/events');
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
        const challengeResponse = await axios.get(config.backendAPI + '/challenges');
        const challengesWithIcons = challengeResponse.data.map(challenge => ({
          ...challenge,
          icon: getImageByKey(challenge.icon)
        }));
        setChallenges(challengesWithIcons);
        setFilteredChallenges(challengesWithIcons); // Initialiser les défis filtrés avec tous les défis
      } catch (error) {
        console.error('Error fetching challenges', error);
      }
    };

    const calculatePinnedChallenges = () => {
      if (user && challenges.length > 0) {
        const userPinnedChallenges = challenges.filter(challenge =>
          user.pinnedChallenges.includes(challenge.id)
        );
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

  // Fonction pour supprimer les accents et rendre les termes insensibles à la casse
  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD') // Normalisation pour séparer les accents
      .replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents
  };

  // Fonction pour gérer la recherche
  const handleSearch = (query) => {
    setSearchQuery(query);

    // Filtrer les défis en fonction de la requête (recherche partielle insensible à la casse et sans accents)
    const normalizedQuery = normalizeString(query);

    const filtered = challenges.filter(challenge =>
      normalizeString(challenge.title).includes(normalizedQuery)
    );
    setFilteredChallenges(filtered); // Mettre à jour l'état des défis filtrés
  };

  const getEventChallenges = (eventChallenges) => {
    const challengeIds = eventChallenges.split(',').map(id => id.trim());
    return filteredChallenges.filter(challenge => challengeIds.includes(challenge.id)); // Utiliser les défis filtrés
  };


  return (
    <Animation>
      <div className="home-page">
        <header>
          {/*Banniere d'info ? */}
        </header>
        <div className="SearchBar">
        <SearchBar onSearch={handleSearch} />
        </div>
        
        
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
