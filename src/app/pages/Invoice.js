// Invoice.js - Fixed Version
import React, { useState, useEffect } from 'react';
import {
Container,
Paper,
Grid,
TextField,
Button,
Typography,
Card,
CardContent,
CardActions,
IconButton,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
AppBar,
Toolbar,
Box,
Divider,
Chip,
Alert,
Snackbar,
InputAdornment,
Avatar,
List,
ListItem,
ListItemIcon,
ListItemText,
Stepper,
Step,
StepLabel,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
LinearProgress,
FormControl,
InputLabel,
Select,
MenuItem,
Tab,
Tabs
} from '@mui/material';
import {
Add as AddIcon,
Delete as DeleteIcon,
PictureAsPdf as PdfIcon,
Email as EmailIcon,
Phone as PhoneIcon,
Language as LanguageIcon,
LocationOn as LocationIcon,
Save as SaveIcon,
Receipt as ReceiptIcon,
Person as PersonIcon,
Description as DescriptionIcon,
AttachMoney as MoneyIcon,
ShoppingCart as CartIcon,
Business as BusinessIcon,
CalendarToday as DateIcon,
LocalOffer as DiscountIcon,
Payment as PaymentIcon,
CheckCircle as CheckCircleIcon,
CloudUpload as CloudUploadIcon,
Visibility as VisibilityIcon,
Refresh as RefreshIcon,
Search as SearchIcon,
Print,
Edit as EditIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { MogasoftLog } from '../assests';
import useCustomToast from '../hooks/useToast';
import { companyInfo } from '../utilities/data';
import { invoiceService } from '../services/invoiceService';
import { customerService } from '../services/customerService';
import { generatePDF} from '../utilities/invoiceFunctions';
import { formatNumberWithComma } from '../utilities/Functions';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
color: 'white',
marginBottom: theme.spacing(3),
borderRadius: theme.spacing(2),
boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const InvoicePreviewPaper = styled(Paper)(({ theme }) => ({
padding: theme.spacing(4),
background: 'white',
border: '2px solid',
borderColor: theme.palette.divider,
minHeight: 400,
borderRadius: theme.spacing(2),
boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
margin: theme.spacing(0.5),
borderRadius: theme.spacing(1),
textTransform: 'none',
fontWeight: 600,
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
backgroundColor: 
    status === 'paid' ? theme.palette.success.main :
    status === 'pending' ? theme.palette.warning.main :
    status === 'overdue' ? theme.palette.error.main :
    theme.palette.grey[500],
color: 'white',
fontWeight: 'bold',
}));

const steps = ['Customer Selection', 'Items & Services', 'Review & Save'];


const Invoice = () => {
    const showToast = useCustomToast();
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [currentInvoice, setCurrentInvoice] = useState({
        customer_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
        { id: 1, description: '', quantity: 1, price: 0, amount: 0 }
        ],
        tax_rate: 18,
        discount: 0,
        status: 'pending'
    });
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [saveError, setSaveError] = useState(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);
    const [viewingInvoice, setViewingInvoice] = useState(null);

    // Set toast functions for services
    useEffect(() => {
        invoiceService.setToastFunction(showToast);
        customerService.setToastFunction(showToast);
        fetchInvoices();
        fetchCustomers();
    }, []);

    const fetchInvoices = async () => {
        try {
        setLoading(true);
        const result = await invoiceService.getInvoices();
        if (result.success) {
            setInvoices(result.data.data || []);
        }
        } catch (error) {
        console.error('Error fetching invoices:', error);
        showToast('Error', 'Failed to fetch invoices', 'error');
        } finally {
        setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
        const result = await customerService.getCustomers();
        if (result.success) {
            setCustomers(result.data.data || []);
        }
        } catch (error) {
        console.error('Error fetching customers:', error);
        showToast('Error', 'Failed to fetch customers', 'error');
        }
    };


    const validateStep = (step) => {
        switch (step) {
            case 0:
                if (!currentInvoice.customer_id) {
                    showToast('Validation Error', 'Please select a customer', 'error');
                    return false;
                }
                if (!currentInvoice.invoice_date) {
                    showToast('Validation Error', 'Please select an invoice date', 'error');
                    return false;
                }
                return true;
            case 1:
                const emptyDescriptions = currentInvoice.items.some(item => !item.description.trim());
                const invalidPrices = currentInvoice.items.some(item => item.price <= 0);
                const invalidQuantities = currentInvoice.items.some(item => item.quantity <= 0);
                if (emptyDescriptions) {
                    showToast('Validation Error', 'All items must have a description', 'error');
                    return false;
                }
                if (invalidPrices) {
                    showToast('Validation Error', 'All items must have a valid price greater than 0', 'error');
                    return false;
                }
                if (invalidQuantities) {
                    showToast('Validation Error', 'All items must have a valid quantity greater than 0', 'error');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };
    const handleNext = () => {
        if (validateStep(activeStep)) {
        setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        const customer = customers.find(c => c.id === customerId);
        setCurrentInvoice(prev => ({
        ...prev,
        customer_id: customerId
        }));
        setSelectedCustomer(customer);
    };

    const handleInvoiceChange = (e) => {
        const { name, value } = e.target;
        setCurrentInvoice(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleItemChange1 = (index, field, value) => {
        const updatedItems = [...currentInvoice.items];
        updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
        };

        if (field === 'quantity' || field === 'price') {
        updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].price;
        }

        setCurrentInvoice(prev => ({
        ...prev,
        items: updatedItems
        }));
    };
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...currentInvoice.items];
        // Convert to number for quantity and price fields
        const processedValue = (field === 'quantity' || field === 'price') ? 
            parseFloat(value) || 0 : value;
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: processedValue
        };

        // Recalculate amount if quantity or price changes
        if (field === 'quantity' || field === 'price') {
            updatedItems[index].amount = Number(updatedItems[index].quantity) * Number(updatedItems[index].price);
        }

        setCurrentInvoice(prev => ({
            ...prev,
            items: updatedItems,
            // Clear the saved values when items change to force recalculation
            subtotal: undefined,
            tax_amount: undefined,
            total: undefined
        }));
    };

    const addItem = () => {
        setCurrentInvoice(prev => ({
        ...prev,
        items: [
            ...prev.items,
            { id: Date.now() + Math.random(), description: '', quantity: 1, price: 0, amount: 0 }
        ]
        }));
    };

    const removeItem = (index) => {
        if (currentInvoice.items.length > 1) {
        const updatedItems = currentInvoice.items.filter((_, i) => i !== index);
        setCurrentInvoice(prev => ({
            ...prev,
            items: updatedItems
        }));
        } else {
        showToast('Warning', 'At least one item is required', 'warning');
        }
    };

    const calculateSubtotal = () => {
        // If we're editing and have saved subtotal, use it as fallback
        if (isEditing && currentInvoice.subtotal) {
            return Number(currentInvoice.subtotal);
        }

        const subtotal = currentInvoice.items.reduce((sum, item) => {
            return sum + (Number(item.quantity) * Number(item.price));
        }, 0);
        return Number(subtotal.toFixed(2));
    };

    const calculateTax = () => {
        // If we're editing and have saved tax_amount, use it as fallback
        if (isEditing && currentInvoice.tax_amount) {
            return Number(currentInvoice.tax_amount);
        }
        const subtotal = calculateSubtotal();
        const discount = Number(currentInvoice.discount) || 0;
        const taxableAmount = subtotal - discount;
        const taxRate = Number(currentInvoice.tax_rate) || 0;
        const taxAmount = (taxableAmount * taxRate) / 100;
        return Number(taxAmount.toFixed(2));
    };


    const calculateTotal = () => {
        // If we're editing and have saved total, use it as fallback
        if (isEditing && currentInvoice.total) {
            return Number(currentInvoice.total);
        }
        const subtotal = calculateSubtotal();
        const discount = Number(currentInvoice.discount) || 0;
        const taxAmount = calculateTax();
        const total = subtotal - discount + taxAmount;
        return Number(total.toFixed(2));
    };
    const handleInvoiceView = (invoiceId) => {
        const invoiceToView = invoices.find(inv => inv.id === invoiceId);
        if (!invoiceToView) {
            showToast('Error', 'Invoice not found', 'error');
            return;
        }

        const customer = customers.find(c => c.id === invoiceToView.customer_id);

        // Set the viewing invoice data
        setViewingInvoice(invoiceToView);
        setSelectedCustomer(customer);
        setPreviewOpen(true);
        };


        const handleInvoiceEdit = (invoiceId) => {
            const invoiceToEdit = invoices.find(inv => inv.id === invoiceId);
            if (!invoiceToEdit) {
                showToast('Error', 'Invoice not found', 'error');
                return;
            }

            const customer = customers.find(c => c.id === invoiceToEdit.customer_id);
            // Convert all numeric values to ensure they're numbers
            const editedInvoice = {
                customer_id: invoiceToEdit.customer_id,
                invoice_date: invoiceToEdit.invoice_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                items: (invoiceToEdit.items || []).map(item => ({
                    id: item.id || Date.now() + Math.random(),
                    description: item.description || '',
                    quantity: Number(item.quantity) || 1,
                    price: Number(item.price) || 0,
                    amount: Number(item.amount) || 0
                })),
                tax_rate: Number(invoiceToEdit.tax_rate) || 18,
                discount: Number(invoiceToEdit.discount) || 0,
                status: invoiceToEdit.status || 'pending',
                // Include the actual saved values for calculations
                subtotal: Number(invoiceToEdit.subtotal) || 0,
                tax_amount: Number(invoiceToEdit.tax_amount) || 0,
                total: Number(invoiceToEdit.total) || 0
            };

            console.log('Editing invoice data:', editedInvoice);

            setCurrentInvoice(editedInvoice);
            setSelectedCustomer(customer);
            setIsEditing(true);
            setEditingInvoiceId(invoiceId);
            setActiveStep(0);
            setTabValue(0);
            showToast('Edit Mode', 'You can now edit the invoice', 'info');
        };

    const handleInvoiceDelete = (invoiceId) => {
        const invoiceToDelete = invoices.find(inv => inv.id === invoiceId);
        if (!invoiceToDelete) {
            showToast('Error', 'Invoice not found', 'error');
            return;
        }

        setInvoiceToDelete(invoiceToDelete);
        setDeleteConfirmOpen(true);
        };

        const confirmDelete = async () => {
        if (!invoiceToDelete) return;

        try {
            setLoading(true);
            const result = await invoiceService.deleteInvoice(invoiceToDelete.id);

            if (result && result.success) {
            setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
            showToast('Success', 'Invoice deleted successfully', 'success');
            } else {
            showToast('Error', 'Failed to delete invoice', 'error');
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            showToast('Error', 'Error deleting invoice', 'error');
        } finally {
            setLoading(false);
            setDeleteConfirmOpen(false);
            setInvoiceToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmOpen(false);
        setInvoiceToDelete(null);
    };

    const handleSubmit = async (action) => {
        // Validate all steps
        if (!validateStep(0) || !validateStep(1)) {
            showToast('Validation Error', 'Validation failed', 'error');
            return;
        }

        try {
            setLoading(true);
            setSaveError(null);

            // Use the calculated values, not the saved ones
            const subtotal = calculateSubtotal();
            const tax = calculateTax();
            const total = calculateTotal();

            // Convert all numeric values to proper numbers
            const invoiceData = {
                customer_id: currentInvoice.customer_id,
                invoice_date: currentInvoice.invoice_date,
                items: currentInvoice.items.map(item => ({
                    description: item.description,
                    quantity: Number(item.quantity) || 0,
                    price: Number(item.price) || 0,
                    amount: Number(item.amount) || 0
                })),
                subtotal: subtotal,
                tax_rate: Number(currentInvoice.tax_rate) || 0,
                tax_amount: tax,
                discount: Number(currentInvoice.discount) || 0,
                total: total,
                status: 'pending'
            };

            console.log('Final invoice data being sent:', invoiceData);
            console.log('Data types verification:', {
                subtotal: { value: invoiceData.subtotal, type: typeof invoiceData.subtotal },
                total: { value: invoiceData.total, type: typeof invoiceData.total },
                tax_amount: { value: invoiceData.tax_amount, type: typeof invoiceData.tax_amount }
            });

            const customer = customers.find(c => c.id === currentInvoice.customer_id);

            // Rest of your handleSubmit code remains the same...
            // Handle different actions
            switch (action) {
                case "PRINT":
                    // Print only - generate PDF without saving
                    generatePDF(invoiceData, customer, showToast);
                    showToast('Success', 'PDF generated successfully!', 'success');
                    break;

                case "SAVE":
                    // Save only - handle both create and update
                    let saveResult;
                    if (isEditing && editingInvoiceId) {
                        // Update existing invoice
                        saveResult = await invoiceService.updateInvoice(editingInvoiceId, invoiceData);
                    } else {
                        // Create new invoice
                        saveResult = await invoiceService.createInvoice(invoiceData);
                    }

                    console.log('Save result:', saveResult);
                    if (saveResult && saveResult.success) {
                        const message = isEditing ? 'Invoice updated successfully!' : 'Invoice saved successfully!';
                        showToast('Success', message, 'success');
                        const savedInvoice = saveResult.data.data;
                        if (isEditing) {
                            // Update the invoice in the list
                            setInvoices(prev => prev.map(inv =>
                                inv.id === editingInvoiceId ? savedInvoice : inv
                            ));
                        } else {
                            // Add new invoice to the list
                            setInvoices(prev => [...prev, savedInvoice]);
                        }
                        resetForm();
                    } else {
                        const errorMessage = saveResult?.message || 'Failed to save invoice';
                        setSaveError(errorMessage);
                        showToast('Error', errorMessage, 'error');

                        // Log validation errors if available
                        if (saveResult?.error?.errors) {
                            console.error('Validation errors:', saveResult.error.errors);
                        }
                    }
                    break;

                case "BOTH":
                    // Save and then print - handle both create and update
                    let bothResult;
                    if (isEditing && editingInvoiceId) {
                        bothResult = await invoiceService.updateInvoice(editingInvoiceId, invoiceData);
                    } else {
                        bothResult = await invoiceService.createInvoice(invoiceData);
                    }
                    if (bothResult && bothResult.success) {
                        const message = isEditing ? 'Invoice updated and PDF generated!' : 'Invoice saved and PDF generated!';
                        showToast('Success', message, 'success');
                        const savedInvoice = bothResult.data.data;
                        if (isEditing) {
                            setInvoices(prev => prev.map(inv =>
                                inv.id === editingInvoiceId ? savedInvoice : inv
                            ));
                        } else {
                            setInvoices(prev => [...prev, savedInvoice]);
                        }
                        // Generate PDF after successful save
                        if (customer) {
                            setTimeout(() => {
                                generatePDF(savedInvoice, customer, showToast);
                                // generatePDF(invoiceData, customer, showToast);
                            }, 500);
                        }
                        resetForm();
                    } else {
                        const errorMessage = bothResult?.message || 'Failed to save invoice';
                        setSaveError(errorMessage);
                        showToast('Error', errorMessage, 'error');
                        // Log validation errors if available
                        if (bothResult?.error?.errors) {
                            console.error('Validation errors:', bothResult.error.errors);
                        }
                    }
                    break;

                default:
                    showToast('Error', 'Invalid action', 'error');
                    break;
            }

        } catch (error) {
            console.error('Error processing invoice:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
            setSaveError(errorMessage);
            showToast('Error', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to reset form
    const resetForm = () => {
        setCurrentInvoice({
            customer_id: '',
            invoice_date: new Date().toISOString().split('T')[0],
            items: [
            { id: 1, description: '', quantity: 1, price: 0, amount: 0 }
            ],
            tax_rate: 18,
            discount: 0,
            status: 'pending'
        });
        setSelectedCustomer(null);
        setActiveStep(0);
        setIsEditing(false);
        setEditingInvoiceId(null);
        // Don't switch tabs when editing, only when creating new
        if (!isEditing) {
            setTabValue(1);
        }
    };

const renderStepContent = (step) => {
    switch (step) {
    case 0:
        return (
        <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            Select Customer
            </Typography>

            <Grid container spacing={2}>
            <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                <InputLabel>Select Customer *</InputLabel>
                <Select
                    name="customer_id"
                    value={currentInvoice.customer_id}
                    onChange={handleCustomerChange}
                    label="Select Customer *"
                >
                    {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                        </Avatar>
                        <Box>
                            <Typography variant="body1">{customer.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                            {customer.email} • {customer.phone}
                            </Typography>
                        </Box>
                        </Box>
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>
            </Grid>

            {selectedCustomer && (
                <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                    Selected Customer:
                    </Typography>
                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                        <strong>Name:</strong> {selectedCustomer.name}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                        <strong>Email:</strong> {selectedCustomer.email}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                        <strong>Phone:</strong> {selectedCustomer.phone}
                        </Typography>
                    </Grid>
                    {selectedCustomer.company_name && (
                        <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            <strong>Company:</strong> {selectedCustomer.company_name}
                        </Typography>
                        </Grid>
                    )}
                    </Grid>
                </Paper>
                </Grid>
            )}

            <Grid item xs={12} sm={6}>
                <TextField
                fullWidth
                label="Invoice Date"
                name="invoice_date"
                type="date"
                value={currentInvoice.invoice_date}
                onChange={handleInvoiceChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <DateIcon color="action" />
                    </InputAdornment>
                    ),
                }}
                />
            </Grid>
            </Grid>
        </Box>
        );

    case 1:
        return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CartIcon />
                Items & Services
            </Typography>
            <Button
                startIcon={<AddIcon />}
                onClick={addItem}
                variant="outlined"
                color="primary"
                size="small"
            >
                Add Item
            </Button>
            </Box>

            {currentInvoice.items.map((item, index) => (
            <Grid container spacing={1} key={item.id} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={5}>
                <TextField
                    fullWidth
                    label="Description *"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    size="small"
                    error={!item.description.trim()}
                    helperText={!item.description.trim() ? "Description is required" : ""}
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <DescriptionIcon color="action" fontSize="small" />
                        </InputAdornment>
                    ),
                    }}
                />
                </Grid>
                <Grid item xs={2}>
                <TextField
                    fullWidth
                    label="Qty *"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    size="small"
                    inputProps={{ min: 1 }}
                />
                </Grid>
                <Grid item xs={2}>
                <TextField
                    fullWidth
                    label="Price *"
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    size="small"
                    error={item.price <= 0}
                    helperText={item.price <= 0 ? "Price must be greater than 0" : ""}
                    InputProps={{
                    startAdornment: <InputAdornment position="start"></InputAdornment>,
                    }}
                />
                </Grid>
                <Grid item xs={2}>
                <TextField
                    fullWidth
                    label="Amount"
                    value={`${item.amount}`}
                    size="small"
                    InputProps={{ 
                    readOnly: true,
                    startAdornment: <InputAdornment position="start"></InputAdornment>,
                    }}
                />
                </Grid>
                <Grid item xs={1}>
                <IconButton
                    onClick={() => removeItem(index)}
                    color="error"
                    size="small"
                >
                    <DeleteIcon />
                </IconButton>
                </Grid>
            </Grid>
            ))}

            <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
                <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                name="tax_rate"
                value={currentInvoice.tax_rate}
                onChange={handleInvoiceChange}
                variant="outlined"
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <MoneyIcon color="action" />
                    </InputAdornment>
                    ),
                }}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                fullWidth
                label="Discount"
                type="number"
                name="discount"
                value={currentInvoice.discount}
                onChange={handleInvoiceChange}
                variant="outlined"
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <DiscountIcon color="action" />
                    </InputAdornment>
                    ),
                }}
                />
            </Grid>
            </Grid>
        </Box>
        );

    case 2:
        return (
        <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            Review & Save
            </Typography>
            {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {saveError}
            </Alert>
            )}

            <Box sx={{ mt: 2, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Subtotal:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                <Typography variant="subtitle2">{formatNumberWithComma(calculateSubtotal())}</Typography>
                </Grid>

                <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                    Tax ({currentInvoice.tax_rate}%):
                </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                <Typography variant="subtitle2">{formatNumberWithComma(calculateTax())}</Typography>
                </Grid>

                {currentInvoice.discount > 0 && (
                <>
                    <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Discount:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                    <Typography variant="subtitle2">-{formatNumberWithComma(currentInvoice.discount)}</Typography>
                    </Grid>
                </>
                )}

                <Grid item xs={6} sx={{ mt: 1 }}>
                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right" sx={{ mt: 1 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                    {formatNumberWithComma(calculateTotal())}
                </Typography>
                </Grid>
            </Grid>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
                startIcon={<VisibilityIcon />}
                onClick={() => setPreviewOpen(true)}
                variant="outlined"
                color="info"
            >
                Preview Invoice
            </Button>
            </Box>
        </Box>
        );

    default:
        return null;
    }
};


