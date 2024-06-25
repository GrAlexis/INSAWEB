import PostFeed from '../PostFeed/PostFeed'
import InfoBar from '../InfoBar/InfoBar';
import './Home.css';
import Post1 from '../../assets/pictures/post/kayak1.jpeg'
import Post2 from '../../assets/pictures/post/kayak2.jpeg'
import { useState, useEffect } from 'react';

const Home = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        // Simulate fetching data
        const fetchPosts = async () => {
        // Replace this with actual API call if needed
        const postsData = [
            {
            id: 1,
            image: Post1,
            title: 'Gagner la course de canoë',
            points: 100,
            sheeshCount: 69,
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
            sheeshCount: 9,
            user: 'Marie Friot',
            date: '25/05',
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
        <div>
             <div className="infobar-container">
                <InfoBar />
            </div>
            <div className="postfeed-container">
                <PostFeed posts={posts} />
            </div>
        </div>
    );
}

export default Home;
