import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
Box,
Button,
Card,
CardContent,
Container,
Divider,
Grid,
TextField,
Typography,
useMediaQuery,
useTheme,
Alert,
CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockResetIcon from '@mui/icons-material/LockReset';
import LoginIcon from '@mui/icons-material/Login';
import { APIResearcherForgotPassword } from '../utilities/APIS';
import { headers } from '../utilities/Env';


// Error Messages
const EmailRequired = 'Email is required';
const ERROR_POST = 'An error occurred while processing your request';
const validateEmailText = 'Please enter a valid email address';

const StyledCard = styled(Card)(({ theme }) => ({
borderRadius: theme.shape.borderRadius * 2,
boxShadow: theme.shadows[10],
transition: 'transform 0.3s ease-in-out',
'&:hover': {
    transform: 'translateY(-5px)'
},
maxWidth: 450,
margin: '0 auto',
padding: theme.spacing(3)
}));

const ForgotPassword = () => {
const navigate = useNavigate();
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

// State management
const [formData, setFormData] = useState({
    email: '',
});
const [errors, setErrors] = useState({
    email: '',
    form: ''
});
const [loading, setLoading] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
const [apiError, setApiError] = useState(null);

// Input change handler
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
    ...prev,
    [name]: value
    }));

    // Clear error when typing
    if (errors[name]) {
    setErrors(prev => ({
        ...prev,
        [name]: ''
    }));
    }
};

// Email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Form submission handler
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    setSuccessMessage('');

    // Validate inputs
    if (!formData.email) {
    setErrors({
        email: EmailRequired,
        form: EmailRequired
    });
    setLoading(false);
    return;
    }

    if (!validateEmail(formData.email)) {
    setErrors({
        email: validateEmailText,
        form: validateEmailText
    });
    setLoading(false);
    return;
    }

    try {
    const response = await axios.post(
        APIResearcherForgotPassword,
        { email: formData.email },
        { headers }
    );

    if (response.data) {
        setSuccessMessage('Password reset link has been sent to your email');
    }
    } catch (error) {
    console.error("Password reset error:", error);
    setApiError(ERROR_POST);
    } finally {
    setLoading(false);
    }
};

return (
    <Box
    sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'light' 
        ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
        : 'linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%)',
        p: isMobile ? 2 : 4
    }}
    >
    <Container maxWidth="sm">
        <StyledCard>
        <CardContent>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LockResetIcon 
                sx={{ 
                fontSize: 60, 
                color: theme.palette.primary.main,
                mb: 2
                }} 
            />
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                fontWeight: 700,
                color: theme.palette.mode === 'dark' ? '#fff' : '#333'
                }}
            >
                Reset Your Password
            </Typography>
            <Typography 
                variant="body1" 
                color="textSecondary"
                sx={{ mb: 3 }}
            >
                Enter your email address and we'll send you a link to reset your password.
            </Typography>
            </Box>

            {/* Error and Success Messages */}
            {apiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
                {apiError}
            </Alert>
            )}
            {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
            </Alert>
            )}
            {errors.form && !apiError && !successMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
                {errors.form}
            </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                autoComplete="email"
                InputProps={{
                style: {
                    borderRadius: theme.shape.borderRadius * 2
                }
                }}
            />

            <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: theme.shape.borderRadius * 2,
                textTransform: 'none',
                fontSize: '1rem'
                }}
                startIcon={loading ? <CircularProgress size={20} /> : null}
            >
                {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="textSecondary">
                OR
            </Typography>
            </Divider>

            <Button
            fullWidth
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => navigate('/')}
            sx={{
                py: 1.5,
                borderRadius: theme.shape.borderRadius * 2,
                textTransform: 'none',
                fontSize: '1rem'
            }}
            startIcon={<LoginIcon />}
            >
            Back to Login
            </Button>
        </CardContent>
        </StyledCard>

        {/* Additional Info */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
            Need help? Contact our support team
        </Typography>
        </Box>
    </Container>
    </Box>
);
};

export default ForgotPassword;