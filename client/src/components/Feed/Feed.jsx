import './Feed.css';
import config from '../../config';
import PostFeed from '../PostFeed/PostFeed';
import InfoBar from '../InfoBar/InfoBar';
import Animation from '../Animation';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventBanner from '../EventBanner/EventBanner';
import sound1 from '../../assets/sounds/sound1.mp3';
import sound2 from '../../assets/sounds/sound2.mp3';
import sound3 from '../../assets/sounds/sound3.mp3';

const Feed = ({ showNavBar }) => {
    const [participants, setParticipants] = useState([]); 
    const [audio, setAudio] = useState(null); 
    const navigate = useNavigate();
    const soundTracks = [sound1, sound2, sound3];
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
          try {
            const response = await axios.get(`${config.backendAPI}/events`); // Adjust the URL based on your API
            setEvents(response.data);
          } catch (error) {
            console.error('Error fetching events', error);
          }
        };
      
        fetchEvents();
      }, []);

    useEffect(() => {
        showNavBar();

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
    }, []);

    useEffect(() => {
        if (participants.length > 0) {
            const randomSound = soundTracks[Math.floor(Math.random() * soundTracks.length)];
            const audioPlayer = new Audio(randomSound);
            setAudio(audioPlayer);
            audioPlayer.play(); 
        }
    }, [participants]); 

    const defaultEventText = "My G, Sheeesh pour avoir ta propre bande son ;)";
    const eventsToDisplay = participants.length > 0 ? participants : [defaultEventText];

    
    const bannerClass = participants.length > 0 ? 'banner-container shimmer' : 'banner-container';
      
    // Function to toggle event filtering
    const toggleEventFilter = (event) => {
        if (selectedEvent && selectedEvent._id === event._id) {
        setSelectedEvent(null); // Deselect the event if it's already selected
        } else {
        setSelectedEvent(event);
        }
    };

    return (
        <Animation>
            <>
              <div className="infobar-container">
                <InfoBar selectedEvent={selectedEvent}/>
            </div>
            {/*
                <div className={bannerClass}>
                <EventBanner events={eventsToDisplay} />
              </div>
            */}
            
        {/* Event Filter Buttons */}
        <div className="event-buttons">
          {events.map(event => (
            <button
              key={event._id}
              className={selectedEvent && selectedEvent._id === event._id ? 'selected' : ''}
              onClick={() => toggleEventFilter(event)}
            >
              {event.title}
            </button>
          ))}

        </div>
            <div className="postfeed-container">
                <PostFeed setParticipants={setParticipants} selectedEvent={selectedEvent} />
            </div>
            </>
        </Animation>
    );
}

export default Feed;
