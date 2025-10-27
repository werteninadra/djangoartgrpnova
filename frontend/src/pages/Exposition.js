import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RoomIcon from '@mui/icons-material/Room';
import api from '../services/api';

const Exposition = () => {
  const [expositions, setExpositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingExposition, setEditingExposition] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_public: true,
    theme: '',
  });

  useEffect(() => {
    checkAuth();
    fetchExpositions();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await api.get('/accounts/profile/');
        setUser(response.data);
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    }
  };

  const fetchExpositions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/exposition/');
      setExpositions(response.data);
    } catch (err) {
      console.error('Failed to fetch expositions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (exposition = null) => {
    setEditingExposition(exposition);
    if (exposition) {
      setFormData({
        title: exposition.title,
        description: exposition.description || '',
        start_date: exposition.start_date,
        end_date: exposition.end_date,
        is_public: exposition.is_public,
        theme: exposition.theme || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        is_public: true,
        theme: '',
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingExposition(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExposition) {
        await api.put(`/exposition/${editingExposition.id}/`, formData);
      } else {
        await api.post('/exposition/', formData);
      }
      fetchExpositions();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save exposition:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exposition?')) {
      try {
        await api.delete(`/exposition/${id}/`);
        fetchExpositions();
      } catch (err) {
        console.error('Failed to delete exposition:', err);
      }
    }
  };

  const canEditExposition = (exposition) => {
    return user && (user.role === 'admin' || user.id === exposition.curator.id);
  };

  const getStatusColor = (exposition) => {
    const now = new Date();
    const startDate = new Date(exposition.start_date);
    const endDate = new Date(exposition.end_date);

    if (!exposition.is_active) return 'default';
    if (now < startDate) return 'warning';
    if (now > endDate) return 'error';
    return 'success';
  };

  const getStatusText = (exposition) => {
    const now = new Date();
    const startDate = new Date(exposition.start_date);
    const endDate = new Date(exposition.end_date);

    if (!exposition.is_active) return 'Inactive';
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Ended';
    return 'Active';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Virtual Expositions
        </Typography>

        {/* Expositions Grid */}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={4}>
            {expositions.map((exposition) => (
              <Grid item key={exposition.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {exposition.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Curator: {exposition.curator}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {exposition.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={getStatusText(exposition)}
                        color={getStatusColor(exposition)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={exposition.is_public ? 'Public' : 'Private'}
                        color={exposition.is_public ? 'success' : 'default'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {exposition.theme && (
                        <Chip
                          label={exposition.theme}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {new Date(exposition.start_date).toLocaleDateString()} - {new Date(exposition.end_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {exposition.rooms.length} rooms
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RoomIcon />}
                        component="a"
                        href={`/exposition/${exposition.id}`}
                      >
                        Explore
                      </Button>
                      {canEditExposition(exposition) && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenDialog(exposition)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(exposition.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add Exposition FAB */}
        {user && user.role === 'admin' && (
          <Fab
            color="primary"
            aria-label="add exposition"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => handleOpenDialog()}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Exposition Dialog */}
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingExposition ? 'Edit Exposition' : 'Create New Exposition'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Exposition Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Theme"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_public}
                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      />
                    }
                    label="Public Exposition"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingExposition ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Exposition;