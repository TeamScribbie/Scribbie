// RankingModal.jsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, Typography, Box } from "@mui/material";

const RankingModal = ({ open, onClose }) => {
  const rankingData = [
    { rank: 1, name: "Jane Doe", date: "1/1/25", score: "90/100" },
    { rank: 2, name: "Juvelat", date: "1/1/25", score: "80/100" },
    { rank: 3, name: "Jenelyn", date: "1/1/25", score: "70/100" },
    { rank: 4, name: "Julianne", date: "1/1/25", score: "60/100" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { backgroundColor: "#FFD966", borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          backgroundColor: "#451513",
          color: "white",
        }}
      >
        Challenge 1 Ranking
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr 1.5fr .8fr",
            fontWeight: "bold",
            mb: 1,
          }}
        >
          <Typography>Rank No.</Typography>
          <Typography>Name</Typography>
          <Typography>Date</Typography>
          <Typography>Score</Typography>
        </Box>
        {rankingData.map((student) => (
          <Box
            key={student.rank}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 2fr 1fr",
              backgroundColor: "#FFEA94",
              borderRadius: "10px",
              padding: "8px",
              mb: 1,
            }}
          >
            <Typography>{student.rank}</Typography>
            <Typography sx={{ fontWeight: "bold" }}>{student.name}</Typography>
            <Typography>{student.date}</Typography>
            <Typography sx={{ fontWeight: "bold" }}>{student.score}</Typography>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default RankingModal;
