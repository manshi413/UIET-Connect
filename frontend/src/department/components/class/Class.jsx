import { Box, Button, TextField, Typography, IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useFormik } from "formik";
import { semesterSchema } from "../../../yupSchema/semesterSchema";
import axios from "axios";
import { baseApi } from "../../../environment";
import { useEffect, useState } from "react";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";


export default function Class() {
  const token = localStorage.getItem("authToken"); // Fetch token
  const [semesters, setSemesters] = useState([]);
  const [editId, setEditId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const fetchSemesters = async () => {
    try {
      const response = await axios.get(`${baseApi}/semester/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSemesters(response.data.data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const formik = useFormik({
    initialValues: { semester_text: "Semester", semester_num: "" },
    validationSchema: semesterSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editId) {
          await axios.patch(`${baseApi}/semester/update/${editId}`, values, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({ open: true, message: "Semester updated successfully", severity: "success" });
        } else {
          await axios.post(`${baseApi}/semester/create`, values, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({ open: true, message: "Semester added successfully", severity: "success" });
        }
        resetForm();
        setEditId(null);
        fetchSemesters();
      } catch (error) {
        setAlert({ open: true, message: "Error processing request", severity: "error" });
        console.error("Error:", error);
      }
    },
  });

  const handleEdit = (semester) => {
    setEditId(semester._id);
    formik.setValues({ semester_text: semester.semester_text, semester_num: semester.semester_num });
  };

  const handleDelete = async (id) => {
    try {
      await axios.get(`${baseApi}/semester/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ open: true, message: "Semester deleted successfully", severity: "success" });
      fetchSemesters();
    } catch (error) {
      setAlert({ open: true, message: "Error deleting semester", severity: "error" });
      console.error("Error deleting semester:", error);
    }
  };

  return (
    <>
      <SnackbarAlert {...alert} onClose={handleAlertClose} />

      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }} onSubmit={formik.handleSubmit}>
        <Typography variant="h3" sx={{ textAlign: "center", fontWeight: 700 }}>
          {editId ? "Edit Semester" : "Add New Semester"}
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          {...formik.getFieldProps("semester_text")}
          error={formik.touched.semester_text && Boolean(formik.errors.semester_text)}
          helperText={formik.touched.semester_text && formik.errors.semester_text}
          disabled
        />
        <TextField
          fullWidth
          label="Semester Number"
          variant="outlined"
          {...formik.getFieldProps("semester_num")}
          error={formik.touched.semester_num && Boolean(formik.errors.semester_num)}
          helperText={formik.touched.semester_num && formik.errors.semester_num}
        />
        <Button fullWidth variant="contained" color="primary" type="submit">
          {editId ? "Update" : "Submit"}
        </Button>
      </Box>

      <Box component="div" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
        {semesters.length === 0 ? (
          <Typography variant="h6">No semester found</Typography>
        ) : (semesters.map((sem) => (
          <Box key={sem._id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            <Typography>Semester: {sem.semester_text} ({sem.semester_num})</Typography>
            <Box>
              <IconButton color="primary" onClick={() => handleEdit(sem)}>
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={() => handleDelete(sem._id)}>
                <Delete />
              </IconButton>
            </Box>
          </Box>
        )))}
      </Box>
    </>
  );
}
