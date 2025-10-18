import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
Box, 
Button, 
TextField, 
Typography, 
Paper, 
Divider, 
Alert,
styled,
IconButton,
InputAdornment
} from '@mui/material';
import { 
Visibility, 
VisibilityOff,
Login as LoginIcon,
Person as PersonIcon,
Lock as LockIcon,
Email as EmailIcon
} from '@mui/icons-material';
import useCustomToast from '../hooks/useToast';
import { TEXT_CONNECTION_ERROR, TEXT_ERROR_INPUTS } from '../utilities/Text';
import { headers } from '../utilities/Env';
import { MogasoftLog } from '../assests';
import { APIUserLogIn } from '../utilities/APIS';

const LogoImage = styled('img')(({ theme }) => ({
    height: 100,
    width: 100,
    borderRadius:10,
    objectFit: 'contain',
[theme.breakpoints.down('md')]: {
    height: 35,
},
}));

const Login = () => {
    const navigate = useNavigate();
    const showToast = useCustomToast();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        showPassword: false
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

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

    const togglePasswordVisibility = () => {
        setFormData(prev => ({
        ...prev,
        showPassword: !prev.showPassword
        }));
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = {
        email: '',
        password: ''
        };

        if (!formData.email) {
        newErrors.email = 'Email is required';
        valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
        valid = false;
        }

        if (!formData.password) {
        newErrors.password = 'Password is required';
        valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
        showToast("Warning", TEXT_ERROR_INPUTS, "warning");
        return;
        }

        setLoading(true);

        try {
        const response = await axios.post(APIUserLogIn, {
            email: formData.email,
            password: formData.password
        }, { headers });

        if (response.data.status === "success") {
            const userData = response.data.data;

            const userInfo = {
                name: userData.name,
                email: userData.email,
                id: userData.id,
                loggedIn: true,
                };

            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            showToast("Success", "Login successful", "success");
            // Redirect to dashboard after successful login
            navigate("/dashboard");
        } else {
            showToast("Error", response.data.message || "Login failed", "error");
        }
        } catch (error) {
            // handleLoginError(error);
            if (error.response) {
                    // Handle validation errors (422 status)
                    if (error.response.status === 422) {
                        const errors = error.response.data.errors;
                        let errorMessages = [];
                        // Collect all validation error messages
                        for (const field in errors) {
                            errorMessages.push(...errors[field]);
                        }
                        
                        // Show all error messages in toast
                        showToast(
                            "Validation Error", 
                            errorMessages.join("\n"), 
                            "error"
                        );
                    } 
                    // Handle other API errors
                    else {
                        showToast(
                            "Error", 
                            error.response.data.message || "An error occurred", 
                            "error"
                        );
                    }
                } 
                // Handle network errors
                else if (error.code === "ERR_NETWORK") {
                    showToast("Connection Error", TEXT_CONNECTION_ERROR, "error");
                }
                // Handle other unexpected errors
                else {
                    showToast("Error", "An unexpected error occurred", "error");
                }
        } finally {
        setLoading(false);
        }
    };



return (
    <Box sx={{
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2
    }}>
    <Paper elevation={3} sx={{
        width: '100%',
        maxWidth: 450,
        p: 4,
        borderRadius: 2
    }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold',
            mb: 1,
            color: 'primary.main'
        }}>
            Welcome Back!
        </Typography>
        <LogoImage
            src={MogasoftLog} 
            alt="RIA Logo" 
            />
        <Typography variant="h6" sx={{
            color: 'error.main',
            fontWeight: 'bold'
        }}>
            Mogasoft 
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Log in to continue
        </Typography>
        </Box>

        <Box component="form" sx={{ mt: 2 }}>
        <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                <EmailIcon color="action" />
                </InputAdornment>
            ),
            }}
            sx={{ mb: 2 }}
        />

        <TextField
            fullWidth
            label="Password"
            name="password"
            type={formData.showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                <LockIcon color="action" />
                </InputAdornment>
            ),
            endAdornment: (
                <InputAdornment position="end">
                <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
                </InputAdornment>
            ),
            }}
            sx={{ mb: 1 }}
        />

        {/* <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            mb: 2
        }}>
            <Link to="/forget-password" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary">
                Forgot password?
            </Typography>
            </Link>
        </Box> */}
        <br></br>
        <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleLogin}
            disabled={loading}
            startIcon={<LoginIcon />}
            sx={{
            py: 1.5,
            mb: 2,
            fontSize: '1rem'
            }}
        >
            {loading ? 'Logging in...' : 'Log In'}
        </Button>

        <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
            OR
            </Typography>
        </Divider>



        {/* <Box sx={{ 
            textAlign: 'center',
            mt: 3 
        }}>
            <Typography variant="body2">
            Don't have an account?{' '}
            <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography 
                component="span" 
                color="primary"
                sx={{ fontWeight: 'bold' }}
                >
                Register Now
                </Typography>
            </Link>
            </Typography>
        </Box> */}
        </Box>
    </Paper>
    </Box>
);
};

export default Login;