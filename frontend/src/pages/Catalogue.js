import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const Catalogue = () => {
  const [artworks, setArtworks] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year_created: '',
    style: '',
    medium: '',
    dimensions: '',
    tag_ids: [],
  });

  // Chargement initial
  useEffect(() => {
    checkAuth();
    fetchInitialData();
  }, []);

  // Rafraîchir la liste à chaque changement de filtre
  useEffect(() => {
    fetchArtworks();
  }, [searchTerm, styleFilter]);

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

  const fetchInitialData = async () => {
    try {
      await Promise.all([fetchArtworks(), fetchTags()]);
    } catch (err) {
      console.error('Initial data fetch failed:', err);
    }
  };

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (styleFilter) params.append('style', styleFilter);

      const response = await api.get(`/catalogue/artworks/?${params}`);
      setArtworks(response.data);
    } catch (err) {
      console.error('Failed to fetch artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/catalogue/tags/');
      setTags(response.data);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const handleOpenDialog = (artwork = null) => {
    setEditingArtwork(artwork);
    if (artwork) {
      setFormData({
        title: artwork.title || '',
        description: artwork.description || '',
        year_created: artwork.year_created || '',
        style: artwork.style || '',
        medium: artwork.medium || '',
        dimensions: artwork.dimensions || '',
        tag_ids: artwork.tags?.map((tag) => tag.id) || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        year_created: '',
        style: '',
        medium: '',
        dimensions: '',
        tag_ids: [],
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingArtwork(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim() || !formData.style) {
      alert('Please fill all required fields.');
      return;
    }

    const data = {
      title: formData.title.trim(),
      description: formData.description.trim() || '',
      year_created: formData.year_created ? Number(formData.year_created) : null,
      style: formData.style,
      medium: formData.medium.trim() || '',
      dimensions: formData.dimensions.trim() || '',
      tag_ids: Array.isArray(formData.tag_ids) ? formData.tag_ids : [],
    };

    try {
      if (editingArtwork) {
        await api.put(`/catalogue/artworks/${editingArtwork.id}/`, data);
      } else {
        await api.post('/catalogue/artworks/', data);
      }
      await fetchArtworks();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save artwork:', err);
      const errors = err.response?.data;
      if (errors) {
        const message = Object.entries(errors)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n');
        alert(`Validation error:\n${message}`);
      } else {
        alert('Failed to save artwork.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return;
    try {
      await api.delete(`/catalogue/artworks/${id}/`);
      fetchArtworks();
    } catch (err) {
      console.error('Failed to delete artwork:', err);
    }
  };

  const handleLike = async (id) => {
    try {
      await api.post(`/catalogue/artworks/${id}/like/`);
      fetchArtworks();
    } catch (err) {
      console.error('Failed to like artwork:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h3" gutterBottom>
        Art Catalogue
      </Typography>

      {/* 🔍 Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Style</InputLabel>
          <Select
            value={styleFilter}
            label="Style"
            onChange={(e) => setStyleFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {['abstract', 'realism', 'impressionism', 'surrealism', 'modern', 'contemporary', 'other'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 🎨 Artworks */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {artworks.length > 0 ? (
            artworks.map((artwork) => (
              <Grid item key={artwork.id} xs={12} sm={6} md={4}>
                <Card>
                  {artwork.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={artwork.image}
                      alt={artwork.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h5">{artwork.title}</Typography>
                    <Typography variant="body2">By {artwork.artist?.name}</Typography>
                    <Typography variant="body2">
                      {artwork.year_created} • {artwork.style}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      {artwork.tags?.map((t) => (
                        <Chip key={t.id} label={t.name} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </Box>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Popularity: {artwork.popularity_score}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button size="small" onClick={() => handleLike(artwork.id)}>
                        Like
                      </Button>
                      {user && user.role === 'admin' && (
                        <>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenDialog(artwork)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(artwork.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography sx={{ m: 4 }}>No artworks found.</Typography>
          )}
        </Grid>
      )}

      {/* ➕ Add/Edit Artwork Dialog */}
      {user && user.role === 'admin' && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Year Created"
                  fullWidth
                  type="number"
                  value={formData.year_created}
                  onChange={(e) => setFormData({ ...formData, year_created: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Style</InputLabel>
                  <Select
                    value={formData.style}
                    label="Style"
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  >
                    {['abstract', 'realism', 'impressionism', 'surrealism', 'modern', 'contemporary', 'other'].map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Medium"
                  fullWidth
                  value={formData.medium}
                  onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dimensions"
                  fullWidth
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tags</InputLabel>
                  <Select
                    multiple
                    value={formData.tag_ids}
                    label="Tags"
                    onChange={(e) => setFormData({ ...formData, tag_ids: e.target.value })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => {
                          const tag = tags.find((t) => t.id === id);
                          return tag ? <Chip key={id} label={tag.name} size="small" /> : null;
                        })}
                      </Box>
                    )}
                  >
                    {tags.map((tag) => (
                      <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingArtwork ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Catalogue;
