import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
Button,
TextField,
Select,
MenuItem,
FormControl,
InputLabel,
Modal,
Box,
Typography,
Alert,
List,
ListItem,
ListItemText,
Badge,
Paper,
Divider,
useMediaQuery,
useTheme,
InputAdornment,
Chip,
Stepper,
Step,
StepLabel,
Fade,
Zoom,
Container,
Card,
CardContent,
CircularProgress,
Slide,
LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
Person,
Email,
Phone,
School,
Flag,
Lock,
Visibility,
VisibilityOff,
CheckCircle,
Cancel,
Search,
Groups,
AppRegistration,
Login,
ArrowBack,
DoneAll,
Send
} from '@mui/icons-material';
import {APIResearcherStore, APIUniversitiesList } from '../utilities/APIS';
import { headers } from '../utilities/Env';
import useCustomToast from '../hooks/useToast';
import { TEXT_CONNECTION_ERROR} from '../utilities/Text';
import logoIcone from "../utilities/imgs/logo.png";

// Validation constants
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_REGEX = /^\d{10}$/; // Exactly 10 digits

// Styled Components
const ModernCard = styled(Card)(({ theme }) => ({
background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
backdropFilter: 'blur(10px)',
border: `1px solid ${theme.palette.divider}`,
borderRadius: theme.spacing(2),
boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const StyledModal = styled(Modal)(({ theme }) => ({
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
padding: theme.spacing(2),
}));

const ModalContent = styled(Box)(({ theme }) => ({
backgroundColor: theme.palette.background.paper,
padding: theme.spacing(4),
borderRadius: theme.spacing(2),
width: '90%',
maxWidth: '600px',
maxHeight: '90vh',
overflow: 'auto',
background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
[theme.breakpoints.down('sm')]: {
    width: '95%',
    padding: theme.spacing(3),
},
}));

const UniversityList = styled(List)(({ theme }) => ({
maxHeight: '300px',
overflow: 'auto',
border: `1px solid ${theme.palette.divider}`,
borderRadius: theme.spacing(1),
'& .MuiListItem-root': {
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5),
    '&:hover': {
    backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    },
},
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
margin: theme.spacing(0.5),
color: theme.palette.success.main,
}));

const PasswordStrengthBar = styled(Box)(({ theme, strength }) => ({
height: 4,
borderRadius: 2,
marginTop: theme.spacing(1),
backgroundColor: 
    strength === 'weak' ? theme.palette.error.main :
    strength === 'medium' ? theme.palette.warning.main :
    theme.palette.success.main,
transition: 'all 0.3s ease',
}));

const LogoImage = styled('img')(({ theme }) => ({
height: 80,
width: 80,
borderRadius: 12,
objectFit: 'contain',
filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
}));

const Register = () => {
const navigate = useNavigate();
const [postStatus, setPostSatus] = useState('ADD');
const showToast = useCustomToast();
const [error, setError] = useState(null);
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

// Form state
const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contact: '',
    title: '',
    nationality: '',
    universityId: '',
    universityName: '',
    typedUniversity: '',
    password: '',
    passwordRetype: ''
});

// UI state
const [universities, setUniversities] = useState([]);
const [showWhyModal, setShowWhyModal] = useState(false);
const [showUniversityModal, setShowUniversityModal] = useState(false);
const [showUniversityNotListed, setShowUniversityNotListed] = useState(false);
const [universitySearch, setUniversitySearch] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [activeStep, setActiveStep] = useState(0);
const [passwordStrength, setPasswordStrength] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);

// Validation state
const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    contact: '',
    title: '',
    nationality: '',
    universityId: '',
    password: '',
    passwordMatch: '',
    form: '',
    userExists: ''
});

// Step validation state
const [stepValidations, setStepValidations] = useState({
    0: false, // Personal Info
    1: false, // Academic Details
    2: false  // Security
});

// Loading and error state
const [loading, setLoading] = useState(false);

// Load initial data
useEffect(() => {
    fetchData();
}, []);

// Password strength calculator
useEffect(() => {
    if (formData.password) {
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
    } else {
    setPasswordStrength('');
    }
}, [formData.password]);

// Validate current step when form data changes
useEffect(() => {
    validateCurrentStep();
}, [formData, activeStep]);

const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
};

