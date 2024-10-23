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
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';

const Feed = ({ showNavBar }) => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State to store the search query
    const { selectedUniverse, fetchUniverseById,saveUniverse} = useUniverse();
    const [backgroundColor, setBackgroundColor] = useState('#E8EACC'); 


    useEffect(() => {
      const fetchStyles = async () => {
        var bgColor = '#E8EACC';
        if (selectedUniverse.styles && selectedUniverse.styles['mainBackgroundColor']) {
          bgColor = selectedUniverse.styles['mainBackgroundColor'];
        }
        console.log("bgColor "+bgColor)
  
        setBackgroundColor(bgColor);
      }

      const fetchEvents = async () => {
        try {
          if (selectedUniverse?._id) {  // Ensure universe is selected
            // Fetch events for the current universe
            const response = await axios.get(`${config.backendAPI}/events`, {
              params: { universeId: selectedUniverse._id }
            });
            setEvents(response.data);  // Set events retrieved from the universe
          }
        } catch (error) {
          console.error('Error fetching events', error);
        }
      };

      fetchEvents();
      if (selectedUniverse) {
        fetchStyles()
      }
    }, [selectedUniverse]);  // Fetch events when selectedUniverse changes

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
      <div className='feed-page-container' style={{ backgroundColor }}>
        <Animation>
            <>
              <div className="infobar-container">
                <InfoBar selectedEvent={selectedEvent}/>
              </div>
            
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
        </div>
    );
}

export default Feed;
