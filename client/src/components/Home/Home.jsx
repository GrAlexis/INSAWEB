import PostFeed from '../PostFeed/PostFeed'
import InfoBar from '../InfoBar/InfoBar';
import './Home.css';
// import { useState, useEffect } from 'react';

const Home = () => {

    // useEffect(() => {
    //     // Simulate fetching data
    //     const fetchPosts = async () => {
    //     // Replace this with actual API call if needed
    //     const postsData = [
    //         {
    //         id: 1,
    //         image: Post1,
    //         title: 'Gagner la course de canoë',
    //         points: 100,
    //         likes: 1000,
    //         user: 'Marie Friot',
    //         date: '25/05',
    //         event: 'WEK',
    //         idDefi:'10',
    //         reward: '1 frite'
    //         },
    //         {
    //         id: 2,
    //         image: Post2,
    //         title: 'Retourner un canoë',
    //         points: 100,
    //         likes: 9,
    //         user: 'Marie Friot',
    //         date: '25/05',
    //         event: 'WEK',
    //         idDefi:'20',
    //         reward: '1 biere'
    //         },
    //     ];
    //     setPosts(postsData);
    //     };

    //     fetchPosts();
    // }, []);



    return (
        <div>
             <div className="infobar-container">
                <InfoBar />
            </div>
            <div className="postfeed-container">
                <PostFeed/>
            </div>
        </div>
    );
}

export default Home;
