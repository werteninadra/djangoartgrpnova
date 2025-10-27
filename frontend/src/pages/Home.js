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
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [expositions, setExpositions] = useState([]);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      const [artworksResponse, galleriesResponse, expositionsResponse] = await Promise.all([
        api.get('/catalogue/artworks/?limit=6'),
        api.get('/gallery/?limit=3'),
        api.get('/exposition/?limit=3'),
      ]);
      setFeaturedArtworks(artworksResponse.data.results || artworksResponse.data);
      setGalleries(galleriesResponse.data.results || galleriesResponse.data);
      setExpositions(expositionsResponse.data.results || expositionsResponse.data);
    } catch (err) {
      console.error('Failed to fetch featured content:', err);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 6,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
          borderRadius: '24px',
          padding: '4rem 2rem',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #8B5CF6, #F59E0B)',
            borderRadius: '24px',
            zIndex: -1,
            padding: '2px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
          },
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            fontWeight: 800,
            mb: 3,
            textShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
          }}
        >
          🎨 Art Gallery
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontSize: { xs: '1.2rem', md: '1.8rem' },
            fontWeight: 300,
            mb: 4,
            opacity: 0.9,
          }}
        >
          Discover, explore, and experience art in immersive virtual spaces
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/catalogue"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #8B5CF6 30%, #F59E0B 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #7C3AED 30%, #D97706 90%)',
                transform: 'scale(1.05)',
              },
            }}
          >
            🖼️ Explore Catalogue
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/gallery"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderColor: '#F59E0B',
              color: '#F59E0B',
              '&:hover': {
                borderColor: '#8B5CF6',
                color: '#8B5CF6',
                background: 'rgba(139, 92, 246, 0.1)',
              },
            }}
          >
            🏛️ Virtual Galleries
          </Button>
        </Box>
      </Box>

      <Box sx={{ my: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            textAlign: 'center',
            mb: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              background: 'linear-gradient(45deg, #8B5CF6 30%, #F59E0B 90%)',
              borderRadius: '2px',
            },
          }}
        >
          ✨ Featured Artworks
        </Typography>
        <Grid container spacing={4}>
          {featuredArtworks.slice(0, 6).map((artwork) => (
            <Grid item key={artwork.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    zIndex: 1,
                  },
                }}
              >
                {artwork.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={artwork.image}
                    alt={artwork.title}
                    sx={{
                      filter: 'brightness(0.9)',
                      transition: 'filter 0.3s ease',
                      '&:hover': {
                        filter: 'brightness(1.1)',
                      },
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 2 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      color: '#F59E0B',
                      mb: 1,
                    }}
                  >
                    {artwork.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B794F6', mb: 0.5 }}>
                    {artwork.artist?.name || 'Unknown Artist'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8B5CF6' }}>
                    {artwork.year_created || 'Date unknown'}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {artwork.tags?.slice(0, 3).map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        sx={{
                          background: 'linear-gradient(45deg, #8B5CF6 30%, #F59E0B 90%)',
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="outlined"
            component={Link}
            to="/catalogue"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderColor: '#8B5CF6',
              color: '#8B5CF6',
              '&:hover': {
                borderColor: '#F59E0B',
                color: '#F59E0B',
                background: 'rgba(245, 158, 11, 0.1)',
              },
            }}
          >
            🖼️ View All Artworks
          </Button>
        </Box>
      </Box>

      <Box sx={{ my: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            textAlign: 'center',
            mb: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              background: 'linear-gradient(45deg, #F59E0B 30%, #8B5CF6 90%)',
              borderRadius: '2px',
            },
          }}
        >
          🏛️ Featured Galleries
        </Typography>
        <Grid container spacing={4}>
          {galleries.map((gallery) => (
            <Grid item key={gallery.id} xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                    zIndex: 1,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 2 }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      color: '#8B5CF6',
                      mb: 2,
                    }}
                  >
                    {gallery.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B794F6', mb: 2, lineHeight: 1.4 }}>
                    {gallery.description || 'A curated collection of artworks'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: '#F59E0B' }}>
                      👤 <strong>Curator:</strong> {gallery.curator}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8B5CF6' }}>
                      🖼️ <strong>Artworks:</strong> {gallery.artworks?.length || 0}
                    </Typography>
                    <Chip
                      label={gallery.is_public ? '🌍 Public' : '🔒 Private'}
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        background: gallery.is_public
                          ? 'linear-gradient(45deg, #10B981 30%, #34D399 90%)'
                          : 'linear-gradient(45deg, #F59E0B 30%, #FBBF24 90%)',
                        color: 'white',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, position: 'relative', zIndex: 2 }}>
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/gallery/${gallery.id}`}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #F59E0B 30%, #8B5CF6 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #D97706 30%, #7C3AED 90%)',
                      },
                    }}
                  >
                    🚀 Explore Gallery
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="outlined"
            component={Link}
            to="/gallery"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderColor: '#F59E0B',
              color: '#F59E0B',
              '&:hover': {
                borderColor: '#8B5CF6',
                color: '#8B5CF6',
                background: 'rgba(139, 92, 246, 0.1)',
              },
            }}
          >
            🏛️ View All Galleries
          </Button>
        </Box>
      </Box>

      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Current Expositions
        </Typography>
        <Grid container spacing={4}>
          {expositions.map((exposition) => (
            <Grid item key={exposition.id} xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {exposition.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {exposition.description}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Curator:</strong> {exposition.curator}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Dates:</strong> {exposition.start_date} - {exposition.end_date}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Theme:</strong> {exposition.theme || 'General'}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button variant="contained" component={Link} to={`/exposition/${exposition.id}`}>
                    Explore Exposition
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="outlined" component={Link} to="/exposition">
            View All Expositions
          </Button>
        </Box>
      </Box>

      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3">
                  Virtual Galleries
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and explore personalized galleries with artworks positioned in 3D space.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3">
                  Interactive Expositions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Experience curated exhibitions with guided virtual tours and room navigation.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3">
                  Smart Recommendations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discover new artworks based on your preferences and viewing history.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;