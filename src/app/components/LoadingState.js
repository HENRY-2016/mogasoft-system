import React from 'react';
import {
Container,
Box,
Typography,
CircularProgress,
Fade,
useTheme,
alpha
} from '@mui/material';
import {
Science,
AutoAwesome,
Psychology,
TrendingUp
} from '@mui/icons-material';

const LoadingState = () => {
const theme = useTheme();

const rotatingIcons = [
    { icon: <Science sx={{ fontSize: 40 }} />, color: theme.palette.custom.primaryColor },
    { icon: <Psychology sx={{ fontSize: 40 }} />, color: theme.palette.custom.cardColor },
    { icon: <TrendingUp sx={{ fontSize: 40 }} />, color: theme.palette.custom.greenColor },
    { icon: <AutoAwesome sx={{ fontSize: 40 }} />, color: theme.palette.custom.yellowColor },
];

const [currentIcon, setCurrentIcon] = React.useState(0);

React.useEffect(() => {
    const interval = setInterval(() => {
    setCurrentIcon((prev) => (prev + 1) % rotatingIcons.length);
    }, 1500);
    return () => clearInterval(interval);
}, [rotatingIcons.length]);

return (
    <Fade in={true} timeout={800}>
    <Container 
        maxWidth="lg" 
        sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        marginTop:10,
        position: 'relative'
        }}
    >
        {/* Animated Background Elements */}
        <Box
        sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, ${alpha(theme.palette.custom.primaryColor, 0.05)} 0%, transparent 70%)`,
            animation: 'pulse 3s ease-in-out infinite',
            '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5, transform: 'translate(-50%, -50%) scale(1)' },
            '50%': { opacity: 0.8, transform: 'translate(-50%, -50%) scale(1.1)' },
            },
        }}
        />
        
        <Box
        sx={{
            position: 'absolute',
            top: '20%',
            right: '20%',
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${alpha(theme.palette.custom.cardColor, 0.03)} 0%, transparent 70%)`,
            animation: 'float 4s ease-in-out infinite',
            '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
            },
        }}
        />

        <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
        }}
        >
        {/* Main Loading Container */}
        <Box
            sx={{
            p: 6,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8f9fa', 0.95)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.custom.primaryColor, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            maxWidth: '500px',
            width: '100%',
            }}
        >
            {/* Rotating Icons */}
            <Box
            sx={{
                position: 'relative',
                height: '120px',
                width: '120px',
                margin: '0 auto 24px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            >
            {/* Outer rotating ring */}
            <CircularProgress
                size={120}
                thickness={2}
                sx={{
                color: alpha(theme.palette.custom.primaryColor, 0.2),
                position: 'absolute',
                animation: 'rotate 3s linear infinite',
                }}
            />
            
            {/* Main progress indicator */}
            <CircularProgress
                size={100}
                thickness={3}
                variant="indeterminate"
                sx={{
                color: theme.palette.custom.primaryColor,
                position: 'absolute',
                '& .MuiCircularProgress-circle': {
                    animation: 'circular-dash 1.5s ease-in-out infinite',
                },
                }}
            />

            {/* Central rotating icon */}
            <Box
                sx={{
                animation: 'iconSpin 2s ease-in-out infinite',
                color: rotatingIcons[currentIcon].color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '@keyframes iconSpin': {
                    '0%': { transform: 'scale(0.8) rotate(0deg)', opacity: 0.7 },
                    '50%': { transform: 'scale(1.1) rotate(180deg)', opacity: 1 },
                    '100%': { transform: 'scale(0.8) rotate(360deg)', opacity: 0.7 },
                },
                }}
            >
                {rotatingIcons[currentIcon].icon}
            </Box>
            </Box>

            {/* Loading Text */}
            <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${theme.palette.custom.primaryColor}, ${theme.palette.custom.cardColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 2,
            }}
            >
            Research & Innovations Academy
            </Typography>

            <Typography
            variant="h6"
            color="#dc004e"
            gutterBottom
            sx={{
                mb: 1,
                fontWeight: 500,
            }}
            >
            Loading your page...
            </Typography>

            <Typography
            variant="body2"
            color="#dc004e"
            sx={{
                mb: 3,
                opacity: 0.8,
                fontStyle: 'italic',
            }}
            >
            Preparing the latest research insights and innovations
            </Typography>

            {/* Progress Dots */}
            <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                mt: 2,
            }}
            >
            {[0, 1, 2].map((index) => (
                <Box
                key={index}
                sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.custom.primaryColor,
                    animation: `bounce 1.4s infinite ease-in-out ${index * 0.16}s`,
                    '@keyframes bounce': {
                    '0%, 80%, 100%': {
                        transform: 'scale(0.8)',
                        opacity: 0.5,
                    },
                    '40%': {
                        transform: 'scale(1.2)',
                        opacity: 1,
                    },
                    },
                }}
                />
            ))}
            </Box>
        </Box>
        </Box>

        {/* Add global keyframes */}
        <style>
        {`
            @keyframes circular-dash {
            0% {
                stroke-dasharray: 1, 200;
                stroke-dashoffset: 0;
            }
            50% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -35;
            }
            100% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -124;
            }
            }
            @keyframes rotate {
            100% {
                transform: rotate(360deg);
            }
            }
        `}
        </style>
    </Container>
    </Fade>
);
};

export default LoadingState;


// In your component
// {isLoading ? <LoadingState /> : <YourActualContent />}