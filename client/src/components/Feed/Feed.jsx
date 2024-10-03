import './Feed.css';
import config from '../../config';
import PostFeed from '../PostFeed/PostFeed'
import InfoBar from '../InfoBar/InfoBar';
import Animation from '../Animation';
import Post1 from '../../assets/pictures/post/kayak1.jpeg'
import Post2 from '../../assets/pictures/post/kayak2.jpeg'
import Post3 from '../../assets/pictures/post/kayak1.jpeg'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

const Feed = ({ showNavBar }) => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        showNavBar()

        const token = localStorage.getItem('token');

        if (!token) {
          // If no token, redirect to login page
          navigate('/login');
          return; // Exit useEffect early to prevent further code execution
        }


        // Simulate fetching data
        const fetchPosts = async () => {
        // Replace this with actual API call if needed
        const postsData = [
            {
            id: 1,
            image: Post1,
            title: 'Gagner la course de canoë',
            points: 100,
            likes: 1000,
            user: 'Marie Friot',
            date: '25/05',
            event: 'WEK',
            idDefi:'10',
            reward: '1 frite'
            },
            {
            id: 2,
            image: Post2,
            title: 'Retourner un canoë',
            points: 100,
            likes: 9,
            user: 'Marie Friot',
            date: '25/05',
            event: 'WEK',
            idDefi:'20',
            reward: '1 biere'
            },
            {
                id: 3,
                image: Post3,
                title: 'Attraper un phoque',
                points: 100,
                likes: 19,
                user: 'Marie Friot',
                date: '26/05',
                event: 'WEK',
                idDefi:'20',
                reward: '1 biere'
                },
        ];
        setPosts(postsData);
        };

        fetchPosts();
    }, []);



    return (
        <Animation>
            <>
             <div className="infobar-container">
                <InfoBar />
            </div>
            <div className="postfeed-container">
                <PostFeed posts={posts} />
            </div>
            </>
        </Animation>
    );
}

export default Feed;