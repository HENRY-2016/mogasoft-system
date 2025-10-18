import React, { useState, useEffect } from 'react';
import {
Box,
Button,
Container,
Divider,
Grid,
IconButton,
Menu,
MenuItem,
Paper,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
TablePagination,
TextField,
Typography,
useMediaQuery,
useTheme,
Badge,
Avatar,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Slide,
Fade,
Grow,
Zoom,
Select,
FormControl,
InputLabel,
Chip,
Alert
} from '@mui/material';
import {
Menu as MenuIcon,
Close as CloseIcon,
Add as AddIcon,
Search as SearchIcon,
FilterList as FilterIcon,
Refresh as RefreshIcon,
Autorenew as RenewalIcon,
MoreVert as MoreIcon,
Edit as EditIcon,
Delete as DeleteIcon,
Visibility as ViewIcon,
ArrowBack as BackIcon,
ArrowForward as ForwardIcon,
Today as TodayIcon,
DateRange as DateRangeIcon,
CalendarToday as CalendarIcon,
Male as MaleIcon,
Female as FemaleIcon,
Email as EmailIcon,
Business as BusinessIcon,
Receipt as ReceiptIcon,
Person as PersonIcon,
Phone as PhoneIcon,
LocationOn as LocationIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import useCustomToast from '../hooks/useToast';
import { TEXT_CONNECTION_ERROR } from '../utilities/Text';
import { formatCreatedAtDate,formatNumberWithComma } from '../utilities/Functions';
import CustomerDetails from './CustomerDetails';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../utilities/Permission';
import { customerService } from '../services/customerService';

const Customer = () => {
    const [actionType, setActionType] = useState('ADD'); // ADD, EDIT, DELETE, VIEW
    const [updateId, setUpdateId] = useState('');
    const theme = useTheme();
    const showToast = useCustomToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState("LISTING");
    const [clientNumberId, setClientNumberId] = useState("");
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State for table data and pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        name: '', email: '', phone: '', company_name: '', tax_number: ''
    });
    const [errors, setErrors] = useState({
        email: false,
        phone: false
    });

    // State for dialogs
    const [openOptions, setOpenOptions] = useState(false);
    const [openActionDialog, setOpenActionDialog] = useState(false);
    const [pageState, setPageState] = useState({
        pageData:[],
        systemUsers:[],
    });

    // Form state - Updated to match new customer structure
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        company_name: '',
        tax_number: ''
    });

    // Selected customer state
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Permissions
    const [userRole, setUserRole] = useState('');
    
    useEffect(() => {
        const getUserRole = () => {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                return userInfo?.role || '';
            } catch (error) {
                console.error('Error getting user role:', error);
                return '';
            }
        };
        const role = getUserRole();
        setUserRole(role);
    }, []);

    // Helper function
    const hasPermission = (permission) => {
        return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
    };

    useEffect(() => {
        // Set toast function for customer service
        customerService.setToastFunction(showToast);
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await customerService.getCustomers();
            if (result && result.success) {
                setPageState(prev => ({
                    ...prev,
                    pageData: result.data.data || [],
                }));
            } else {
                setError(result?.message || 'Failed to fetch customers');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setError('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    // Filter customers based on search term and filters
    const filteredCustomers = pageState.pageData.filter(customer => {
        // Search term filter (matches name, email, phone, company name, or tax number)
        const matchesSearch = searchTerm === '' || 
            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.tax_number?.toLowerCase().includes(searchTerm.toLowerCase());

        // Individual field filters
        const matchesName = !filters.name || 
            customer.name?.toLowerCase().includes(filters.name.toLowerCase());

        const matchesEmail = !filters.email || 
            customer.email?.toLowerCase().includes(filters.email.toLowerCase());

        const matchesPhone = !filters.phone || 
            customer.phone?.toLowerCase().includes(filters.phone.toLowerCase());

        const matchesCompany = !filters.company_name || 
            customer.company_name?.toLowerCase().includes(filters.company_name.toLowerCase());

        const matchesTaxNumber = !filters.tax_number || 
            customer.tax_number?.toLowerCase().includes(filters.tax_number.toLowerCase());

        return matchesSearch && matchesName && matchesEmail && 
            matchesPhone && matchesCompany && matchesTaxNumber;
    });

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Dialog handlers
    const handleOpenOptions = () => setOpenOptions(true);
    const handleCloseOptions = () => setOpenOptions(false);

    const handleOpenActionDialog = (type, customer = null) => {
        setActionType(type);
        if (customer) {
            setSelectedCustomer(customer);
            setUpdateId(customer.id);
            if (type === 'EDIT') {
                setFormData({
                    name: customer.name || '',
                    email: customer.email || '',
                    phone: customer.phone || '',
                    address: customer.address || '',
                    company_name: customer.company_name || '',
                    tax_number: customer.tax_number || ''
                });
            }
        } else {
            // Reset form for ADD
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                company_name: '',
                tax_number: ''
            });
        }
        setOpenActionDialog(true);
    };

    const handleCloseActionDialog = () => {
        setOpenActionDialog(false);
        setSelectedCustomer(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            company_name: '',
            tax_number: ''
        });
    };

    const handleDetailsNavigation = (customer) => {
        setClientNumberId(customer.id);
        setCurrentView("DETAILS");
    };

    const handleBack = () => {
        fetchCustomers();
        setCurrentView("LISTING");
    };

    // Menu handlers
    const handleMenuClick = (event, customer) => {
        setAnchorEl(event.currentTarget);
        setSelectedCustomer(customer);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Form handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Reset error for this field
        setErrors(prev => ({
            ...prev,
            [name]: false
        }));
        
        // Field-specific validation
        if (name === 'email') {
            // Basic email validation
            if (value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    [name]: true
                }));
                showToast("Validation Error", "Please enter a valid email address", "error");
                return;
            }
        } else if (name === 'phone') {
            // Allow numbers, spaces, and common phone characters
            if (value === '' || /^[0-9+\-\s()]*$/.test(value)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    [name]: true
                }));
                showToast("Validation Error", "Please enter a valid phone number", "error");
                return;
            }
        } else {
            // For other fields
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Filter handlers
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            name: '',
            email: '',
            phone: '',
            company_name: '',
            tax_number: ''
        });
        setSearchTerm('');
        handleCloseOptions();
    };

    const validateForm = () => {
        const errors = [];
        if (!formData.name.trim()) errors.push('Name is required');
        if (!formData.email.trim()) errors.push('Email is required');
        if (!formData.phone.trim()) errors.push('Phone is required');
        
        // Email format validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (errors.length > 0) {
            showToast("Validation Error", errors.join('\n'), "warning");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Prevent multiple submissions
        if (loading) return;
        if (actionType !== 'DELETE' && !validateForm()) return;
        try {
            setLoading(true);
            let result;

            switch (actionType) {
                case 'ADD':
                    result = await customerService.createCustomer(formData);
                    break;
                case 'EDIT':
                    result = await customerService.updateCustomer(updateId, formData);
                    break;
                case 'DELETE':
                    result = await customerService.deleteCustomer(updateId);
                    break;
                default:
                    throw new Error('Invalid action type');
            }

            if (result && result.success) {
                handleCloseActionDialog();
                await fetchCustomers(); // Wait for refresh to complete
                const successMessage =
                    actionType === 'ADD' ? 'Customer created successfully!' :
                    actionType === 'EDIT' ? 'Customer updated successfully!' :
                    'Customer deleted successfully!';
                showToast("Success", successMessage, "success");
            } else {
                showToast("Error", result?.message || "Operation failed", "error");
            }
        } catch (error) {
            console.error('Error performing customer operation:', error);
            if (error.code === "ERR_NETWORK") {
                showToast("Connection Error", TEXT_CONNECTION_ERROR, "error");
            } else {
                showToast("Error", "An unexpected error occurred", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit1 = async (e) => {
        e.preventDefault();
        if (actionType !== 'DELETE' && !validateForm()) return;
        try {
            setLoading(true);
            let result;

            switch (actionType) {
                case 'ADD':
                    result = await customerService.createCustomer(formData);
                    break;
                case 'EDIT':
                    result = await customerService.updateCustomer(updateId, formData);
                    break;
                case 'DELETE':
                    result = await customerService.deleteCustomer(updateId);
                    break;
                default:
                    throw new Error('Invalid action type');
            }

            if (result && result.success) {
                handleCloseActionDialog();
                fetchCustomers(); // Refresh the list
                const successMessage =
                    actionType === 'ADD' ? 'Customer created successfully!' :
                    actionType === 'EDIT' ? 'Customer updated successfully!' :
                    'Customer deleted successfully!';
                showToast("Success", successMessage, "success");
            } else {
                showToast("Error", result?.message || "Operation failed", "error");
            }
        } catch (error) {
            console.error('Error performing customer operation:', error);
            if (error.code === "ERR_NETWORK") {
                showToast("Connection Error", TEXT_CONNECTION_ERROR, "error");
            } else {
                showToast("Error", "An unexpected error occurred", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    // Get dialog title based on action type
    const getDialogTitle = () => {
        switch (actionType) {
            case 'ADD':
                return 'Add New Customer';
            case 'EDIT':
                return 'Edit Customer';
            case 'DELETE':
                return 'Delete Customer';
            case 'VIEW':
                return 'Customer Details';
            default:
                return 'Customer';
        }
    };

    // Get dialog content based on action type
    const renderDialogContent = () => {
        switch (actionType) {
            case 'VIEW':
                return (
                    <Box sx={{ p: 2 }}>
                        {selectedCustomer && (
                            <Grid container spacing={2}>
                                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <PersonIcon />
                                    </Avatar>
                                    <Typography variant="h6">{selectedCustomer.name}</Typography>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <EmailIcon color="action" />
                                        <Typography variant="body2"><strong>Email:</strong></Typography>
                                    </Box>
                                    <Typography variant="body1">{selectedCustomer.email}</Typography>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <PhoneIcon color="action" />
                                        <Typography variant="body2"><strong>Phone:</strong></Typography>
                                    </Box>
                                    <Typography variant="body1">{selectedCustomer.phone}</Typography>
                                </Grid>
                                
                                {selectedCustomer.address && (
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <LocationIcon color="action" />
                                            <Typography variant="body2"><strong>Address:</strong></Typography>
                                        </Box>
                                        <Typography variant="body1">{selectedCustomer.address}</Typography>
                                    </Grid>
                                )}
                                
                                {selectedCustomer.company_name && (
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <BusinessIcon color="action" />
                                            <Typography variant="body2"><strong>Company:</strong></Typography>
                                        </Box>
                                        <Typography variant="body1">{selectedCustomer.company_name}</Typography>
                                    </Grid>
                                )}
                                
                                {selectedCustomer.tax_number && (
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <ReceiptIcon color="action" />
                                            <Typography variant="body2"><strong>Tax Number:</strong></Typography>
                                        </Box>
                                        <Typography variant="body1">{selectedCustomer.tax_number}</Typography>
                                    </Grid>
                                )}
                                
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <CalendarIcon color="action" />
                                        <Typography variant="body2"><strong>Created:</strong></Typography>
                                    </Box>
                                    <Typography variant="body1">
                                        {formatCreatedAtDate(selectedCustomer.created_at)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                );

            case 'DELETE':
                return (
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Are you sure you want to delete this customer?
                        </Alert>
                        {selectedCustomer && (
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {selectedCustomer.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedCustomer.email}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedCustomer.phone}
                                </Typography>
                                {selectedCustomer.company_name && (
                                    <Typography variant="body2" color="text.secondary">
                                        Company: {selectedCustomer.company_name}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                );

            case 'ADD':
            case 'EDIT':
            default:
                return (
                    <Box component="form" onSubmit={handleSubmit} id="customer-form" sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Full Name *"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    InputProps={{
                                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                                    }}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email *"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    error={errors.email}
                                    helperText={errors.email ? "Please enter a valid email" : ""}
                                    required
                                    InputProps={{
                                        startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                                    }}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone *"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    error={errors.phone}
                                    helperText={errors.phone ? "Please enter a valid phone number" : ""}
                                    required
                                    InputProps={{
                                        startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                                    }}
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={2}
                                    InputProps={{
                                        startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                                    }}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <BusinessIcon color="action" sx={{ mr: 1 }} />,
                                    }}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Tax Number"
                                    name="tax_number"
                                    value={formData.tax_number}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <ReceiptIcon color="action" sx={{ mr: 1 }} />,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );
        }
    };

    // Get dialog actions based on action type
    const renderDialogActions = () => {
        switch (actionType) {
            case 'VIEW':
                return (
                    <DialogActions>
                        <Button onClick={handleCloseActionDialog} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                );

            case 'DELETE':
                return (
                    <DialogActions>
                        <Button onClick={handleCloseActionDialog} color="primary">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            color="error" 
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete Customer'}
                        </Button>
                    </DialogActions>
                );

            case 'ADD':
            case 'EDIT':
            default:
                return (
                    <DialogActions>
                        <Button onClick={handleCloseActionDialog} color="primary">
                            Cancel
                        </Button>
                        <Button
                            type="submit" 
                            color="primary"
                            form="customer-form" // Connect to the form
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (actionType === 'ADD' ? 'Add Customer' : 'Update Customer')}
                        </Button>
                    </DialogActions>
                );
        }
    };

    if (loading && pageState.pageData.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>Loading customers...</Typography>
            </Box>
        );
    }

    if (error && pageState.pageData.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button onClick={fetchCustomers} variant="contained">
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <>
            {currentView === "LISTING" && (
                <Box sx={{ marginTop: 5, flexGrow: 1, p: isMobile ? 1 : 3 }}>
                    {/* Header Section */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 2 : 0
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Badge badgeContent={formatNumberWithComma(pageState.pageData.length)} max={9999} color="success">
                                <Typography variant="subtitle1">Total Customers</Typography>
                            </Badge>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<FilterIcon />}
                                onClick={handleOpenOptions}
                                sx={{ 
                                    textTransform: 'none',
                                    borderRadius: '8px'
                                }}
                            >
                                View Options
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenActionDialog('ADD')}
                                sx={{ 
                                    textTransform: 'none',
                                    borderRadius: '8px'
                                }}
                            >
                                Add Customer
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchCustomers}
                                sx={{ 
                                    textTransform: 'none',
                                    borderRadius: '8px'
                                }}
                            >
                                Refresh
                            </Button>
                        </Box>
                    </Box>

                    {/* Search Bar */}
                    <Box sx={{ mb: 3 }}>
                        <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search customers by name, email, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                                    sx: { border: 'none', '& fieldset': { border: 'none' } }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px'
                                    }
                                }}
                            />
                        </Paper>
                    </Box>

                    {/* Active Filters Display */}
                    {(filters.name || filters.email || filters.phone || filters.company_name || filters.tax_number) && (
                        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {filters.name && (
                                <Chip 
                                    label={`Name: ${filters.name}`}
                                    onDelete={() => setFilters(prev => ({ ...prev, name: '' }))}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {filters.email && (
                                <Chip 
                                    label={`Email: ${filters.email}`}
                                    onDelete={() => setFilters(prev => ({ ...prev, email: '' }))}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {filters.phone && (
                                <Chip 
                                    label={`Phone: ${filters.phone}`}
                                    onDelete={() => setFilters(prev => ({ ...prev, phone: '' }))}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {filters.company_name && (
                                <Chip 
                                    label={`Company: ${filters.company_name}`}
                                    onDelete={() => setFilters(prev => ({ ...prev, company_name: '' }))}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {filters.tax_number && (
                                <Chip 
                                    label={`Tax Number: ${filters.tax_number}`}
                                    onDelete={() => setFilters(prev => ({ ...prev, tax_number: '' }))}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            <Button 
                                size="small" 
                                onClick={clearFilters}
                                startIcon={<CloseIcon />}
                                sx={{ ml: 1 }}
                            >
                                Clear All
                            </Button>
                        </Box>
                    )}

                    {/* Customers Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: theme.shadows[3] }}>
                            <Table sx={{ minWidth: 650 }} aria-label="Customers table">
                                <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>No</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tax Number</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCustomers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {searchTerm || Object.values(filters).some(f => f) 
                                                        ? 'No customers match your search criteria' 
                                                        : 'No customers found'
                                                    }
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCustomers
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((customer, index) => (
                                                <TableRow
                                                    key={customer.id}
                                                    hover
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                                                {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight="bold">
                                                                    {customer.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {customer.email}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                                {customer.phone}
                                                            </Typography>
                                                            {customer.address && (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                                    {customer.address}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        {customer.company_name ? (
                                                            <Chip 
                                                                label={customer.company_name}
                                                                color="primary"
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                -
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {customer.tax_number ? (
                                                            <Chip 
                                                                label={customer.tax_number}
                                                                color="secondary"
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                -
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCreatedAtDate(customer.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            aria-label="more"
                                                            aria-controls="long-menu"
                                                            aria-haspopup="true"
                                                            onClick={(e) => handleMenuClick(e, customer)}
                                                        >
                                                            <MoreIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredCustomers.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{ mt: 2 }}
                        />
                    </motion.div>

                    {/* Options Dialog */}
                    <Dialog
                        open={openOptions}
                        onClose={handleCloseOptions}
                        TransitionComponent={Transition}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle sx={{ textAlign: 'center' }}>Filter Options</DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<RefreshIcon />}
                                    onClick={clearFilters}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Show All Customers
                                </Button>
                                
                                <Divider>Filter by Field</Divider>
                                
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                />

                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={filters.email}
                                    onChange={handleFilterChange}
                                />

                                <TextField
                                    fullWidth
                                    label="Phone"
                                    name="phone"
                                    value={filters.phone}
                                    onChange={handleFilterChange}
                                />

                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    name="company_name"
                                    value={filters.company_name}
                                    onChange={handleFilterChange}
                                />

                                <TextField
                                    fullWidth
                                    label="Tax Number"
                                    name="tax_number"
                                    value={filters.tax_number}
                                    onChange={handleFilterChange}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseOptions} color="error">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCloseOptions}
                                color="primary"
                                variant="contained"
                            >
                                Apply Filters
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Universal Action Dialog */}
                    <Dialog
                        open={openActionDialog}
                        onClose={handleCloseActionDialog}
                        TransitionComponent={Transition}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle sx={{ textAlign: 'center' }}>
                            {getDialogTitle()}
                        </DialogTitle>
                        <DialogContent>
                            {renderDialogContent()}
                        </DialogContent>
                        {renderDialogActions()}
                    </Dialog>

                    {/* Actions Menu */}
                    <Menu
                        id="long-menu"
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleMenuClose}
                        PaperProps={{
                            style: {
                                width: '200px',
                            },
                        }}
                        TransitionComponent={Fade}
                    >
                        <MenuItem onClick={() => {
                            handleOpenActionDialog('VIEW', selectedCustomer);
                            handleMenuClose();
                        }}>
                            <ViewIcon sx={{ mr: 1 }} /> View
                        </MenuItem>
                        {/* {hasPermission(PERMISSIONS.EDIT) && ( )}*/}
                            <MenuItem onClick={() => {
                                handleOpenActionDialog('EDIT', selectedCustomer);
                                handleMenuClose();
                            }}>
                                <EditIcon sx={{ mr: 1 }} /> Edit
                            </MenuItem>
                        <MenuItem onClick={() => {
                            handleDetailsNavigation(selectedCustomer);
                            handleMenuClose();
                        }}>
                            <ViewIcon sx={{ mr: 1 }} /> Details
                        </MenuItem>
                        {/* {hasPermission(PERMISSIONS.DELETE) && ()} */}
                            <MenuItem onClick={() => {
                                handleOpenActionDialog('DELETE', selectedCustomer);
                                handleMenuClose();
                            }} sx={{ color: theme.palette.error.main }}>
                                <DeleteIcon sx={{ mr: 1 }} /> Delete
                            </MenuItem>
                    </Menu>
                </Box>
            )}

            {currentView === "DETAILS" && (
                <CustomerDetails
                    customerId={clientNumberId} 
                    onBack={handleBack}
                />
            )}
        </>
    );
};

export default Customer;

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});