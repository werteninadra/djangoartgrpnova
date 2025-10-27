import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Catalogue from './pages/Catalogue';
import Gallery from './pages/Gallery';
import Exposition from './pages/Exposition';
import AdminPanel from './pages/AdminPanel';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8B5CF6', // Purple
    },
    secondary: {
      main: '#F59E0B', // Amber
    },
    background: {
      default: '#0F0F23', // Dark blue-black
      paper: '#1A1A2E', // Dark blue
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B794F6',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
      background: 'linear-gradient(45deg, #8B5CF6 30%, #F59E0B 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h4: {
      fontWeight: 600,
      color: '#F59E0B',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
          border: '1px solid #8B5CF6',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 48px rgba(139, 92, 246, 0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '25px',
          textTransform: 'none',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #8B5CF6 30%, #F59E0B 90%)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(45deg, #7C3AED 30%, #D97706 90%)',
            transform: 'scale(1.05)',
          },
        },
        outlined: {
          borderColor: '#8B5CF6',
          color: '#8B5CF6',
          '&:hover': {
            borderColor: '#F59E0B',
            color: '#F59E0B',
            background: 'rgba(245, 158, 11, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/exposition" element={<Exposition />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
