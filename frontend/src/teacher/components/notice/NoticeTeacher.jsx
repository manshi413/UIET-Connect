import { Box,Typography, IconButton} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import { baseApi } from "../../../environment";
import { useEffect, useState } from "react";


export default function NoticeTeacher() {
  const token = localStorage.getItem("authToken"); // Fetch token
  const [notices, setNotices] = useState([]);
  

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${baseApi}/notice/teacher`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(response.data.data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  



  return (
    <>

     

      <Box component="div" sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 4 }}>
        {notices.length === 0 ? (
          <Typography variant="h6">No notice found</Typography>
        ) : (notices.map((sem) => (
          <Box key={sem._id} sx={{ display: "flex",flexDirection:"column",  justifyContent: "space-between", p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            <Typography><b>Title:</b> {sem.title} </Typography>
            <Typography><b>Message:</b> {sem.message} </Typography>
            <Typography><b>Audience:</b> {sem.audience} </Typography>
            
          </Box>
        )))}
      </Box>
    </>
  );
}
