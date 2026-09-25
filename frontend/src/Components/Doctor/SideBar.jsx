import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from "@mui/material";

import {
  Dashboard,
  VideoCall,
  LocalHospital,
  People,
  History,
  Settings,
  ExitToApp,
  Book,
  AccountCircle,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const drawerWidth = 240;

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/DoctorDashboard",
    },

    {
      text: "My Profile",
      icon: <AccountCircle />,
      path: "/DoctorProfile",
    },

    {
      text: "Patients Records",
      icon: <People />,
      path: "/PatientsPage",
    },

    {
      text: "Consultation",
      icon: <VideoCall />,
      path: "/TelemedicineConsultation",
    },

    {
      text: "SOAP Notes",
      icon: <Book />,
      path: "/TelemedicineConsultation",
    },

    {
      text: "Prescriptions",
      icon: <LocalHospital />,
      path: "/Prescriptions",
    },

    {
      text: "Diagnostic Orders",
      icon: <History />,
      path: "/MedicalRecords",
    },

    {
      text: "Referrals",
      icon: <Settings />,
      path: "/MedicalHistoryPage",
    },
  ];

  const handleLogout = () => {
    // Remove authenticated doctor information
    sessionStorage.removeItem("doctor");

    // Remove JWT authentication token
    sessionStorage.removeItem("doctorToken");

    // Return user to secure login page
    navigate("/DoctorLogin", {
      replace: true,
    });
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#2c3e50",
          color: "white",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      {/* HealthFlow Header */}

      <Box
        sx={{
          p: 2,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="div"
        >
          HealthFlow
        </Typography>

        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          Doctor Portal
        </Typography>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.15)",
        }}
      />

      {/* Navigation */}

      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() =>
              navigate(item.path)
            }
            sx={{
              "&:hover": {
                backgroundColor: "#34495e",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: "white",
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.text}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.15)",
        }}
      />

      {/* Secure Logout */}

      <List>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            "&:hover": {
              backgroundColor: "#34495e",
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: "white",
            }}
          >
            <ExitToApp />
          </ListItemIcon>

          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
