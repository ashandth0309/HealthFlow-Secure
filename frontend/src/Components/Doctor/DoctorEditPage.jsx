import React, { useEffect, useState } from "react";
import {
  Container,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main,
}));

const StyledForm = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(3),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

function DoctorEditPage() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    specialisation: "",
    sheduleTimes: "",
    locations: "",
    email: "",
    picture: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const storedDoctor = sessionStorage.getItem("doctor");
  const loggedInDoctor = storedDoctor
    ? JSON.parse(storedDoctor)
    : null;

  const token = sessionStorage.getItem("doctorToken");

  const clearDoctorSession = () => {
    sessionStorage.removeItem("doctor");
    sessionStorage.removeItem("doctorToken");
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      if (
        !loggedInDoctor ||
        !loggedInDoctor._id ||
        !token
      ) {
        clearDoctorSession();
        navigate("/DoctorLogin", {
          replace: true,
        });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:8081/doctorFunction/get/${loggedInDoctor._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDoctor({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          dob: response.data.dob || "",
          specialisation:
            response.data.specialisation || "",
          sheduleTimes:
            response.data.sheduleTimes || "",
          locations: response.data.locations || "",
          email: response.data.email || "",
          picture: response.data.picture || "",
          password: "",
        });
      } catch (err) {
        console.error(
          "Failed to fetch doctor details:",
          err
        );

        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          clearDoctorSession();

          navigate("/DoctorLogin", {
            replace: true,
          });

          return;
        }

        setError(
          err.response?.data?.message ||
            "Failed to fetch doctor details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [loggedInDoctor?._id, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDoctor((previousDoctor) => ({
      ...previousDoctor,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !loggedInDoctor ||
      !loggedInDoctor._id ||
      !token
    ) {
      clearDoctorSession();

      navigate("/DoctorLogin", {
        replace: true,
      });

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * Only send fields that the backend explicitly
       * allows the authenticated doctor to update.
       */
      const updateData = {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        dob: doctor.dob,
        specialisation: doctor.specialisation,
        sheduleTimes: doctor.sheduleTimes,
        locations: doctor.locations,
        email: doctor.email,
        picture: doctor.picture,
      };

      /*
       * Password is optional.
       * If left blank, the existing password is unchanged.
       */
      if (doctor.password.trim()) {
        if (doctor.password.length < 8) {
          setError(
            "New password must contain at least 8 characters."
          );
          setSaving(false);
          return;
        }

        updateData.password = doctor.password;
      }

      const response = await axios.put(
        `http://localhost:8081/doctorFunction/update/${loggedInDoctor._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      /*
       * Update the doctor information stored in the
       * browser session, but never store a password.
       */
      if (response.data.doctor) {
        const updatedDoctor = {
          _id: response.data.doctor._id,
          firstName:
            response.data.doctor.firstName,
          lastName:
            response.data.doctor.lastName,
          dob: response.data.doctor.dob,
          specialisation:
            response.data.doctor.specialisation,
          sheduleTimes:
            response.data.doctor.sheduleTimes,
          locations:
            response.data.doctor.locations,
          email: response.data.doctor.email,
          picture:
            response.data.doctor.picture,
        };

        sessionStorage.setItem(
          "doctor",
          JSON.stringify(updatedDoctor)
        );
      }

      setDoctor((previousDoctor) => ({
        ...previousDoctor,
        password: "",
      }));

      setSuccess(
        "Doctor profile updated successfully."
      );

      /*
       * Briefly show success before returning
       * to the profile page.
       */
      setTimeout(() => {
        navigate("/DoctorProfile");
      }, 800);
    } catch (err) {
      console.error(
        "Failed to update doctor:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        clearDoctorSession();

        navigate("/DoctorLogin", {
          replace: true,
        });

        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to update doctor"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StyledContainer
      component="main"
      maxWidth="sm"
    >
      <StyledAvatar>
        <LockOutlinedIcon />
      </StyledAvatar>

      <Typography
        component="h1"
        variant="h5"
      >
        Edit Doctor Profile
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            width: "100%",
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mt: 2,
            width: "100%",
          }}
        >
          {success}
        </Alert>
      )}

      <StyledForm onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="firstName"
              required
              fullWidth
              id="firstName"
              label="First Name"
              autoComplete="given-name"
              value={doctor.firstName}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              value={doctor.lastName}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="dob"
              label="Date of Birth"
              name="dob"
              value={doctor.dob}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="specialisation"
              label="Specialisation"
              name="specialisation"
              value={doctor.specialisation}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="sheduleTimes"
              label="Schedule Times"
              name="sheduleTimes"
              value={doctor.sheduleTimes}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="locations"
              label="Location"
              name="locations"
              value={doctor.locations}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              type="email"
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={doctor.email}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="picture"
              label="Profile Picture"
              name="picture"
              value={doctor.picture}
              onChange={handleChange}
              helperText="Profile image path or URL"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              id="password"
              label="New Password"
              name="password"
              autoComplete="new-password"
              value={doctor.password}
              onChange={handleChange}
              helperText="Leave blank to keep your current password. New passwords must contain at least 8 characters."
            />
          </Grid>
        </Grid>

        <SubmitButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={saving}
        >
          {saving ? (
            <CircularProgress size={24} />
          ) : (
            "Update Doctor"
          )}
        </SubmitButton>

        <Button
          fullWidth
          variant="outlined"
          disabled={saving}
          onClick={() =>
            navigate("/DoctorProfile")
          }
        >
          Cancel
        </Button>
      </StyledForm>
    </StyledContainer>
  );
}

export default DoctorEditPage;
