// feed.jsx
import './Feed.css';
import config from '../../config';
import PostFeed from '../PostFeed/PostFeed';
import InfoBar from '../InfoBar/InfoBar';
import Animation from '../Animation';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../SearchBar/SearchBar'; // Import the SearchBar component

const Feed = ({ showNavBar }) => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State to store the search query

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
      
    const toggleEventFilter = (event) => {
        if (selectedEvent && selectedEvent._id === event._id) {
        setSelectedEvent(null); 
        } else {
        setSelectedEvent(event);
        }
    };

    // Handle search input from SearchBar
    const handleSearch = (query) => {
        setSearchQuery(query.toLowerCase()); // Store the query in lowercase for case-insensitive matching
    };

    return (
        <Animation>
            <>
              <div className="infobar-container">
                <InfoBar selectedEvent={selectedEvent}/>
              </div>

              {/* SearchBar Component with search handling */}
              <SearchBar onSearch={handleSearch} />
            
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
                {/* Pass searchQuery down to PostFeed */}
                <PostFeed selectedEvent={selectedEvent} searchQuery={searchQuery} />
            </div>
            </>
        </Animation>
    );
}

export default Feed;
