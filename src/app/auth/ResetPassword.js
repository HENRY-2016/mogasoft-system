import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
Box,
Button,
CardContent,
Container,
CssBaseline,
TextField,
Typography,
Divider,
Alert,
Paper,
LinearProgress,
CircularProgress,
Fade,
InputAdornment,
IconButton
} from '@mui/material';
import { 
LockReset as LockResetIcon, 
Login as LoginIcon,
Visibility,
VisibilityOff,
CheckCircle,
Error as ErrorIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// API and constants
import { APIResearcherPasswordRest, APIVerifyResetToken } from '../utilities/APIS';
import { ERROR_POST, PasswordMisMatch, validateEmailText, ValidPasswordText } from '../utilities/Errors';
import { passwordRegex } from '../utilities/Constants';
import { headers } from '../utilities/Env';

const theme = createTheme({
palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#2e7d32' },
    background: { default: '#f5f5f5' },
},
typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
},
});

const PasswordStrengthIndicator = ({ password }) => {
if (!password) return null;

const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
};

const strength = getStrength(password);
const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a', '#4caf50'];

return (
    <Box sx={{ mt: 1, mb: 2 }}>
    <LinearProgress 
        variant="determinate" 
        value={(strength / 4) * 100} 
        sx={{ 
        height: 4, 
        borderRadius: 2,
        backgroundColor: '#e0e0e0',
        '& .MuiLinearProgress-bar': { backgroundColor: strengthColors[strength] }
        }} 
    />
    <Typography variant="caption" color="text.secondary">
        Password strength: {strengthLabels[strength]}
    </Typography>
    </Box>
);
};

const ResetPassword = () => {
const [searchParams] = useSearchParams();
const navigate = useNavigate();

const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
});

const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    form: '',
});

const [isSubmitting, setIsSubmitting] = useState(false);
const [isValidToken, setIsValidToken] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const token = searchParams.get('token');
const emailParam = searchParams.get('email');

useEffect(() => {
    const checkTokenValidity = async () => {
    if (!emailParam || !token) {
        setError('Required parameters (token and email) are missing from the URL.');
        setIsLoading(false);
        return;
    }

    try {
        // Decode URL encoded email
        const decodedEmail = decodeURIComponent(emailParam);
        setFormData(prev => ({ ...prev, email: decodedEmail }));

        const response = await axios.post(APIVerifyResetToken, {
        token: token,
        email: decodedEmail
        }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: 10000
        });

        console.log('Token verification response:', response.data);

        if (response.data.status === 'success') {
        setIsValidToken(true);
        } else {
        throw new Error(response.data.message || 'Token validation failed');
        }
    } catch (err) {
        console.error('Token verification error:', err);
        let errorMessage = 'Failed to verify reset token. ';

        if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
            errorMessage += 'Please check your internet connection and try again.';
        }
        else if (err.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. Please try again.';
        } else if (err.response) {
            // Server responded with error status
            if (err.response.status === 404) {
                errorMessage = 'API endpoint not found. Please contact support.';
            } else if (err.response.status === 422) {
                errorMessage = 'Invalid request data.';
            } else if (err.response.status === 400) {
                errorMessage = err.response.data?.message || 'Invalid or expired token.';
            } else if (err.response.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else {
                errorMessage = err.response.data?.message || 
                            err.response.data?.error?.toString() || 
                            `Server error (${err.response.status})`;
            }
        } else {
        errorMessage += err.message;
        }
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
    };

    checkTokenValidity();
}, [token, emailParam]);

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name] || errors.form) {
    setErrors(prev => ({ ...prev, [name]: '', form: '' }));
    }
};