const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
    invoice.invoice_number?.toLowerCase().includes(searchLower) ||
    invoice.customer_name?.toLowerCase().includes(searchLower) ||
    invoice.customer_email?.toLowerCase().includes(searchLower) ||
    invoice.total?.toString().includes(searchTerm)
    );
});

return (
    <>
    <br></br><br></br>
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
        <ReceiptIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Customer Invoices
        </Typography>
        <Chip 
            icon={<CloudUploadIcon />}
            label={`${invoices.length} Invoices`} 
            variant="outlined" 
            color="primary"
        />
        </Toolbar>
    </AppBar>

    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Create Invoice" />
            <Tab label={`Manage Invoices (${invoices.length})`} />
        </Tabs>
        </Paper>

        {tabValue === 0 && (
        <Grid container spacing={4}>
            {/* Input Form */}
            <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                    <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
                </Stepper>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    variant="outlined"
                >
                    Back
                </Button>

                {activeStep === steps.length - 1 ? (
                <>
                    <Button
                    variant="contained"
                    onClick={() => handleSubmit("PRINT")}
                    disabled={loading}
                    startIcon={<Print />}
                    color="info"
                    >
                    {loading ? 'Generating...' : 'Print Only'}
                    </Button>

                    <Button
                    variant="contained"
                    onClick={() => handleSubmit("BOTH")}
                    disabled={loading}
                    startIcon={<Print />}
                    color="secondary"
                    >
                    {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update & Print' : 'Print & Save')}
                    </Button>

                    <Button
                    variant="contained"
                    onClick={() => handleSubmit("SAVE")}
                    color="success"
                    disabled={loading}
                    startIcon={<SaveIcon />}
                    >
                    {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Only' : 'Save Only')}
                    </Button>
                </>
                ) : (
                    <Button
                    variant="contained"
                    onClick={handleNext}
                    >
                    Next
                    </Button>
                )}
                </Box>
            </Paper>
            </Grid>

            {/* Preview Section */}
            <Grid item xs={12} md={6}>
                {/* Hidden container for PDF */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3,display: 'none' }}>
                <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon />
                Invoice Preview
                </Typography>
                <InvoicePreviewPaper elevation={0}>
                {/* Hidden container for PDF template */}
                <div
                    id="invoice-template-container"
                    // style={{ display: 'none' }}
                >
                    <InvoiceTemplate
                        customer={selectedCustomer || {}} 
                        invoice={currentInvoice}
                        subtotal={calculateSubtotal()}
                        tax={calculateTax()}
                        total={calculateTotal()}
                        forPDF={true}
                    />
                </div>
                </InvoicePreviewPaper>
            </Paper>
            </Grid>
        </Grid>
        )}

        {tabValue === 1 && (
        <Box>
            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
            <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                <TextField
                fullWidth
                variant="outlined"
                placeholder="Search invoices by number, customer, or amount..."
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
                <IconButton onClick={fetchInvoices} color="primary">
                <RefreshIcon />
                </IconButton>
            </Paper>
            </Box>

            {/* Invoices Grid */}
            {filteredInvoices.length > 0 ? (
            <Grid container spacing={3}>
                {filteredInvoices.map((invoice) => {
                const customer = customers.find(c => c.id === invoice.customer_id);
                return (
                    <Grid item xs={12} sm={6} md={4} key={invoice.id}>
                    <Card elevation={3} sx={{ borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                <PersonIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" component="div">
                                {customer?.name || invoice.customer_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                {customer?.email || invoice.customer_email}
                                </Typography>
                            </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                            <Chip 
                                label={invoice.invoice_number} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                            />
                            <StatusChip
                                label={invoice.status}
                                status={invoice.status}
                                size="small"
                                sx={{ mt: 0.5 }}
                            />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DateIcon fontSize="small" />
                            {invoice.invoice_date}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MoneyIcon fontSize="small" />
                            {formatNumberWithComma(invoice.total)}
                            </Typography>
                        </Box>
                        </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <ActionButton
                            startIcon={<PdfIcon />}
                            onClick={() => generatePDF(invoice, customer, showToast)}
                            variant="outlined"
                            color="primary"
                            size="small"
                            disabled={generatingPDF}
                            >
                            PDF
                            </ActionButton>
                            <ActionButton
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleInvoiceView(invoice.id)}
                            variant="outlined"
                            color="info"
                            size="small"
                            >
                            View
                            </ActionButton>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {invoice.status === 'pending' && (
                            <ActionButton
                                onClick={() => handleInvoiceEdit(invoice.id)}
                                startIcon={<EditIcon />}
                                variant="outlined"
                                color="success"
                                size="small"
                            >
                                Edit
                            </ActionButton>
                            )}
                            <ActionButton
                            startIcon={<DeleteIcon />}
                            onClick={() => handleInvoiceDelete(invoice.id,)}
                            variant="outlined"
                            color="error"
                            size="small"
                            >
                            Delete
                            </ActionButton>
                        </Box>
                        </CardActions>

                        {/* Hidden element for PDF generation */}
                        <div style={{ 
                        position: 'absolute', 
                        left: '-9999px', 
                        top: 0,
                        width: '210mm',
                        minHeight: '297mm'
                        }}>
                        <div id={`invoice-${invoice.id}`} style={{ width: '100%', height: '100%' }}>
                            <InvoiceTemplate
                            customer={customer || {}}
                            invoice={invoice}
                            subtotal={invoice.subtotal}
                            tax={invoice.tax_amount}
                            total={invoice.total}
                            forPDF={true}
                            />
                        </div>
                        </div>
                    </Card>
                    </Grid>
                );
                })}
            </Grid>
            ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                No Invoices Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first invoice to get started'}
                </Typography>
                {!searchTerm && (
                <Button
                    startIcon={<AddIcon />}
                    onClick={() => setTabValue(0)}
                    variant="contained"
                >
                    Create First Invoice
                </Button>
                )}
            </Box>
            )}
        </Box>
        )}

        {/* Preview Dialog */}
        {/* Preview Dialog */}
        <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        >
        <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon />
            {viewingInvoice ? 'Invoice Details' : 'Invoice Preview'}
            </Box>
            {viewingInvoice && (
            <Chip 
                label={viewingInvoice.invoice_number} 
                color="primary" 
                variant="outlined"
            />
            )}
        </DialogTitle>
        
        <DialogContent>
            <InvoiceTemplate
            customer={selectedCustomer || {}}
            invoice={viewingInvoice || currentInvoice}
            subtotal={viewingInvoice ? viewingInvoice.subtotal : calculateSubtotal()}
            tax={viewingInvoice ? viewingInvoice.tax_amount : calculateTax()}
            total={viewingInvoice ? viewingInvoice.total : calculateTotal()}
            />
        </DialogContent>
        
        <DialogActions sx={{ p: 2, gap: 1 }}>
            {viewingInvoice && (
            <>
                <Button
                startIcon={<PdfIcon />}
                onClick={() => {
                    generatePDF(viewingInvoice, selectedCustomer, showToast);
                    setPreviewOpen(false);
                }}
                variant="outlined"
                color="primary"
                >
                Download PDF
                </Button>

                {viewingInvoice.status === 'pending' && (
                <Button
                    startIcon={<EditIcon />}
                    onClick={() => {
                    handleInvoiceEdit(viewingInvoice.id);
                    setPreviewOpen(false);
                    }}
                    variant="contained"
                    color="success"
                >
                    Edit Invoice
                </Button>
                )}
            </>
            )}
            <Button onClick={() => {
            setPreviewOpen(false);
            setViewingInvoice(null);
            }}>
            Close
            </Button>
        </DialogActions>
        </Dialog>


        {/* Delete Confirmation Dialog */}
        <Dialog
        open={deleteConfirmOpen}
        onClose={cancelDelete}
        maxWidth="sm"
        fullWidth
        >
        <DialogTitle sx={{ 
            backgroundColor: 'error.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
        }}>
            <DeleteIcon />
            Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
            <DeleteIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
                Are you sure you want to delete this invoice?
            </Typography>
            {invoiceToDelete && (
                <Box sx={{ 
                backgroundColor: 'grey.50', 
                p: 2, 
                borderRadius: 1,
                mt: 2 
                }}>
                <Typography variant="body1" fontWeight="bold">
                    Invoice #{invoiceToDelete.invoice_number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Customer: {invoiceToDelete.customer_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Amount: {formatNumberWithComma(invoiceToDelete.total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Date: {invoiceToDelete.invoice_date}
                </Typography>
                </Box>
            )}
            <Typography variant="body2" color="error" sx={{ mt: 2, fontStyle: 'italic' }}>
                This action cannot be undone.
            </Typography>
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
            onClick={cancelDelete} 
            variant="outlined" 
            color="primary"
            disabled={loading}
            >
            Cancel
            </Button>
            <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            disabled={loading}
            startIcon={<DeleteIcon />}
            >
            {loading ? 'Deleting...' : 'Delete Invoice'}
            </Button>
        </DialogActions>
        </Dialog>
    </Container>
    </>
);
};


    // Invoice Template Component - Move outside main component
const InvoiceTemplate = ({ customer, invoice, subtotal, tax, total, forPDF = false }) => {
    console.log("InvoiceTemplate customer"+JSON.stringify(customer))
    console.log("InvoiceTemplate invoice"+JSON.stringify(invoice))
    return (
        <Box sx={{
            fontFamily: 'Arial, sans-serif',
            width: forPDF ? '210mm' : '100%',
            minHeight: forPDF ? '297mm' : 'auto',
            padding: forPDF ? '20mm' : '0',
            backgroundColor: 'white',
        }}>
            {/* Company Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 4, pb: 2,
                borderBottom: '3px solid',
                borderColor: '#0d83fd !important',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        component="img"
                        src={MogasoftLog}
                        alt="Company Logo"
                        sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'contain',
                            p: 1,
                            filter: forPDF ? 'none' : 'inherit',
                            '@media print': {
                                filter: 'none',
                            }
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#059652 !important' }}>
                            {companyInfo.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#059652 !important' }}>
                            Custom Software, Websites, <br />Web & Mobile Apps <br /> Development
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                    <List dense sx={{ padding: 0 }}>
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, color: '#059652' }}>
                                <LocationIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2" sx={{ color: '#059652 !important' }}>
                                {companyInfo.address}
                            </Typography>
                        </ListItem>
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, color: '#059652' }}>
                                <PhoneIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2" sx={{ color: '#059652 !important' }}>
                                {companyInfo.phone}
                            </Typography>
                        </ListItem>
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, color: '#059652' }}>
                                <EmailIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2" sx={{ color: '#059652 !important' }}>
                                {companyInfo.email}
                            </Typography>
                        </ListItem>
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, color: '#059652' }}>
                                <LanguageIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2" sx={{ color: '#059652 !important' }}>
                                {companyInfo.website}
                            </Typography>
                        </ListItem>
                    </List>
                </Box>
            </Box>

            {/* Invoice Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#0d83fd !important' }} gutterBottom>
                    INVOICE
                </Typography>
                {/* {invoice.invoice_number && (
                    <Typography variant="h6" sx={{ color: '#0d83fd !important' }}>
                        Invoice #: {invoice.invoice_number}
                    </Typography>
                )} */}
            </Box>

            {/* Customer and Date Info */}
            <Grid container spacing={4} sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Grid item xs={8}>
                    <Typography variant="h6" gutterBottom sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#0d83fd !important',
                    }}>
                        Bill To:
                    </Typography>
                    <Box sx={{ pl: 1 }}>
                        <Typography variant="body1" fontWeight="bold" gutterBottom sx={{
                            color: '#0d83fd !important',
                        }}>
                            <PersonIcon />
                            {customer?.name  || 'Customer Name'}

                        </Typography>
                        {customer.email && (
                            <Typography variant="body2" gutterBottom sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#0d83fd !important',
                            }}>
                                <EmailIcon fontSize="small" />
                                {customer.email}
                            </Typography>
                        )}
                        {customer.phone && (
                            <Typography variant="body2" gutterBottom sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#0d83fd !important',
                            }}>
                                <PhoneIcon fontSize="small" />
                                {customer.phone}
                            </Typography>
                        )}
                        {customer.address && (
                            <Typography variant="body2" sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#0d83fd !important',
                            }}>
                                <LocationIcon fontSize="small" />
                                {customer.address}
                            </Typography>
                        )}
                    </Box>
                </Grid>

                {/* Right-aligned Date Info Box - Pushed to extreme end */}
                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'right',
                        marginLeft: 'auto',
                        width: 'fit-content',
                        backgroundColor: '#f5f5f5 !important',
                    }}>
                        <Typography variant="body2" gutterBottom sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            justifyContent: 'flex-start',
                            color: '#0d83fd !important'
                        }}>
                            <DateIcon fontSize="small" />
                            <strong>Date:</strong> {invoice.invoice_date}
                        </Typography>
                        {invoice.invoice_number && (
                            <Typography variant="body2" gutterBottom sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                justifyContent: 'flex-start',
                                color: '#0d83fd !important',
                            }}>
                                <ReceiptIcon fontSize="small" />
                                <strong>Invoice #:</strong> {invoice.invoice_number}
                            </Typography>
                        )}
                        {invoice.status && (
                            <Typography variant="body2" gutterBottom sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                justifyContent: 'flex-start',
                                color: '#0d83fd !important',
                            }}>
                                <PaymentIcon fontSize="small" />
                                <strong>Status:</strong> {invoice.status}
                            </Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>

            {/* Items Table */}
            <TableContainer component={Paper} elevation={forPDF ? 0 : 1} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#0d4991 !important'}}>
                            <TableCell sx={{
                                color: 'white !important',
                                fontWeight: 'bold',
                                border: 1,
                                padding: '16px 12px',
                                fontSize: '14px',
                                borderRight: '2px solid #ffffff !important',
                                borderLeft: '2px solid #0d4991 !important',
                                borderBottom: '2px solid #0d4991 !important',
                                borderTop: '2px solid #0d4991 !important',
                            }}>
                                Description
                            </TableCell>
                            <TableCell sx={{
                                color: 'white !important',
                                fontWeight: 'bold',
                                border: 1,
                                padding: '16px 12px',
                                fontSize: '14px',
                                borderRight: '2px solid #ffffff !important',
                                borderBottom: '2px solid #0d4991 !important',
                                borderTop: '2px solid #0d4991 !important',
                            }} align="center">
                                Quantity
                            </TableCell>
                            <TableCell sx={{
                                color: 'white !important',
                                fontWeight: 'bold',
                                border: 1,
                                padding: '16px 12px',
                                fontSize: '14px',
                                borderRight: '2px solid #ffffff !important',
                                borderBottom: '2px solid #0d4991 !important',
                                borderTop: '2px solid #0d4991 !important',
                            }} align="left">
                                Price
                            </TableCell>
                            <TableCell sx={{
                                color: 'white !important',
                                fontWeight: 'bold',
                                border: 1,
                                padding: '16px 12px',
                                fontSize: '14px',
                                borderRight: '2px solid #0d4991 !important',
                                borderBottom: '2px solid #0d4991 !important',
                                borderTop: '2px solid #0d4991 !important',
                            }} align="left">
                                Amount
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(invoice.items || []).map((item, index) => (
                            <TableRow key={index} sx={{ backgroundColor: '#EFF8FF !important'}}>
                                <TableCell sx={{ padding: '12px', color: '#000000 !important',
                                    borderBottom: '2px solid #0d4991 !important',
                                    borderLeft: '2px solid #0d4991 !important' }}>
                                    {item.description || 'Item description'}
                                </TableCell>
                                <TableCell sx={{ padding: '12px', color: '#000000 !important',borderBottom: '2px solid #0d4991 !important', }} align="center">
                                    {item.quantity}
                                </TableCell>
                                <TableCell sx={{ padding: '12px', color: '#000000 !important',borderBottom: '2px solid #0d4991 !important', }} align="left">
                                    {formatNumberWithComma(item.price)}
                                </TableCell>
                                <TableCell sx={{ padding: '12px', color: '#000000 !important',
                                    borderRight: '2px solid #0d4991 !important',
                                    borderBottom: '2px solid #0d4991 !important',
                                    }} align="left">
                                    {formatNumberWithComma(item.amount)}
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Totals Section */}
                        <TableRow sx={{ backgroundColor: '#f8f9fa !important' }}>
                            <TableCell sx={{ borderBottom: 'none !important' }}></TableCell>
                            <TableCell sx={{ borderBottom: 'none !important' }}></TableCell>
                            <TableCell sx={{ padding: '12px', color: '#0d83fd !important', fontWeight: 'bold',
                                        borderBottom: '2px solid #0d4991 !important',
                                        borderLeft: '2px solid #0d4991 !important',
                                    }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MoneyIcon fontSize="small" />
                                    Subtotal
                                </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ padding: '12px', color: '#0d83fd !important', fontWeight: 'bold',
                                    borderBottom: '2px solid #0d4991 !important',
                                    borderRight: '2px solid #0d4991 !important',
                                    }}>
                                {formatNumberWithComma(subtotal)}
                            </TableCell>
                        </TableRow>
                        {(invoice.tax_rate || 0) > 0 && (
                            <TableRow sx={{ backgroundColor: '#f8f9fa !important' }}>
                                <TableCell sx={{ borderBottom: 'none !important' }}></TableCell>
                                <TableCell sx={{ borderBottom: 'none !important' }}></TableCell>
                                <TableCell sx={{ padding: '12px', color: '#0d83fd !important', fontWeight: 'bold',
                                            borderBottom: '2px solid #0d4991 !important',
                                            borderLeft: '2px solid #0d4991 !important',
                                        }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ReceiptIcon fontSize="small" />
                                        Tax ({invoice.tax_rate || 0}%)
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ padding: '12px', color: '#0d83fd !important', fontWeight: 'bold',
                                        borderBottom: '2px solid #0d4991 !important',
                                        borderRight: '2px solid #0d4991 !important',
                                        }}>
                                    {formatNumberWithComma(tax)}
                                </TableCell>
                            </TableRow>
                        )}
                        {(invoice.discount || 0) > 0 && (
                            <TableRow sx={{ backgroundColor: '#f8f9fa !important' }}>
                                <TableCell sx={{ borderBottom: 'none !important' }}></TableCell>
                                <TableCell sx={{ borderBottom: 'none !important' }}></TableCell>
                                <TableCell sx={{ padding: '12px', color: '#0d83fd !important', fontWeight: 'bold',
                                            borderBottom: '2px solid #0d4991 !important',
                                            borderLeft: '2px solid #0d4991 !important',
                                        }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DiscountIcon fontSize="small" />
                                        Discount
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ padding: '12px', color: '#0d83fd!important', fontWeight: 'bold',
                                        borderBottom: '2px solid #0d4991 !important',
                                        borderRight: '2px solid #0d4991 !important',
                                        }}>
                                    -{formatNumberWithComma(invoice.discount || 0)}
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow sx={{ backgroundColor: '#f8f9fa !important' }}>
                            <TableCell sx={{ borderBottom: 'none !important' }}></TableCell>
                            <TableCell sx={{ borderBottom: 'none !important' }}></TableCell>
                            <TableCell sx={{ padding: '12px', backgroundColor: '#e8f5e8 !important',
                                        color: '#059652 !important', fontWeight: 'bold', fontSize: '16px',
                                        borderBottom: '2px solid #0d4991 !important',
                                        borderLeft: '2px solid #0d4991 !important',
                                    }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon fontSize="small" />
                                    TOTAL
                                </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ padding: '12px', color: '#059652 !important', 
                                    fontWeight: 'bold', fontSize: '16px',backgroundColor: '#e8f5e8 !important',
                                    borderBottom: '2px solid #0d4991 !important',
                                    borderRight: '2px solid #0d4991 !important',
                                }} >
                                {formatNumberWithComma(total)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Footer */}
            <Box sx={{
                textAlign: 'center',
                mt: 4,pt: 3,
                borderTop: '2px dotted',
                borderColor: '#0d83fd !important',
            }}>
                <Typography variant="body2" fontStyle="italic" sx={{
                    color: '#059652 !important',
                }}>
                    {companyInfo.receiptFooter}
                </Typography>
            </Box>
        </Box>
    );
};

export default Invoice;