const validateCurrentStep = () => {
    let isValid = true;
    const newStepValidations = { ...stepValidations };
    const newErrors = { ...errors };

    switch (activeStep) {
        case 0: // Personal Info
            // Reset step-specific errors
            newErrors.fullName = '';
            newErrors.contact = '';
            newErrors.title = '';
            newErrors.nationality = '';

            if (!formData.fullName.trim()) {
                newErrors.fullName = 'Full name is required';
                isValid = false;
            }

            if (!formData.contact.trim()) {
                newErrors.contact = 'Contact number is required';
                isValid = false;
            } else if (!CONTACT_REGEX.test(formData.contact)) {
                newErrors.contact = 'Contact number must be exactly 10 digits';
                isValid = false;
            }

            if (!formData.title.trim()) {
                newErrors.title = 'Title is required';
                isValid = false;
            }

            if (!formData.nationality.trim()) {
                newErrors.nationality = 'Nationality is required';
                isValid = false;
            }
            break;
        
        case 1: // Academic Details
            newErrors.universityId = '';
            newErrors.email = '';

            if (!formData.universityId || formData.universityId === '0000' && !formData.universityName.trim()) {
                newErrors.universityId = 'University selection is required';
                isValid = false;
            }

            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
                isValid = false;
            } else if (!EMAIL_REGEX.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
                isValid = false;
            }
            break;
        
        case 2: // Security
            newErrors.password = '';
            newErrors.passwordMatch = '';

            if (!formData.password) {
                newErrors.password = 'Password is required';
                isValid = false;
            } else if (!PASSWORD_REGEX.test(formData.password)) {
                newErrors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
                isValid = false;
            }

            if (!formData.passwordRetype) {
                newErrors.passwordMatch = 'Please confirm your password';
                isValid = false;
            } else if (formData.password !== formData.passwordRetype) {
                newErrors.passwordMatch = 'Passwords do not match';
                isValid = false;
            }
            break;
        
        default:
            isValid = false;
    }

    newStepValidations[activeStep] = isValid;
    setStepValidations(newStepValidations);
    setErrors(newErrors);
    return isValid;
};

const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
    const [unisRes] = await Promise.all([
        axios.get(APIUniversitiesList, { headers }),
    ]);

    const data = Array.isArray(unisRes.data.data) ? unisRes.data.data.reverse() : [];
    setUniversities(data);
    } catch (error) {
    let errorMessage = "Failed to load data";
    if (error.response) {
        errorMessage = error.response.data.message || error.message;
    } else if (error.code === "ERR_NETWORK") {
        errorMessage = TEXT_CONNECTION_ERROR;
    }
    setError(errorMessage);
    showToast("Error", errorMessage, "error");
    } finally {
    setLoading(false);
    }
};

const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for contact field - only allow numbers and limit to 10 digits
    if (name === 'contact') {
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({
        ...prev,
        [name]: numericValue
    }));
    } else {
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
    }

    // Clear errors when user starts typing
    if (errors[name] || errors.form) {
    setErrors(prev => ({ ...prev, [name]: '', form: '' }));
    }
};

const handleUniversitySelect = (university) => {
    setFormData(prev => ({
    ...prev,
    universityId: university.id,
    universityName: university.name
    }));
    // Clear university error when selection is made
    setErrors(prev => ({ ...prev, universityId: '' }));
};

const validateForm = () => {
    let valid = true;
    const newErrors = {
        fullName: '',
        email: '',
        contact: '',
        title: '',
        nationality: '',
        universityId: '',
        password: '',
        passwordMatch: '',
        form: '',
        userExists: ''
    };

    // Check all required fields
    if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
        valid = false;
    }

    if (!formData.contact.trim()) {
        newErrors.contact = 'Contact number is required';
        valid = false;
    } else if (!CONTACT_REGEX.test(formData.contact)) {
        newErrors.contact = 'Contact number must be exactly 10 digits';
        valid = false;
    }

    if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
        valid = false;
    }

    if (!formData.nationality.trim()) {
        newErrors.nationality = 'Nationality is required';
        valid = false;
    }

    if (!formData.universityId || (formData.universityId === '0000' && !formData.universityName.trim())) {
        newErrors.universityId = 'University selection is required';
        valid = false;
    }

    if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        valid = false;
    } else if (!EMAIL_REGEX.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        valid = false;
    }

    if (!formData.password) {
        newErrors.password = 'Password is required';
        valid = false;
    } else if (!PASSWORD_REGEX.test(formData.password)) {
        newErrors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
        valid = false;
    }

    if (!formData.passwordRetype) {
        newErrors.passwordMatch = 'Please confirm your password';
        valid = false;
    } else if (formData.password !== formData.passwordRetype) {
        newErrors.passwordMatch = 'Passwords do not match';
        valid = false;
    }

    if (!valid) {
        newErrors.form = 'Please fix all validation errors before submitting';
    }

    setErrors(newErrors);
    return valid;
};

