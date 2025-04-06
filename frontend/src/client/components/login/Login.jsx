import React, { useContext, useState } from "react";
import backgroundImage from "../../../assets/Teacher_on_podium.jpeg";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import axios from "axios";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";
import { loginSchema } from "../../../yupSchema/loginSchema";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      let URL;
      if (role === "student") {
        URL = `${API_BASE_URL}/api/student/login`;
        } else if(role === "teacher"){
          URL = `${API_BASE_URL}/api/teacher/login`;
          }
        else if(role === "department"){
          URL = `${API_BASE_URL}/api/department/login`;
        }

      try {
        const resp = await axios.post(
          URL,
          values,
          { withCredentials: true } // Ensures cookies/tokens are sent
        );

        // Get token from headers (alternative: check if it's in response data)
        const token = resp.headers["authorization"] || resp.data.token;
        const user = resp.data.user;

        if (token && user) {
          localStorage.setItem("authToken", token); // Store token for future requests
          localStorage.setItem("user", JSON.stringify(user));
          login(user, token);
          setSnackbar({
            open: true,
            message: "Login Successfully!",
            severity: "success",
          });

          console.log("Authorization Token:", token);
        } else {
          throw new Error("Authorization token missing in response.");
        }

        formik.resetForm();
        navigate(`/${role}`);
      } catch (e) {
        
        setSnackbar({
          open: true,
          message: e.response?.data?.message || "Login failed. Try again.",
          severity: "error",
        });
      }
    },
  });

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        marginTop: "30px",
        marginBottom: "30px",
        borderRadius: "40px",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        display="flex"
        borderRadius={6}
        flexDirection={{ xs: "column", md: "row" }}
        alignItems="center"
        justifyContent="center"
        width="100%"
        p={2}
      >
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          p={5}
          bgcolor="rgba(0, 0, 0, 0.5)"
          borderRadius={6}
          sx={{
            backgroundColor: "black",
            opacity: "70%",
            height: "400px",
            color: "white",
          }}
        >
          <Typography variant="subtitle1" color="primary" gutterBottom>
            UNLOCK YOUR ACADEMIC POTENTIAL
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom>
            LogIn to your Account
          </Typography>
          <Typography variant="body1">
            Access your personalized dashboard, manage your academic profile,
            and stay updated with important notices.
          </Typography>
        </Box>
        <Box
          flex={1}
          p={4}
          borderRadius={6}
          boxShadow={18}
          sx={{ backgroundColor: "white" }}
          mt={{ xs: 4, md: 0 }}
          ml={{ md: 4 }}
        >
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            onSubmit={formik.handleSubmit}
          >
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Role</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={role}
                label="Role"
                onChange={(e) => {
                  setRole(e.target.value);
                }}
              >
                <MenuItem value={"teacher"}>Teacher</MenuItem>
                <MenuItem value={"student"}>Student</MenuItem>
                <MenuItem value={"department"}>Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              {...formik.getFieldProps("email")}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors?.email}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              {...formik.getFieldProps("password")}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors?.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button fullWidth variant="contained" color="primary" type="submit">
              Login
            </Button>
          </Box>
          <SnackbarAlert
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={handleCloseSnackbar}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
