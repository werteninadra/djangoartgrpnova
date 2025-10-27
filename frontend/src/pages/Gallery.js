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
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../services/api';

const Gallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
    artwork_ids: [],
  });

  useEffect(() => {
    checkAuth();
    fetchGalleries();
    fetchArtworks();
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

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gallery/');
      setGalleries(response.data);
    } catch (err) {
      console.error('Failed to fetch galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtworks = async () => {
    try {
      const response = await api.get('/catalogue/artworks/');
      setArtworks(response.data);
    } catch (err) {
      console.error('Failed to fetch artworks:', err);
    }
  };

  const handleOpenDialog = (gallery = null) => {
    setEditingGallery(gallery);
    if (gallery) {
      setFormData({
        name: gallery.name,
        description: gallery.description || '',
        is_public: gallery.is_public,
        artwork_ids: gallery.artworks.map(artwork => artwork.artwork.id),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_public: true,
        artwork_ids: [],
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingGallery(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGallery) {
        await api.put(`/gallery/${editingGallery.id}/`, formData);
      } else {
        await api.post('/gallery/', formData);
      }
      fetchGalleries();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save gallery:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery?')) {
      try {
        await api.delete(`/gallery/${id}/`);
        fetchGalleries();
      } catch (err) {
        console.error('Failed to delete gallery:', err);
      }
    }
  };

  const canEditGallery = (gallery) => {
    return user && (user.role === 'admin' || user.id === gallery.curator.id);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Virtual Galleries
        </Typography>

        {/* Galleries Grid */}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={4}>
            {galleries.map((gallery) => (
              <Grid item key={gallery.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {gallery.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Curator: {gallery.curator}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {gallery.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={gallery.is_public ? 'Public' : 'Private'}
                        color={gallery.is_public ? 'success' : 'default'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${gallery.artworks.length} artworks`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        component="a"
                        href={`/gallery/${gallery.id}`}
                      >
                        View
                      </Button>
                      {canEditGallery(gallery) && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenDialog(gallery)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(gallery.id)}
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

        {/* Add Gallery FAB */}
        {user && (
          <Fab
            color="primary"
            aria-label="add gallery"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => handleOpenDialog()}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Gallery Dialog */}
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingGallery ? 'Edit Gallery' : 'Create New Gallery'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Gallery Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_public}
                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      />
                    }
                    label="Public Gallery"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Select Artworks
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {artworks.map((artwork) => (
                      <Chip
                        key={artwork.id}
                        label={artwork.title}
                        clickable
                        color={formData.artwork_ids.includes(artwork.id) ? 'primary' : 'default'}
                        onClick={() => {
                          const newArtworkIds = formData.artwork_ids.includes(artwork.id)
                            ? formData.artwork_ids.filter(id => id !== artwork.id)
                            : [...formData.artwork_ids, artwork.id];
                          setFormData({ ...formData, artwork_ids: newArtworkIds });
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingGallery ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Gallery;