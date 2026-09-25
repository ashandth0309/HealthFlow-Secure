import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Sidebar from "../Doctor/SideBar";
import { useNavigate } from "react-router-dom";

const DoctorProfilePage = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const navigate = useNavigate();

  // Get authenticated doctor and JWT from the current session
  const storedDoctor = sessionStorage.getItem("doctor");
  const doctor = storedDoctor ? JSON.parse(storedDoctor) : null;
  const token = sessionStorage.getItem("doctorToken");

  /**
   * Clear the authenticated doctor session.
   */
  const clearDoctorSession = () => {
    sessionStorage.removeItem("doctor");
    sessionStorage.removeItem("doctorToken");
  };

  /**
   * Load the authenticated doctor's profile.
   *
   * The backend requires:
   * Authorization: Bearer <JWT>
   */
  useEffect(() => {
    const fetchDoctorData = async () => {
      // User is not authenticated or session information is incomplete.
      if (!doctor || !doctor._id || !token) {
        clearDoctorSession();
        navigate("/DoctorLogin", { replace: true });
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8081/doctorFunction/get/${doctor._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDoctorData(response.data);
      } catch (err) {
        console.error("Unable to load doctor profile:", err);

        // Invalid, missing, or unauthorized token
        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          clearDoctorSession();
          navigate("/DoctorLogin", { replace: true });
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load doctor profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctor?._id, token, navigate]);

  /**
   * Open delete confirmation.
   */
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  /**
   * Delete authenticated doctor's own account.
   *
   * Backend authorization ensures the authenticated doctor
   * can only delete their own account.
   */
  const handleDeleteConfirm = async () => {
    setOpenDeleteDialog(false);

    if (!doctor || !doctor._id || !token) {
      clearDoctorSession();
      navigate("/DoctorLogin", { replace: true });
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8081/doctorFunction/delete/${doctor._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data.message ===
        "Doctor deleted successfully"
      ) {
        clearDoctorSession();

        navigate("/DoctorLogin", {
          replace: true,
        });
      }
    } catch (err) {
      console.error("Unable to delete doctor account:", err);

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
          "Unable to delete doctor account"
      );
    }
  };

  /**
   * Close delete confirmation.
   */
  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  /**
   * Safety check
   */
  if (!doctorData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Alert severity="warning">
          Doctor profile information is unavailable.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        animation: "fadeIn 1.5s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Animation */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          background:
            "linear-gradient(120deg, #74ebd5, #ACB6E5)",
          backgroundSize: "400% 400%",
          animation: "gradientBG 15s ease infinite",
        }}
      />

      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          padding: "20px",
          maxWidth: "600px",
          margin: "auto",
          boxShadow:
            "0px 6px 16px rgba(0, 0, 0, 0.2)",
          borderRadius: "20px",
          backgroundColor: "#ffffff",
          animation: "slideInUp 1s ease-out",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          color="primary"
          sx={{
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Doctor Profile
        </Typography>

        {/* Doctor Profile Image */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            animation: "bounceIn 1s",
          }}
        >
          <Avatar
            alt={`${doctorData.firstName} ${doctorData.lastName}`}
            src={
              doctorData.picture ||
              "/default-profile.png"
            }
            sx={{
              width: 150,
              height: 150,
              border: "3px solid #ecf0f1",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          />
        </Box>

        {/* Doctor Information */}
        <Paper
          elevation={3}
          sx={{
            padding: "20px",
            borderRadius: "20px",
            marginBottom: "30px",
            backgroundColor: "#fafafa",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              marginBottom: "10px",
              fontSize: "1.2rem",
            }}
          >
            <strong>Name:</strong>{" "}
            {doctorData.firstName}{" "}
            {doctorData.lastName}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              marginBottom: "10px",
              fontSize: "1.2rem",
            }}
          >
            <strong>Specialization:</strong>{" "}
            {doctorData.specialisation}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              marginBottom: "10px",
              fontSize: "1.2rem",
            }}
          >
            <strong>Email:</strong>{" "}
            {doctorData.email}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              marginBottom: "10px",
              fontSize: "1.2rem",
            }}
          >
            <strong>Location:</strong>{" "}
            {doctorData.locations}
          </Typography>
        </Paper>

        {/* Profile Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            sx={{
              borderRadius: "10px",
              padding: "10px 30px",
              fontSize: "1rem",
              transition: "all 0.3s",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#388e3c",
              },
            }}
            onClick={() =>
              navigate("/DoctorEdit")
            }
          >
            Edit Profile
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{
              borderRadius: "10px",
              padding: "10px 30px",
              fontSize: "1rem",
              transition: "all 0.3s",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#d32f2f",
              },
            }}
            onClick={handleDeleteClick}
          >
            Delete Account
          </Button>
        </Box>

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleDeleteCancel}
          maxWidth="xs"
          fullWidth
          sx={{
            animation: "zoomIn 0.5s",
          }}
        >
          <DialogTitle>
            <Typography
              variant="h6"
              align="center"
              color="secondary"
              sx={{
                fontWeight: "bold",
              }}
            >
              Confirm Deletion
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            <Typography
              variant="body1"
              sx={{
                fontSize: "1rem",
              }}
            >
              Are you sure you want to delete your
              account? This action cannot be undone.
            </Typography>
          </DialogContent>

          <DialogActions
            sx={{
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleDeleteCancel}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

/*
 * Existing Doctor Profile animations.
 */
const styles = `
@keyframes gradientBG {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideInUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

@keyframes bounceIn {
    0%,
    20%,
    40%,
    60%,
    80%,
    100% {
        transition-timing-function:
            cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    0% {
        opacity: 0;
        transform:
            scale3d(0.3, 0.3, 0.3);
    }

    20% {
        transform:
            scale3d(1.1, 1.1, 1.1);
    }

    40% {
        transform:
            scale3d(0.9, 0.9, 0.9);
    }

    60% {
        opacity: 1;
        transform:
            scale3d(1.03, 1.03, 1.03);
    }

    80% {
        transform:
            scale3d(0.97, 0.97, 0.97);
    }

    100% {
        opacity: 1;
        transform:
            scale3d(1, 1, 1);
    }
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform:
            scale3d(0.3, 0.3, 0.3);
    }

    50% {
        opacity: 1;
    }
}

body {
    margin: 0;
    font-family: 'Roboto', sans-serif;
}
`;

const styleTag = document.createElement("style");
styleTag.innerHTML = styles;
document.head.appendChild(styleTag);

export default DoctorProfilePage;
