// TeacherHomepageStyles.js

const TeacherHomepageStyles = {
  container: {
    display: "flex",
    height: "200vh",
    fontFamily: "Arial, sans-serif",
  },
  content: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  main: {
    flexGrow: 1,
    padding: "70px",
    backgroundColor: "#FFFFFF",
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