const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
    isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = validateEmailText;
    isValid = false;
    }

    if (!formData.password) {
    newErrors.password = 'Password is required';
    isValid = false;
    } else if (!passwordRegex.test(formData.password)) {
    newErrors.password = ValidPasswordText;
    isValid = false;
    }

    if (!formData.confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password';
    isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = PasswordMisMatch;
    isValid = false;
    }

    setErrors(newErrors);
    return isValid;
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors(prev => ({ ...prev, form: '' }));

        try {
            const response = await axios.post(APIResearcherPasswordRest, {
                token: token,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
            }, { headers });

            // If we get here, the request was successful (2xx status)
            setSuccess(response.data.message || 'Password reset successfully! Redirecting to login...');
            setError('');

            setTimeout(() => {
                navigate('/', {
                    state: { message: 'Password reset successfully. Please login with your new password.' }
                });
            }, 3000);

        } catch (error) {
            console.error("Password reset error:", error);
            const errorMessage = error.response?.data?.message ||
                                error.response?.data?.error?.toString() ||
                                ERROR_POST;

            setErrors(prev => ({ ...prev, form: errorMessage }));
        } finally {
            setIsSubmitting(false);
        }
    };
const handleBackToForgotPassword = () => {
    navigate('/forgot-password', {
    state: { email: emailParam }
    });
};

const handleRetryVerification = () => {
    setIsLoading(true);
    setError('');
    // The useEffect will run again due to state change
    setTimeout(() => window.location.reload(), 100);
};

if (isLoading) {
    return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Container maxWidth="sm">
            <Paper elevation={6} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>Verifying reset link...</Typography>
            </Paper>
        </Container>
        </Box>
    </ThemeProvider>
    );
}

if (!isValidToken) {
    return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', p: 2 }}>
        <Container maxWidth="sm">
            <Paper elevation={6} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(45deg, #f44336 0%, #e57373 100%)', color: 'white', textAlign: 'center', py: 3 }}>
                <ErrorIcon sx={{ fontSize: 60 }} />
                <Typography variant="h4" component="h1" gutterBottom>Invalid Reset Link</Typography>
            </Box>

            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>{error}</Typography>
                </Alert>

                <Button variant="contained" color="primary" size="large" onClick={handleBackToForgotPassword} sx={{ mb: 2, mr: 2 }}>
                Request New Reset Link
                </Button>
                
                <Button variant="outlined" color="primary" size="large" onClick={handleRetryVerification} sx={{ mb: 2 }}>
                Retry Verification
                </Button>
                
                <Divider sx={{ my: 2 }}>OR</Divider>
                
                <Button variant="outlined" color="primary" size="large" startIcon={<LoginIcon />} onClick={() => navigate('/login')}>
                Back to Login
                </Button>
            </CardContent>
            </Paper>
        </Container>
        </Box>
    </ThemeProvider>
    );
}

return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', p: 2 }}>
        <Container maxWidth="sm">
        <Fade in={true} timeout={500}>
            <Paper elevation={6} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)', color: 'white', textAlign: 'center', py: 3 }}>
                <LockResetIcon sx={{ fontSize: 60 }} />
                <Typography variant="h4" component="h1" gutterBottom>Reset Password</Typography>
                <Typography variant="subtitle1">Create your new password</Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
                {success && (
                <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle fontSize="inherit" />}>
                    {success}
                </Alert>
                )}
                
                {errors.form && (
                <Alert severity="error" sx={{ mb: 3 }}>{errors.form}</Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField fullWidth margin="normal" label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} disabled={true} />

                <TextField fullWidth margin="normal" label="New Password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password || "Minimum 8 characters with uppercase, lowercase, number and special character"} disabled={isSubmitting} InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    </InputAdornment>
                )}} />

                <PasswordStrengthIndicator password={formData.password} />

                <TextField fullWidth margin="normal" label="Confirm New Password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} disabled={isSubmitting} InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    </InputAdornment>
                )}} />

                <Button fullWidth variant="contained" color="primary" size="large" type="submit" disabled={isSubmitting} sx={{ mt: 3, mb: 2, py: 1.5 }}>
                    {isSubmitting ? <><CircularProgress size={20} sx={{ mr: 1 }} /> Resetting Password...</> : 'Reset Password'}
                </Button>

                <Divider sx={{ my: 3 }}>OR</Divider>

                <Button fullWidth variant="outlined" color="primary" size="large" startIcon={<LoginIcon />} onClick={() => navigate('/login')} disabled={isSubmitting}>
                    Back to Login
                </Button>
                </Box>
            </CardContent>
            </Paper>
        </Fade>
        </Container>
    </Box>
    </ThemeProvider>
);
};

export default ResetPassword;