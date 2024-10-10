import './Feed.css';
import config from '../../config';
import PostFeed from '../PostFeed/PostFeed';
import InfoBar from '../InfoBar/InfoBar';
import Animation from '../Animation';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Feed = ({ showNavBar }) => {
    const navigate = useNavigate();
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
                <PostFeed selectedEvent={selectedEvent} />
            </div>
            </>
        </Animation>
    );
}

export default Feed;
