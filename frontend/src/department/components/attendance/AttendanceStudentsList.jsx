import React, { useState, useEffect } from "react";
import { Container, TextField, MenuItem, Box, Typography, Grid, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import axios from "axios";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";
import { baseApi } from "../../../environment";

const AttendanceStudentsList = () => {
  const token = localStorage.getItem("authToken");
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [params, setParams] = useState({
    student_class: '',
    subject: '',
    search: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => { fetchSemesters(); }, []);
  useEffect(() => { if (params.student_class) fetchStudents(); }, [params]);

  const fetchSemesters = async () => {
    try {
      const res = await axios.get(`${baseApi}/semester/all`, { headers: { Authorization: `Bearer ${token}` } });
      setSemesters(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubjects = async (semesterId) => {
    try {
      const res = await axios.get(`${baseApi}/subject/fetch-with-query`, {
        params: { student_class: semesterId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data.subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setParams((prev) => ({ ...prev, student_class: semesterId, subject: '' }));
    fetchSubjects(semesterId);
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setParams((prev) => ({ ...prev, subject: subjectId }));
  };

  const handleSearch = (e) => setParams((prev) => ({ ...prev, search: e.target.value }));

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${baseApi}/student/fetch-with-query`, { params, headers: { Authorization: `Bearer ${token}` } });
      setStudents(res.data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const isValidValue = (value, options) => options.some(option => option._id === value);

  return (
    <Container>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 4, fontWeight: "bold" }}>Student Attendance</Typography>
      <SnackbarAlert {...snackbar} onClose={() => setSnackbar({ ...snackbar, open: false })} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Semester"
              value={isValidValue(params.student_class, semesters) ? params.student_class : ''}
              onChange={handleSemesterChange}
            >
              <MenuItem value="">Select Semester</MenuItem>
              {semesters.map((x) => (
                <MenuItem key={x._id} value={x._id}>{x.semester_text} ({x.semester_num})</MenuItem>
              ))}
            </TextField>

            {subjects.length > 0 && (
              <TextField
                select
                fullWidth
                label="Subject"
                value={isValidValue(params.subject, subjects) ? params.subject : ''}
                onChange={handleSubjectChange}
              >
                <MenuItem value="">Select Subject</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>{subject.subject_name}</MenuItem>
                ))}
              </TextField>
            )}

            <TextField fullWidth label="Search" value={params.search} onChange={handleSearch} />
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Age</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Gender</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Guardian</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Semester</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Percentage</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "action.hover" } }}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell align="right">{student.age}</TableCell>
                    <TableCell align="right">{student.gender}</TableCell>
                    <TableCell align="right">{student.guardian}</TableCell>
                    <TableCell align="right">{student.student_class.semester_num}</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell align="right">View</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AttendanceStudentsList;
