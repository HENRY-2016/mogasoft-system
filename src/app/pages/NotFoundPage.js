// app/pages/NotFoundPage.js
import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
Home as HomeIcon,
SearchOff as NotFoundIcon,
ArrowBack as BackIcon
} from '@mui/icons-material';

const NotFoundPage = () => {
const navigate = useNavigate();

return (
    <Container maxWidth="md">
    <Box
        sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        py: 4
        }}
    >
        <Paper
        elevation={0}
        sx={{
            p: 6,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
            border: '1px solid #e0e0e0'
        }}
        >
        <NotFoundIcon
            sx={{
            fontSize: 120,
            color: 'primary.main',
            mb: 2,
            opacity: 0.8
            }}
        />
        
        <Typography
            variant="h1"
            sx={{
            fontSize: '6rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #0d83fd 30%, #059652 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 2
            }}
        >
            404
        </Typography>

        <Typography
            variant="h4"
            sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
            }}
        >
            Oops! Page Not Found
        </Typography>

        <Typography
            variant="body1"
            sx={{
            color: 'text.secondary',
            mb: 4,
            maxWidth: '400px',
            mx: 'auto',
            lineHeight: 1.6
            }}
        >
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600
            }}
            >
            Go Home
            </Button>
            
            <Button
            variant="outlined"
            size="large"
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600
            }}
            >
            Go Back
            </Button>
        </Box>
        </Paper>
    </Box>
    </Container>
);
};

export default NotFoundPage;