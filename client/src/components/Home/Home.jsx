import PostFeed from '../PostFeed/PostFeed'
import InfoBar from '../InfoBar/InfoBar';
import './Home.css';

const Home = () => {

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