const resetForm = () => {
    setFormData({
    fullName: '',
    email: '',
    contact: '',
    title: '',
    nationality: '',
    universityId: '',
    universityName: '',
    typedUniversity: '',
    password: '',
    passwordRetype: ''
    });
    setActiveStep(0);
    setErrors({
        fullName: '',
        email: '',
        contact: '',
        title: '',
        nationality: '',
        universityId: '',
        password: '',
        passwordMatch: '',
        form: '',
        userExists: ''
    });
};

const handleNextStep = () => {
    if (validateCurrentStep()) {
        setActiveStep(prev => Math.min(prev + 1, 2));
    } else {
        showToast("Validation Error", "Please complete all fields in the current step correctly", "warning");
    }
};

const handlePreviousStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
};

const handleSubmit = async () => {
    
    if (!validateForm()) {
        showToast("Validation Error", "Please fix all validation errors before submitting", "error");
        return;
    }

    setIsSubmitting(true);

    try {
        const formDataToSend = new FormData();
        formDataToSend.append('fullName', formData.fullName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('university', formData.universityId);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('contact', formData.contact);
        formDataToSend.append('nationality', formData.nationality);

        let postRequest;
        if (postStatus === "ADD") {
            postRequest = await axios.post(APIResearcherStore, formDataToSend, { headers });
        }

        const response = postRequest.data;
        if (response.status === "success") {
            resetForm();
            showToast("Success", response.message, "success");
            showToast("Email Alert","We have sent a link on you email....check it out", "warning");
            setTimeout(() => navigate('/'), 5000);
        } else {
            showToast("Error", "Unknown Server Error, Account Not Created", "error");
        }
    } catch (error) {
        if (error.response) {
            if (error.response.status === 422) {
                const errors = error.response.data.errors;
                let errorMessages = [];
                for (const field in errors) {
                    errorMessages.push(...errors[field]);
                }
                showToast("Validation Error", errorMessages.join("\n"), "error");
            } else if (error.response.status === 409) {
                showToast("Error", "Email already registered. Please use a different email or login.", "error");
                setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
            } else {
                showToast("Error", error.response.data.message || "An error occurred", "error");
            }
        } else if (error.code === "ERR_NETWORK") {
            showToast("Connection Error", TEXT_CONNECTION_ERROR, "error");
        } else {
            showToast("Error", "An unexpected error occurred", "error");
        }
    } finally {
        setIsSubmitting(false);
    }
};

const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(universitySearch.toLowerCase())
);

const steps = ['Personal Info', 'Academic Details', 'Security'];

if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <Typography variant="h6" color="primary">
        Loading universities...
    </Typography>
    </Box>
);

