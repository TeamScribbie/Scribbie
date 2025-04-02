const NotFound = () => {
    return (
      <div style={{ textAlign: "center", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <h1>404 - Page Not Found</h1>
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/U6ax3mUfRtU?autoplay=1&controls=0&fs=1&modestbranding=1&loop=1&playlist=U6ax3mUfRtU"
          title="404 Not Found Video"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        ></iframe>
      </div>
    );
  };
  
  export default NotFound;
  