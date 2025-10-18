/* eslint-disable react-hooks/exhaustive-deps */
// validate-email.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
Container,
Paper,
Typography,
Box,
Button,
Alert,
CircularProgress,
Fade,
useTheme,
useMediaQuery,
Card,
CardContent
} from '@mui/material';
import {
CheckCircle,
Error,
Email,
ArrowForward,
Refresh
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import useCustomToast from '../hooks/useToast';
import { APIResendVerification, APIValidateEmail } from '../utilities/APIS';
import { headers } from '../utilities/Env';
// Styled Components
const ValidationCard = styled(Card)(({ theme, status }) => ({
background: status === 'success' 
    ? `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`
    : status === 'error'
    ? `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
color: 'white',
padding: theme.spacing(4),
textAlign: 'center',
borderRadius: theme.spacing(3),
boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
maxWidth: 500,
margin: '0 auto',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
width: 80,
height: 80,
borderRadius: '50%',
backgroundColor: 'rgba(255,255,255,0.2)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
margin: '0 auto 24px',
'& .MuiSvgIcon-root': {
    fontSize: 40,
},
}));

const ValidateEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const showToast = useCustomToast();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [validationStatus, setValidationStatus] = useState('validating'); // validating, success, error
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [resendLoading, setResendLoading] = useState(false);

useEffect(() => {
    validateEmailToken();
}, [token]);

const validateEmailToken = async () => {
    if (!token) {
    setValidationStatus('error');
    setMessage('Invalid validation link');
    setLoading(false);
    return;
    }

    try {
        const response = await axios.get(APIValidateEmail+`${token}`,{headers});

        if (response.data.status === 'success') {
            setValidationStatus('success');
            setMessage(response.data.message || 'Email validated successfully!');
            showToast('Success', 'Email validated successfully!', 'success');
        } else {
            setValidationStatus('error');
            setMessage(response.data.message || 'Validation failed');
        }
    } catch (error) {
    console.error('Email validation error:', error);

    let errorMessage = 'Email validation failed';
    if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
    } else if (error.code === "ERR_NETWORK") {
        errorMessage = 'Network error. Please check your connection.';
    }
    console.log(errorMessage)

    // setValidationStatus('error');
    // setMessage(errorMessage);
    // showToast('Validation Error', errorMessage, 'error');
    } finally {
    setLoading(false);
    }
};

const handleResendVerification = async () => {
    setResendLoading(true);
    try {
    // This would typically require the user's email
    // You might want to store it in localStorage or get it from context
    const userEmail = localStorage.getItem('pendingVerificationEmail');
    
    if (!userEmail) {
        showToast('Error', 'Unable to resend verification. Please try registering again.', 'error');
        return;
    }

    const response = await axios.post(APIResendVerification, {
        email: userEmail
    },{headers});

    if (response.data.status === 'success') {
        showToast('Success', 'Verification email sent successfully!', 'success');
        setMessage('A new verification email has been sent to your email address.');
    }
    } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to resend verification email';
    showToast('Error', errorMessage, 'error');
    } finally {
    setResendLoading(false);
    }
};

const handleNavigateToLogin = () => {
    navigate('/');
};

const handleRetryValidation = () => {
    setLoading(true);
    setValidationStatus('validating');
    validateEmailToken();
};

if (loading) {
    return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
        <ValidationCard status="validating">
        <CardContent>
            <IconWrapper>
            <Email />
            </IconWrapper>
            <CircularProgress 
            size={40} 
            sx={{ color: 'white', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
            Validating Your Email
            </Typography>
            <Typography variant="body1">
            Please wait while we verify your email address...
            </Typography>
        </CardContent>
        </ValidationCard>
    </Container>
    );
}

return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
    <Fade in={!loading} timeout={500}>
        <ValidationCard status={validationStatus}>
        <CardContent>
            <IconWrapper>
            {validationStatus === 'success' ? (
                <CheckCircle />
            ) : validationStatus === 'error' ? (
                <Error />
            ) : (
                <Email />
            )}
            </IconWrapper>

            <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
                fontSize: isMobile ? '1.75rem' : '2.125rem',
                fontWeight: 'bold'
            }}
            >
            {validationStatus === 'success' 
                ? 'Email Verified!' 
                : validationStatus === 'error'
                ? 'Verification Failed'
                : 'Validating Email'
            }
            </Typography>

            <Typography 
            variant="body1" 
            sx={{ 
                mb: 4,
                opacity: 0.9,
                fontSize: isMobile ? '1rem' : '1.1rem'
            }}
            >
            {message}
            </Typography>

            <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            justifyContent: 'center'
            }}>
            {validationStatus === 'success' ? (
                <Button
                variant="contained"
                size="large"
                onClick={handleNavigateToLogin}
                endIcon={<ArrowForward />}
                sx={{
                    backgroundColor: 'white',
                    color: theme.palette.success.main,
                    '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                    minWidth: 200
                }}
                >
                Continue to Login
                </Button>
            ) : validationStatus === 'error' ? (
                <>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleRetryValidation}
                    startIcon={<Refresh />}
                    sx={{
                    backgroundColor: 'white',
                    color: theme.palette.error.main,
                    '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                    }}
                >
                    Try Again
                </Button>
                <Button
                    variant="outlined"
                    size="large"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    }}
                >
                    {resendLoading ? 'Sending...' : 'Resend Email'}
                </Button>
                </>
            ) : null}
            </Box>

            {validationStatus === 'error' && (
            <Typography 
                variant="body2" 
                sx={{ 
                mt: 3,
                opacity: 0.8,
                fontSize: '0.875rem'
                }}
            >
                If you continue to experience issues, please contact support.
            </Typography>
            )}
        </CardContent>
        </ValidationCard>
    </Fade>
    </Container>
);
};

export default ValidateEmail;