return (
    <Container maxWidth="md" sx={{ py: 4 }}>
    <Zoom in={true}>
        <ModernCard elevation={0}>
        <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LogoImage src={logoIcone} alt="RIA Logo" />
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                fontSize: isMobile ? '1.8rem' : '2.125rem',
                background: 'linear-gradient(45deg, #1976d2, #00bcd4)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                fontWeight: 'bold',
                mt: 2
                }}
            >
                Join RIA Research Community
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
                Create your account to access research opportunities and collaborations
            </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
                <Step key={label}>
                <StepLabel>{label}</StepLabel>
                </Step>
            ))}
            </Stepper>

            {error && (
            <Alert severity="error" sx={{ mb: 3 }} icon={<Cancel />}>
                <Typography variant="subtitle1">Error: {error}</Typography>
            </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button 
                variant="outlined" 
                color="primary"
                onClick={() => setShowWhyModal(true)}
                startIcon={<Groups />}
                size={isMobile ? 'small' : 'medium'}
            >
                Why Join?
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep > 0 && (
                <Button 
                    variant="outlined"
                    onClick={handlePreviousStep}
                    startIcon={<ArrowBack />}
                >
                    Back
                </Button>
                )}
                {activeStep < 2 && (
                <Button 
                    variant="contained"
                    onClick={handleNextStep}
                    disabled={!stepValidations[activeStep]}
                >
                    Next
                </Button>
                )}
            </Box>
            </Box>

            <Box component="div">
            <Fade in={activeStep === 0} timeout={500}>
                <Box sx={{ display: activeStep === 0 ? 'grid' : 'none', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 3 }}>
                <TextField
                    name="fullName"
                    label="Full Name *"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <Person color="action" />
                        </InputAdornment>
                    ),
                    }}
                />

                <TextField
                    name="contact"
                    label="Contact *"
                    value={formData.contact}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!errors.contact}
                    helperText={errors.contact || "Must be exactly 10 digits"}
                    placeholder="1234567890"
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <Phone color="action" />
                        </InputAdornment>
                    ),
                    inputProps: {
                        maxLength: 10,
                        pattern: "[0-9]*",
                        inputMode: "numeric"
                    }
                    }}
                />

                <FormControl fullWidth error={!!errors.title}>
                    <InputLabel>Title *</InputLabel>
                    <Select
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    label="Title *"
                    >
                    <MenuItem value="">Select Title</MenuItem>
                    <MenuItem value="Dr">Dr</MenuItem>
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Sr">Sr</MenuItem>
                    <MenuItem value="Prof">Prof</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {errors.title && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, display: 'block' }}>
                        {errors.title}
                    </Typography>
                    )}
                </FormControl>

                <TextField
                    name="nationality"
                    label="Nationality *"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!errors.nationality}
                    helperText={errors.nationality}
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <Flag color="action" />
                        </InputAdornment>
                    ),
                    }}
                />
                </Box>
            </Fade>

            <Fade in={activeStep === 1} timeout={500}>
                <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
                <Box sx={{ mb: 3 }}>
                    <TextField
                    label="University / Institution *"
                    value={formData.universityName}
                    fullWidth
                    error={!!errors.universityId}
                    helperText={errors.universityId}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                        <InputAdornment position="start">
                            <School color="action" />
                        </InputAdornment>
                        ),
                        endAdornment: (
                        <Badge 
                            badgeContent={universities.length} 
                            color="primary"
                            sx={{ mr: 1 }}
                        />
                        )
                    }}
                    />
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowUniversityModal(true)}
                    sx={{ mt: 1 }}
                    fullWidth
                    startIcon={<School />}
                    size={isMobile ? 'medium' : 'large'}
                    >
                    Select University / Institution
                    </Button>
                </Box>

                <TextField
                    name="email"
                    label="Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <Email color="action" />
                        </InputAdornment>
                    ),
                    }}
                />
                <Paper
                    elevation={0}
                    sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 2,
                    marginTop: 3,
                    background: 'linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%)',
                    border: '1px solid',
                    borderColor: 'primary.100',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 4,
                        height: '100%',
                        backgroundColor: 'primary.main',
                    }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Email color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.dark', mb: 1 }}>
                        Verify Your Email to Get Started
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'error.main', lineHeight: 1.6 }}>
                        Check your inbox immediately after registration for a verification link. 
                        Your account will be activated once you click the link in the email.
                        </Typography>
                    </Box>
                    </Box>
                </Paper>
                </Box>
            </Fade>

            <Fade in={activeStep === 2} timeout={500}>
                <Box sx={{ display: activeStep === 2 ? 'grid' : 'none', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 3 }}>
                <Box>
                    <TextField
                    name="password"
                    label="Password *"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <Lock color="action" />
                        </InputAdornment>
                        ),
                        endAdornment: (
                        <InputAdornment position="end">
                            <Button
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ minWidth: 'auto', p: 1 }}
                            >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                            </Button>
                        </InputAdornment>
                        ),
                    }}
                    />
                    {formData.password && (
                    <>
                        <PasswordStrengthBar strength={passwordStrength} />
                        <Typography variant="caption" color="text.secondary">
                        Strength: {passwordStrength}
                        </Typography>
                    </>
                    )}
                </Box>

                <TextField
                    name="passwordRetype"
                    label="Confirm Password *"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.passwordRetype}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!errors.passwordMatch}
                    helperText={errors.passwordMatch}
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <Lock color="action" />
                        </InputAdornment>
                    ),
                    }}
                />
                </Box>
            </Fade>

            {errors.form && (
                <Box sx={{ mt: 2 }}>
                <Alert severity="error">{errors.form}</Alert>
                </Box>
            )}

            {activeStep === 2 && (
                <Slide direction="up" in={activeStep === 2} timeout={500}>
                <Box sx={{ mt: 3 }}>
                    <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting || !stepValidations[2]}
                    fullWidth
                    onClick={handleSubmit}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                    sx={{ 
                        py: 1.5, 
                        fontSize: '1.1rem',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                    >
                    {isSubmitting ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        Creating Your Account...
                        </Box>
                    ) : (
                        'Create Account'
                    )}
                    </Button>

                    {isSubmitting && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                        <LinearProgress
                        sx={{ 
                            height: 4,
                            borderRadius: 2,
                            '& .MuiLinearProgress-bar': {
                            animation: 'pulse 1.5s ease-in-out infinite'
                            }
                        }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        Setting up your research account...
                        </Typography>
                    </Box>
                    )}

                    <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/')}
                    startIcon={<Login />}
                    disabled={isSubmitting}
                    >
                    Already have an account? Sign In
                    </Button>
                </Box>
                </Slide>
            )}
            </Box>
        </CardContent>
        </ModernCard>
    </Zoom>

    {/* Why Register Modal */}
    <StyledModal open={showWhyModal} onClose={() => setShowWhyModal(false)}>
        <ModalContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Groups color="primary" />
            Why Join RIA?
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', color:'black', flexDirection: 'column', gap: 2 }}>
            <FeatureChip icon={<CheckCircle />} label="Access to all research features" />
            <FeatureChip icon={<CheckCircle />} label="Submit your research projects" />
            <FeatureChip icon={<CheckCircle />} label="Track your submissions in real-time" />
            <FeatureChip icon={<CheckCircle />} label="Receive important notifications" />
            <FeatureChip icon={<CheckCircle />} label="Collaborate with researchers" />
            <FeatureChip icon={<CheckCircle />} label="Access funding opportunities" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
            variant="contained" 
            onClick={() => setShowWhyModal(false)}
            startIcon={<DoneAll />}
            >
            Got It
            </Button>
        </Box>
        </ModalContent>
    </StyledModal>

    {/* University Selection Modal */}
    <StyledModal open={showUniversityModal} onClose={() => setShowUniversityModal(false)}>
        <ModalContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" />
            Select Your University
            <Badge 
            badgeContent={universities.length} 
            color="primary"
            sx={{ ml: 1 }}
            />
        </Typography>
        
        <Button
            variant="outlined"
            color="secondary"
            onClick={() => setShowUniversityNotListed(!showUniversityNotListed)}
            sx={{ mb: 2 }}
            startIcon={showUniversityNotListed ? <ArrowBack /> : <School />}
        >
            {showUniversityNotListed ? 'Back to List' : 'My University Not Listed'}
        </Button>

        {showUniversityNotListed ? (
            <TextField
            label="Type University Name"
            value={formData.typedUniversity}
            onChange={(e) => {
                setFormData(prev => ({
                ...prev,
                typedUniversity: e.target.value,
                universityName: e.target.value,
                universityId: '0000'
                }));
                setErrors(prev => ({ ...prev, universityId: '' }));
            }}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <School color="action" />
                </InputAdornment>
                ),
            }}
            />
        ) : (
            <>
            <TextField
                label="Search Universities"
                value={universitySearch}
                onChange={(e) => setUniversitySearch(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                    <Search color="action" />
                    </InputAdornment>
                ),
                }}
            />

            <UniversityList>
                {filteredUniversities.length > 0 ? (
                filteredUniversities.map((university, index) => (
                    <ListItem
                    key={university.id}
                    button
                    onClick={() => handleUniversitySelect(university)}
                    selected={formData.universityId === university.id}
                    >
                    <ListItemText 
                        primary={`${index + 1}. ${university.name}`}
                        primaryTypographyProps={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                    />
                    </ListItem>
                ))
                ) : (
                <ListItem>
                    <ListItemText primary="No universities found" />
                </ListItem>
                )}
            </UniversityList>
            </>
        )}

        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 3,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0
        }}>
            {formData.universityName && (
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" />
                Selected: <strong>{formData.universityName}</strong>
            </Typography>
            )}

            <Button
            variant="contained"
            onClick={() => setShowUniversityModal(false)}
            startIcon={<DoneAll />}
            fullWidth={isMobile}
            >
            Confirm Selection
            </Button>
        </Box>
        </ModalContent>
    </StyledModal>
    </Container>
);
};

export default Register;