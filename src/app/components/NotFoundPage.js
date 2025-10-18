import React from 'react';
import { Link } from 'react-router-dom';
import { 
Box, 
Typography, 
Button, 
Container, 
Paper,
useTheme,
Fade
} from '@mui/material';
import { 
Home, 
Search, 
Science, 
School,
ArrowBack 
} from '@mui/icons-material';

const NotFoundPage = () => {
const theme = useTheme();

const quickLinks = [
    { icon: <Home />, label: 'Home', path: '/dashboard' },
    { icon: <Science />, label: 'Research', path: '/researches' },
    { icon: <School />, label: 'Projects', path: '/projects' },
    { icon: <Search />, label: 'Products', path: '/products' },
];

return (
    <Fade in={true} timeout={800}>
    <Box
        sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        }}
    >
        <Container maxWidth="md">
        <Paper
            elevation={8}
            sx={{
            p: { xs: 3, md: 6 },
            textAlign: 'center',
            borderRadius: 4,
            background: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.custom.primaryColor}, ${theme.palette.custom.cardColor})`,
            }
            }}
        >
            {/* Animated 404 Number */}
            <Box
            sx={{
                fontSize: { xs: '120px', md: '160px' },
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${theme.palette.custom.primaryColor}, ${theme.palette.custom.cardColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                mb: 2,
                fontFamily: '"Roboto Mono", monospace',
            }}
            >
            404
            </Box>

            {/* Main Title */}
            <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                mb: 2,
            }}
            >
            Knowledge Not Found
            </Typography>

            {/* Subtitle */}
            <Typography
            variant="h6"
            color="text.secondary"
            sx={{
                mb: 4,
                maxWidth: '500px',
                mx: 'auto',
                lineHeight: 1.6,
            }}
            >
            The research page you're looking for has either been published elsewhere 
            or is currently under peer review. Let's redirect your curiosity to 
            more fruitful discoveries.
            </Typography>

            {/* Quick Actions */}
            <Box sx={{ mb: 4 }}>
            <Button
                variant="contained"
                size="large"
                component={Link}
                to="/dashboard"
                startIcon={<ArrowBack />}
                sx={{
                bgcolor: theme.palette.custom.primaryColor,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                    bgcolor: theme.palette.custom.greenColor,
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                },
                transition: 'all 0.3s ease',
                mr: 2,
                mb: { xs: 2, sm: 0 },
                }}
            >
                Return to Dashboard
            </Button>
            
            <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/researches"
                sx={{
                borderColor: theme.palette.custom.cardColor,
                color: theme.palette.custom.cardColor,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                    borderColor: theme.palette.custom.blueColor,
                    backgroundColor: 'rgba(13, 73, 145, 0.04)',
                    transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
                }}
            >
                Explore Research
            </Button>
            </Box>

            {/* Quick Links Grid */}
            <Box sx={{ mb: 4 }}>
            <Typography
                variant="h6"
                gutterBottom
                sx={{
                color: theme.palette.text.secondary,
                mb: 3,
                }}
            >
                Quick Navigation
            </Typography>
            
            <Box
                sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(4, 1fr)'
                },
                gap: 2,
                maxWidth: '400px',
                mx: 'auto',
                }}
            >
                {quickLinks.map((link, index) => (
                <Button
                    key={index}
                    component={Link}
                    to={link.path}
                    variant="outlined"
                    size="small"
                    startIcon={link.icon}
                    sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    '&:hover': {
                        borderColor: theme.palette.custom.primaryColor,
                        backgroundColor: 'rgba(7, 73, 0, 0.04)',
                        transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                    flexDirection: 'column',
                    height: 'auto',
                    }}
                >
                    <Box sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                    {link.label}
                    </Box>
                </Button>
                ))}
            </Box>
            </Box>

            {/* Support Section */}
            <Paper
            variant="outlined"
            sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: 'grey.50',
                borderColor: 'grey.200',
            }}
            >
            <Typography
                variant="body1"
                color="text.secondary"
                gutterBottom
            >
                Need assistance with your research journey?
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                variant="text"
                size="small"
                sx={{
                    color: theme.palette.custom.cardColor,
                    fontWeight: 'bold',
                }}
                >
                Contact Support
                </Button>
                
                <Button
                component={Link}
                to="/feedback"
                variant="text"
                size="small"
                sx={{
                    color: theme.palette.custom.primaryColor,
                    fontWeight: 'bold',
                }}
                >
                Provide Feedback
                </Button>
            </Box>
            </Paper>

            {/* Decorative Elements */}
            <Box
            sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.palette.custom.yellowColor}33 0%, transparent 70%)`,
                zIndex: 0,
            }}
            />
            <Box
            sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.palette.custom.cardColor}33 0%, transparent 70%)`,
                zIndex: 0,
            }}
            />
        </Paper>
        </Container>
    </Box>
    </Fade>
);
};

export default NotFoundPage;