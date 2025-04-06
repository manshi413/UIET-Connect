import { Box, Button, TextField, Typography, IconButton, MenuItem } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useFormik } from "formik";
import { noticeSchema } from "../../../yupSchema/noticeSchema";
import axios from "axios";
import { baseApi } from "../../../environment";
import { useEffect, useState } from "react";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";


export default function Notice() {
  const token = localStorage.getItem("authToken"); // Fetch token
  const [notices, setNotices] = useState([]);
  const [editId, setEditId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${baseApi}/notice/all`, {
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

  const formik = useFormik({
    initialValues: { title: "", message: "", audience:"" },
    validationSchema: noticeSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editId) {
          await axios.patch(`${baseApi}/notice/update/${editId}`, values, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({ open: true, message: "Notice updated successfully", severity: "success" });
        } else {
          await axios.post(`${baseApi}/notice/create`, values, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({ open: true, message: "Notice added successfully", severity: "success" });
        }
        resetForm();
        setEditId(null);
        fetchNotices();
      } catch (error) {
        setAlert({ open: true, message: "Error processing request", severity: "error" });
        console.error("Error:", error);
      }
    },
  });

  const handleEdit = (notice) => {
    setEditId(notice._id);
    formik.setValues({ title: notice.title, message: notice.message, audience: notice.audience });
  };

  const handleDelete = async (id) => {
    try {
      await axios.get(`${baseApi}/notice/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ open: true, message: "Notice deleted successfully", severity: "success" });
      fetchNotices();
    } catch (error) {
      setAlert({ open: true, message: "Error deleting notice", severity: "error" });
      console.error("Error deleting notice:", error);
    }
  };

  return (
    <>
      <SnackbarAlert {...alert} onClose={handleAlertClose} />

      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }} onSubmit={formik.handleSubmit}>
        <Typography variant="h3" sx={{ textAlign: "center", fontWeight: 700 }}>
          {editId ? "Edit Notice" : "Add New Notice"}
        </Typography>
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          {...formik.getFieldProps("title")}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
          
        />
        <TextField
          multiline
          rows={6}
          fullWidth
          label="Message"
          variant="outlined"
          {...formik.getFieldProps("message")}
          error={formik.touched.message && Boolean(formik.errors.message)}
          helperText={formik.touched.message && formik.errors.message}
        />
        <TextField
            select
            fullWidth
            label="Audience"
            name="audience"
            value={formik.values.audience}
            onChange={formik.handleChange}
            error={formik.touched.audience && Boolean(formik.errors.audience)}
            helperText={formik.touched.audience && formik.errors.audience}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select Subject</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            
          </TextField>
        <Button fullWidth variant="contained" color="primary" type="submit">
          {editId ? "Update" : "Submit"}
        </Button>
      </Box>

      <Box component="div" sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 4 }}>
        {notices.length === 0 ? (
          <Typography variant="h6">No notice found</Typography>
        ) : (notices.map((sem) => (
          <Box key={sem._id} sx={{ display: "flex",flexDirection:"column",  justifyContent: "space-between", p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            <Typography><b>Title:</b> {sem.title} </Typography>
            <Typography><b>Message:</b> {sem.message} </Typography>
            <Typography><b>Audience:</b> {sem.audience} </Typography>
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
