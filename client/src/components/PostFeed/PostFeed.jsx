


const PostFeed = () => {
  const posts = [
    {
      id: 1,
      image: 'path/to/image1.jpg',
      title: 'Gagner la course de canoë',
      points: 100,
      sheeshCount: 69,
      user: 'Marie Friot',
      date: '25/05',
    },
    {
      id: 2,
      image: 'path/to/image2.jpg',
      title: 'Retourner un canoë',
      points: 100,
      sheeshCount: 9,
      user: 'Marie Friot',
      date: '25/05',
    },
  ];
  
  return (
    <div className="postfeed">
      {posts.map((post) => (
       post.id
      ))}
    </div>
  );
}

export default PostFeed;
