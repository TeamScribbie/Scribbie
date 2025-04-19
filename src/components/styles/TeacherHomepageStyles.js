const TeacherHomepageStyles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    sidebar: {
      backgroundColor: "#FFE8A3",
      display: "flex",
      flexDirection: "column",
      color: "#451513",
      position: "fixed",
      top: "60px",
      bottom: "0",
      zIndex: 1,
    },
    sidebarTitle: {
      marginBottom: "20px",
      fontWeight: "bold",
    },
    sidebarItem: {
      cursor: "pointer",
      fontWeight: "bold",
      padding: "10px 15px",
      marginBottom: "10px",
      transition: "all 0.3s",
    },
    classList: {
      marginTop: "10px",
      marginLeft: "10px",
    },
    subItem: {
      fontSize: "14px",
      marginBottom: "5px",
      cursor: "pointer",
    },
    content: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
    },
    main: {
      flexGrow: 1,
      padding: "70px",
      backgroundColor: "#FFFBE0",
      marginTop: "60px",
    },
    heading: {
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#333",
    },
    cardContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
    },
    classCard: {
      width: "140px",
      height: "100px",
      backgroundColor: "#FFD966",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      transition: "0.3s ease-in-out",
    },
    addCard: {
      backgroundColor: "#FFEDB6",
      color: "#000",
    },
  };
  
  export default TeacherHomepageStyles;
  