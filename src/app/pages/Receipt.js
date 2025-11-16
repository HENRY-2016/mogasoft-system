// Receipt.js
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
AppBar,
Toolbar,
Box,
Divider,
Chip,
Alert,
InputAdornment,
FormControl,
InputLabel,
Select,
MenuItem,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
Stepper,
Step,
StepLabel,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
LinearProgress,
Avatar,
List,
ListItem,
ListItemIcon,
ListItemText,
Tabs,
Tab
} from '@mui/material';
import {
PictureAsPdf as PdfIcon,
Receipt as ReceiptIcon,
Save as SaveIcon,
Delete as DeleteIcon,
Add as AddIcon,
Language as LanguageIcon,
AttachMoney as MoneyIcon,
CreditCard as CreditCardIcon,
AccountBalance as BankIcon,
Smartphone as MobileIcon,
Business as BusinessIcon,
Email as EmailIcon,
Phone as PhoneIcon,
LocationOn as LocationIcon,
Person as PersonIcon,
Description as DescriptionIcon,
CalendarToday as DateIcon,
Payment as PaymentIcon,
Note as NoteIcon,
CloudUpload as CloudUploadIcon,
Refresh as RefreshIcon,
Search as SearchIcon,
CheckCircle as CheckCircleIcon,
LocalAtm as CashIcon,
Visibility,
Edit,
Money
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import useCustomToast from '../hooks/useToast';
import { receiptService } from '../services/receiptService';
import { formatNumberWithComma } from '../utilities/Functions';
import { invoiceService } from '../services/invoiceService';
import { MogasoftLog } from '../assests';
import { companyInfo } from '../utilities/data';
import { generateReceiptPDF } from '../utilities/receiptFunctions';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    }));

    const ReceiptPreviewPaper = styled(Paper)(({ theme }) => ({
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
status === 'completed' ? theme.palette.success.main :
status === 'partial' ? theme.palette.warning.main :
theme.palette.grey[500],
color: 'white',
fontWeight: 'bold',
}));

const steps = ['Customer & Invoice', 'Payment Details', 'Review & Save'];

// Payment methods
const paymentMethods = [
{ value: 'cash', label: 'Cash', icon: <CashIcon /> },
{ value: 'credit_card', label: 'Credit Card', icon: <CreditCardIcon /> },
{ value: 'debit_card', label: 'Debit Card', icon: <CreditCardIcon /> },
{ value: 'bank_transfer', label: 'Bank Transfer', icon: <BankIcon /> },
{ value: 'mobile_money', label: 'Mobile Money', icon: <MobileIcon /> },
{ value: 'check', label: 'Check', icon: <BusinessIcon /> },
{ value: 'other', label: 'Other', icon: <BusinessIcon /> }
];

const Receipt = () => {
    const showToast = useCustomToast();
    const [receipts, setReceipts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [receiptToDelete, setReceiptToDelete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingReceiptId, setEditingReceiptId] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState(null);
    const [saveError, setSaveError] = useState(null);

    const [currentReceipt, setCurrentReceipt] = useState({
    customer_id: '',
    invoice_id: '',
    receipt_number: '',
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    invoice_number: '',
    invoice_total: 0,
    amount_paid: 0,
    balance: 0,
    payment_method: 'cash',
    transaction_id: '',
    bank_name: '',
    check_number: '',
    mobile_number: '',
    items: [
        { id: 1, description: 'Payment for Invoice', amount: 0 }
    ],
    notes: '',
    received_by: '',
    status: 'completed'
    });

    const [selectedInvoice, setSelectedInvoice] = useState(null);

// Set toast function and fetch data
useEffect(() => {
receiptService.setToastFunction(showToast);
fetchReceipts();
fetchInvoices();
}, []);

const fetchReceipts = async () => {
try {
    setLoading(true);
    const result = await receiptService.getReceipts();
    if (result && result.success) {
    setReceipts(result.data.data || []);
    }
} catch (error) {
    console.error('Error fetching receipts:', error);
    showToast('Error', 'Failed to fetch receipts', 'error');
} finally {
    setLoading(false);
}
};

    const fetchInvoices = async () => {
    try {
        const result = await invoiceService.getInvoices();
        if (result.success) {
        setInvoices(result.data.data || []);
        }
    } catch (error) {
        console.error('Error fetching invoices:', error);
        showToast('Error', 'Failed to fetch invoices', 'error');
    }
    };

    const validateStep = (step) => {
    switch (step) {
        case 0:
        if (!currentReceipt.customer_id) {
            showToast('Validation Error', 'Please select a customer/invoice', 'error');
            return false;
        }
        return true;
        
        case 1:
        if (currentReceipt.amount_paid <= 0) {
            showToast('Validation Error', 'Amount paid must be greater than 0', 'error');
            return false;
        }
        if (!currentReceipt.payment_method) {
            showToast('Validation Error', 'Please select a payment method', 'error');
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
    const handlePreviewReceipt = () => {
        setPreviewOpen(true);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

        const handleGeneratePDF = async (receipt) => {
            console.log("receipt"+JSON.stringify(receipt))
        setGeneratingPDF(true);
        try {
            const customer = {
                name: receipt.customer_name || receipt.customer?.name,
                email: receipt.customer_email || receipt.customer?.email,
                phone: receipt.customer_phone || receipt.customer?.phone,
                address: receipt.customer_address || receipt.customer?.address
            };
            await generateReceiptPDF(receipt, customer, showToast);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setGeneratingPDF(false);
        }
    };



    const handleInvoiceChange = async (e) => {
    const invoiceId = e.target.value;
    const invoice = invoices.find(inv => inv.id === invoiceId);

    if (invoice) {
            setSelectedInvoice(invoice);
            setCurrentReceipt(prev => ({
            ...prev,
            customer_id: invoice.customer_id,
            invoice_id: invoice.id,
            customer_name: invoice.customer_name,
            customer_email: invoice.customer_email,
            customer_phone: invoice.customer_phone,
            customer_address: invoice.customer_address,
            invoice_number: invoice.invoice_number,
            invoice_total: invoice.total,
            balance: invoice.total,
            items: [
                { id: 1, description: `Payment for Invoice ${invoice.invoice_number}`, amount: 0 }
            ]
            }));
        }
    };

    const handleReceiptChange = (e) => {
        const { name, value } = e.target;

        setCurrentReceipt(prev => {
            const updatedReceipt = {
            ...prev,
            [name]: value
            };

            // Handle amount calculations
            if (name === 'amount_paid') {
            const amountPaid = parseFloat(value) || 0;
            const balance = (prev.invoice_total || 0) - amountPaid;

            updatedReceipt.balance = Math.max(0, balance);
            updatedReceipt.items = prev.items.map((item, index) => 
                index === 0 ? { ...item, amount: amountPaid } : item
            );
            updatedReceipt.status = balance <= 0 ? 'completed' : 'partial';
            }

            return updatedReceipt;
        });
    };

    const handleReceiptEdit = (receiptId) => {
    const receiptToEdit = receipts.find(rec => rec.id === receiptId);
    if (!receiptToEdit) {
        showToast('Error', 'Receipt not found', 'error');
        return;
    }

    // Set the current receipt with the data to edit
    setCurrentReceipt({
        customer_id: receiptToEdit.customer_id,
        invoice_id: receiptToEdit.invoice_id,
        receipt_number: receiptToEdit.receipt_number,
        date: receiptToEdit.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        customer_name: receiptToEdit.customer_name,
        customer_email: receiptToEdit.customer_email,
        customer_phone: receiptToEdit.customer_phone,
        customer_address: receiptToEdit.customer_address,
        invoice_number: receiptToEdit.invoice_number,
        invoice_total: receiptToEdit.invoice_total,
        amount_paid: receiptToEdit.amount_paid,
        balance: receiptToEdit.balance,
        payment_method: receiptToEdit.payment_method,
        transaction_id: receiptToEdit.transaction_id,
        bank_name: receiptToEdit.bank_name,
        check_number: receiptToEdit.check_number,
        mobile_number: receiptToEdit.mobile_number,
        items: receiptToEdit.items || [{ id: 1, description: 'Payment for Invoice', amount: 0 }],
        notes: receiptToEdit.notes,
        received_by: receiptToEdit.received_by,
        status: receiptToEdit.status
    });

    setIsEditing(true);
    setEditingReceiptId(receiptId);
    setActiveStep(0);
    setTabValue(0); // Switch to create receipt tab

    showToast('Edit Mode', 'You can now edit the receipt', 'info');
    };

    const handleReceiptView = (receiptId) => {
    const receiptToView = receipts.find(rec => rec.id === receiptId);
    if (!receiptToView) {
        showToast('Error', 'Receipt not found', 'error');
        return;
    }

    setViewingReceipt(receiptToView);
    setViewDialogOpen(true);
    };

    const handleDeleteReceipt = (receiptId) => {
    const receiptToDelete = receipts.find(rec => rec.id === receiptId);
    if (!receiptToDelete) {
        showToast('Error', 'Receipt not found', 'error');
        return;
    }

    setReceiptToDelete(receiptToDelete);
    setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
    if (!receiptToDelete) return;

    try {
        setLoading(true);
        const result = await receiptService.deleteReceipt(receiptToDelete.id);
        if (result && result.success) {
        setReceipts(prev => prev.filter(rec => rec.id !== receiptToDelete.id));
        showToast('Success', 'Receipt deleted successfully', 'success');
        } else {
        showToast('Error', 'Failed to delete receipt', 'error');
        }
    } catch (error) {
        showToast('Error', 'Error deleting receipt'+error, 'error');
    } finally {
        setLoading(false);
        setDeleteConfirmOpen(false);
        setReceiptToDelete(null);
    }
    };

    const cancelDelete = () => {
        setDeleteConfirmOpen(false);
        setReceiptToDelete(null);
    };
    const resetForm = () => {
        setCurrentReceipt({
            customer_id: '',
            invoice_id: '',
            receipt_number: '',
            date: new Date().toISOString().split('T')[0],
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            customer_address: '',
            invoice_number: '',
            invoice_total: 0,
            amount_paid: 0,
            balance: 0,
            payment_method: 'cash',
            transaction_id: '',
            bank_name: '',
            check_number: '',
            mobile_number: '',
            items: [
            { id: 1, description: 'Payment for Invoice', amount: 0 }
            ],
            notes: '',
            received_by: '',
            status: 'completed'
        });
        setSelectedInvoice(null);
        setActiveStep(0);
        setIsEditing(false);
        setEditingReceiptId(null);
        setSaveError(null);
        // Only switch to receipts tab when creating new receipts, not when editing
        if (!isEditing) {
            setTabValue(1);
        }
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
        const receiptData = {
        customer_id: currentReceipt.customer_id,
        invoice_id: currentReceipt.invoice_id,
        date: currentReceipt.date,
        amount_paid: currentReceipt.amount_paid,
        balance: currentReceipt.balance,
        payment_method: currentReceipt.payment_method,
        transaction_id: currentReceipt.transaction_id,
        bank_name: currentReceipt.bank_name,
        check_number: currentReceipt.check_number,
        mobile_number: currentReceipt.mobile_number,
        notes: currentReceipt.notes,
        received_by: currentReceipt.received_by,
        status: currentReceipt.status,
        items: currentReceipt.items
        };

        console.log('Processing receipt data for action:', action);
            const customer = {
                name: currentReceipt.customer_name,
                email: currentReceipt.customer_email,
                phone: currentReceipt.customer_phone,
                address: currentReceipt.customer_address
            };
        // Handle different actions
        switch (action) {
        case "PRINT":
            // Print only - generate PDF without saving
            generateReceiptPDF(currentReceipt,customer, showToast)
            showToast('Success', 'PDF generated successfully!', 'success');
            break;

        case "SAVE":
            // Save only - handle both create and update
            let saveResult;
            if (isEditing && editingReceiptId) {
            // Update existing receipt
            saveResult = await receiptService.updateReceipt(editingReceiptId, receiptData);
            } else {
            // Create new receipt
            saveResult = await receiptService.createReceipt(receiptData);
            }

            console.log('Save result:', saveResult);
            if (saveResult && saveResult.success) {
            const message = isEditing ? 'Receipt updated successfully!' : 'Receipt saved successfully!';
            showToast('Success', message, 'success');
            const savedReceipt = saveResult.data.data;
            
            if (isEditing) {
                // Update the receipt in the list
                setReceipts(prev => prev.map(rec => 
                rec.id === editingReceiptId ? savedReceipt : rec
                ));
            } else {
                // Add new receipt to the list
                setReceipts(prev => [...prev, savedReceipt]);
            }
            resetForm();
            } else {
            const errorMessage = saveResult?.message || 'Failed to save receipt';
            setSaveError(errorMessage);
            showToast('Error', errorMessage, 'error');
            }
            break;

        case "BOTH":
            // Save and then print - handle both create and update
            let bothResult;
            if (isEditing && editingReceiptId) {
            bothResult = await receiptService.updateReceipt(editingReceiptId, receiptData);
            } else {
            bothResult = await receiptService.createReceipt(receiptData);
            }
            
            console.log('Save result:', bothResult);
            if (bothResult && bothResult.success) {
            const message = isEditing ? 'Receipt updated and PDF generated!' : 'Receipt saved and PDF generated!';
            showToast('Success', message, 'success');
            const savedReceipt = bothResult.data.data;
            
            if (isEditing) {
                setReceipts(prev => prev.map(rec => 
                rec.id === editingReceiptId ? savedReceipt : rec
                ));
            } else {
                setReceipts(prev => [...prev, savedReceipt]);
            }
            
            // Generate PDF after successful save
            setTimeout(() => {
            generateReceiptPDF(savedReceipt,customer, showToast)

            }, 500);
            resetForm();
            } else {
            const errorMessage = bothResult?.message || 'Failed to save receipt';
            setSaveError(errorMessage);
            showToast('Error', errorMessage, 'error');
            }
            break;

        default:
            showToast('Error', 'Invalid action', 'error');
            break;
        }

    } catch (error) {
        console.error('Error processing receipt:', error);
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        setSaveError(errorMessage);
        showToast('Error', errorMessage, 'error');
    } finally {
        setLoading(false);
    }
    };


    const getPaymentMethodIcon = (method) => {
    const paymentMethod = paymentMethods.find(pm => pm.value === method);
    return paymentMethod ? paymentMethod.icon : <BusinessIcon />;
    };

    const getPaymentMethodLabel = (method) => {
    const paymentMethod = paymentMethods.find(pm => pm.value === method);
    return paymentMethod ? paymentMethod.label : 'Other';
    };

    const renderStepContent = (step) => {
    switch (step) {
        case 0:
        return (
            <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Select Invoice & Customer
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Select Invoice *</InputLabel>
                    <Select
                    name="invoice_id"
                    value={currentReceipt.invoice_id}
                    onChange={handleInvoiceChange}
                    label="Select Invoice *"
                    >
                    {invoices.map((invoice) => (
                        <MenuItem key={invoice.id} value={invoice.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <ReceiptIcon />
                            </Avatar>
                            <Box>
                            <Typography variant="body1">{invoice.customer_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {invoice.invoice_number} • Total: {formatNumberWithComma(invoice.total)}
                            </Typography>
                            </Box>
                        </Box>
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>

                {selectedInvoice && (
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Invoice Details:
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            <strong>Customer:</strong> {selectedInvoice.customer_name}
                        </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            <strong>Invoice #:</strong> {selectedInvoice.invoice_number}
                        </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            <strong>Total Amount:</strong> {formatNumberWithComma(selectedInvoice.total)}
                        </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            <strong>Status:</strong> {selectedInvoice.status}
                        </Typography>
                        </Grid>
                    </Grid>
                    </Paper>
                </Grid>
                )}

                <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Receipt Date"
                    name="date"
                    type="date"
                    value={currentReceipt.date}
                    onChange={handleReceiptChange}
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
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                Payment Details
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Payment Method *</InputLabel>
                    <Select
                    name="payment_method"
                    value={currentReceipt.payment_method}
                    onChange={handleReceiptChange}
                    label="Payment Method *"
                    >
                    {paymentMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {method.icon}
                            {method.label}
                        </Box>
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Amount Paid  *"
                    name="amount_paid"
                    type="number"
                    value={currentReceipt.amount_paid}
                    onChange={handleReceiptChange}
                    error={currentReceipt.amount_paid > (currentReceipt.invoice_total || 0)}
                    helperText={currentReceipt.amount_paid > (currentReceipt.invoice_total || 0) ? "Amount paid cannot exceed invoice total" : ""}
                    InputProps={{
                    startAdornment: <InputAdornment position="start"></InputAdornment>,
                    }}
                />
                </Grid>

                {/* Conditional fields */}
                {currentReceipt.payment_method === 'bank_transfer' && (
                <Grid item xs={12}>
                    <TextField
                    fullWidth
                    label="Bank Name"
                    name="bank_name"
                    value={currentReceipt.bank_name}
                    onChange={handleReceiptChange}
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <BankIcon color="action" />
                        </InputAdornment>
                        ),
                    }}
                    />
                </Grid>
                )}

                {currentReceipt.payment_method === 'check' && (
                <Grid item xs={12}>
                    <TextField
                    fullWidth
                    label="Check Number"
                    name="check_number"
                    value={currentReceipt.check_number}
                    onChange={handleReceiptChange}
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <BusinessIcon color="action" />
                        </InputAdornment>
                        ),
                    }}
                    />
                </Grid>
                )}

                {currentReceipt.payment_method === 'mobile_money' && (
                <Grid item xs={12}>
                    <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobile_number"
                    value={currentReceipt.mobile_number}
                    onChange={handleReceiptChange}
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <MobileIcon color="action" />
                        </InputAdornment>
                        ),
                    }}
                    />
                </Grid>
                )}

                {(currentReceipt.payment_method === 'credit_card' || 
                currentReceipt.payment_method === 'debit_card' ||
                currentReceipt.payment_method === 'mobile_money' ||
                currentReceipt.payment_method === 'bank_transfer') && (
                <Grid item xs={12}>
                    <TextField
                    fullWidth
                    label="Transaction ID"
                    name="transaction_id"
                    value={currentReceipt.transaction_id}
                    onChange={handleReceiptChange}
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <PaymentIcon color="action" />
                        </InputAdornment>
                        ),
                    }}
                    />
                </Grid>
                )}

                <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Received By"
                    name="received_by"
                    value={currentReceipt.received_by}
                    onChange={handleReceiptChange}
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <PersonIcon color="action" />
                        </InputAdornment>
                    ),
                    }}
                />
                </Grid>

                <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={currentReceipt.notes}
                    onChange={handleReceiptChange}
                    multiline
                    rows={3}
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <NoteIcon color="action" />
                        </InputAdornment>
                    ),
                    }}
                />
                </Grid>
            </Grid>

            {/* Payment Summary */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                    Payment Summary
                </Typography>
                <Grid container spacing={1}>
                    <Grid item xs={6}>Invoice Total:</Grid>
                    <Grid item xs={6} textAlign="right">
                        {formatNumberWithComma(currentReceipt?.invoice_total || 0)}
                    </Grid>

                    <Grid item xs={6}>Amount Paid:</Grid>
                    <Grid item xs={6} textAlign="right">
                        <Typography color="success.main" fontWeight="bold">
                            {formatNumberWithComma(currentReceipt?.amount_paid || 0)}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>Balance:</Grid>
                    <Grid item xs={6} textAlign="right">
                        <Typography 
                            color={((currentReceipt?.balance) || 0) === 0 ? "success.main" : "warning.main"} 
                            fontWeight="bold"
                        >
                            {formatNumberWithComma(currentReceipt?.balance || 0)}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 1 }}>
                        <StatusChip 
                            label={((currentReceipt?.balance) || 0) === 0 ? "PAID IN FULL" : "PARTIAL PAYMENT"} 
                            status={((currentReceipt?.balance) || 0) === 0 ? "completed" : "partial"}
                        />
                    </Grid>
                </Grid>
            </Box>
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

                    <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                            <strong>Customer:</strong> {currentReceipt.customer_name}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2"><strong>Invoice:</strong> {currentReceipt.invoice_number}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2"><strong>Payment Method:</strong> {getPaymentMethodLabel(currentReceipt.payment_method)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2"><strong>Amount Paid:</strong></Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                            <Typography variant="h6" color="primary" fontWeight="bold">
                            {formatNumberWithComma(currentReceipt.amount_paid)}
                            </Typography>
                        </Grid>
                        </Grid>
                    </Paper>
                </Box>
        );

        default:
        return null;
    }
    };

    const filteredReceipts = receipts.filter(receipt => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
        receipt.receipt_number?.toLowerCase().includes(searchLower) ||
        receipt.customer_name?.toLowerCase().includes(searchLower) ||
        receipt.invoice_number?.toLowerCase().includes(searchLower) ||
        receipt.amount_paid?.toString().includes(searchTerm)
    );
    });

return (
        <>
            <br /><br />
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>
                <ReceiptIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Payment Receipts
                </Typography>
                <Chip
                icon={<CloudUploadIcon />}
                label={`${receipts.length} Receipts`} 
                variant="outlined"
                color="primary"
                />
            </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Tabs Navigation */}
                <Paper sx={{ mb: 3, borderRadius: 2 }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="Create Receipt" />
                    <Tab label={`Manage Receipts (${receipts.length})`} />
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
                                    variant="outlined"
                                    onClick={handlePreviewReceipt}
                                    disabled={loading}
                                    startIcon={<Visibility />}
                                >
                                    Preview
                                </Button>
                                <Button
                                variant="contained"
                                onClick={() => handleSubmit("PRINT")}
                                disabled={loading}
                                startIcon={<PdfIcon />}
                                color="info"
                                >
                                {loading ? 'Generating...' : 'Print Only'}
                                </Button>

                                <Button
                                variant="contained"
                                onClick={() => handleSubmit("BOTH")}
                                disabled={loading}
                                startIcon={<SaveIcon />}
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

                    {/* Preview Section - Hidden in create mode, shown in dialog */}
                    <Grid item xs={12} md={6} sx={{ display: 'none' }}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptIcon />
                            Receipt Preview
                        </Typography>
                        <ReceiptPreviewPaper elevation={0}>
                            <div id="receipt-template-container">
                                <ReceiptTemplate
                                receipt={currentReceipt}
                                invoiceTotal={currentReceipt.invoice_total}
                                forPDF={true}
                                />
                            </div>
                        </ReceiptPreviewPaper>
                        </Paper>
                    </Grid>
                    </Grid>
                )}

                {tabValue === 1 && (
                    <Box>
                    {/* Search Bar and Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5">
                        Manage Receipts ({receipts.length})
                        </Typography>
                        {/* Search Bar */}
                        <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search receipts..."
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
                        <IconButton onClick={fetchReceipts} color="primary">
                            <RefreshIcon />
                        </IconButton>
                        </Paper>
                    </Box>

                    {/* Receipts Grid */}
                    {filteredReceipts.length > 0 ? (
                        <Grid container spacing={3}>
                        {filteredReceipts.map((receipt) => (
                            <Grid item xs={12} sm={6} md={4} key={receipt.id}>
                            <Card elevation={3} sx={{ borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                                <PersonIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" component="div">
                                                    {receipt.customer?.name || receipt.customer_name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {receipt.customer?.email || receipt.customer_email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <StatusChip
                                                label={receipt.status}
                                                status={receipt.status}
                                                size="small"
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        {getPaymentMethodIcon(receipt.payment_method)}
                                        <Typography variant="body2" color="text.secondary">
                                            {getPaymentMethodLabel(receipt.payment_method)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <DateIcon fontSize="small" />
                                            {receipt.date}
                                        </Typography>
                                        <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CashIcon fontSize="small" />
                                            {formatNumberWithComma(receipt.amount_paid)}
                                        </Typography>
                                    </Box>

                                        <Chip
                                            label={receipt.receipt_number}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Chip
                                            label={"Invoice:"+receipt.invoice?.invoice_number || receipt.invoice_number}
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
                                        {receipt.balance > 0 && (
                                            <Typography variant="body2" color="warning.main">
                                                Balance: {formatNumberWithComma(receipt.balance)}
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <ActionButton
                                    startIcon={<Visibility />}
                                    onClick={() => handleReceiptView(receipt.id)}
                                    variant="outlined"
                                    color="info"
                                    size="small"
                                    >
                                    View
                                    </ActionButton>
                                    <ActionButton
                                    startIcon={<PdfIcon />}
                                    onClick={() => handleGeneratePDF(receipt)}
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    disabled={generatingPDF}
                                    >
                                    {generatingPDF ? 'Generating...' : 'PDF'}
                                    </ActionButton>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <ActionButton
                                    startIcon={<Edit />}
                                    onClick={() => handleReceiptEdit(receipt.id)}
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    >
                                    Edit
                                    </ActionButton>
                                    <ActionButton
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDeleteReceipt(receipt.id)}
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
                                <div id={"receipt-print"} style={{ width: '100%', height: '100%' }}>
                                    <ReceiptTemplate
                                    receipt={receipt}
                                    invoiceTotal={receipt.invoice_total}
                                    forPDF={true}
                                    />
                                </div>
                                </div>
                            </Card>
                            </Grid>
                        ))}
                        </Grid>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                        <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Receipts Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {searchTerm ? 'Try adjusting your search terms' : 'Create your first receipt to get started'}
                        </Typography>
                        {!searchTerm && (
                            <Button
                            startIcon={<AddIcon />}
                            onClick={() => setTabValue(0)}
                            variant="contained"
                            >
                            Create First Receipt
                            </Button>
                        )}
                        </Box>
                    )}
                    </Box>
                )}
                <>
                    {/* Preview Dialog */}
                    <Dialog
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    maxWidth="lg"
                    fullWidth
                    >
                    <DialogTitle>
                        Receipt Preview
                    </DialogTitle>
                    <DialogContent>
                        <ReceiptTemplate
                        receipt={currentReceipt}
                        invoiceTotal={currentReceipt.invoice_total}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setPreviewOpen(false)}>Close</Button>
                    </DialogActions>
                    </Dialog>

                    {/* View Receipt Dialog */}
                    <Dialog
                    open={viewDialogOpen}
                    onClose={() => setViewDialogOpen(false)}
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
                        Receipt Details
                        </Box>
                        {viewingReceipt && (
                        <Chip 
                            label={viewingReceipt.receipt_number} 
                            color="primary" 
                            variant="outlined"
                        />
                        )}
                    </DialogTitle>

                    <DialogContent>
                        {viewingReceipt && (
                        <ReceiptTemplate
                            receipt={viewingReceipt}
                            invoiceTotal={viewingReceipt.invoice_total}
                        />
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        {viewingReceipt && (
                        <>
                            <Button
                            startIcon={<PdfIcon />}
                            onClick={() => {
                                handleGeneratePDF(viewingReceipt);
                                setViewDialogOpen(false);
                            }}
                            variant="outlined"
                            color="primary"
                            >
                            Download PDF
                            </Button>
                            <Button
                            startIcon={<Edit />}
                            onClick={() => {
                                handleReceiptEdit(viewingReceipt.id);
                                setViewDialogOpen(false);
                            }}
                            variant="contained"
                            color="success"
                            >
                            Edit Receipt
                            </Button>
                        </>
                        )}
                        <Button onClick={() => setViewDialogOpen(false)}>
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
                            Are you sure you want to delete this receipt?
                        </Typography>
                        {receiptToDelete && (
                            <Box sx={{ 
                            backgroundColor: 'grey.50', 
                            p: 2, 
                            borderRadius: 1,
                            mt: 2 
                            }}>
                            <Typography variant="body1" fontWeight="bold">
                                Receipt #{receiptToDelete.receipt_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Customer: {receiptToDelete.customer_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Amount: {formatNumberWithComma(receiptToDelete.amount_paid)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Date: {receiptToDelete.date}
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
                        {loading ? 'Deleting...' : 'Delete Receipt'}
                        </Button>
                    </DialogActions>
                    </Dialog>
                </>
            </Container>
        </>
    );
};


    // Receipt Template Component
    // Receipt Template Component
const ReceiptTemplate = ({ receipt, invoiceTotal, forPDF = false }) => {
    // Add this inside the ReceiptTemplate component for debugging
    // Calculate the invoice total from the receipt data structure
    const getInvoiceTotal = () => {
        // First priority: Use the explicitly passed invoiceTotal prop
        if (invoiceTotal !== undefined && invoiceTotal !== null && invoiceTotal !== 0) {
        return invoiceTotal;
        }
        // Second priority: Use receipt.invoice_total if available
        if (receipt.invoice_total && receipt.invoice_total !== 0) {
        return receipt.invoice_total;
        }
        // Third priority: Use receipt.invoice?.total if available (from nested invoice object)
        if (receipt.invoice?.total && receipt.invoice.total !== 0) {
        return receipt.invoice.total;
        }
        // Fourth priority: Use receipt.invoice_total from the main receipt object
        if (receipt.invoice_total !== undefined && receipt.invoice_total !== null) {
        return receipt.invoice_total;
        }
        // Fallback: Calculate from items or use 0
        return receipt.items?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0;
    };

    const totalInvoiceAmount = getInvoiceTotal();

    console.log('ReceiptTemplate - calculated totalInvoiceAmount:', totalInvoiceAmount);

    return (
        <Box sx={{
        fontFamily: 'Arial, sans-serif',
        color: 'text.primary',
        width: forPDF ? '210mm' : '100%',
        minHeight: forPDF ? '297mm' : 'auto',
        padding: forPDF ? '20mm' : '0',
        backgroundColor: 'white'
        }}>
        {/* Company Header */}
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 4,
            pb: 2,
            borderBottom: '3px solid',
            borderColor: '#0d83fd !important'
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

        {/* Receipt Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#0d83fd !important' }} gutterBottom>
            PAYMENT RECEIPT
            </Typography>
        </Box>

        {/* Receipt Details */}
        <Grid container spacing={4} sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Grid item xs={8}>
            <Typography variant="h6" gutterBottom sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#0d83fd !important',
            }}>
                Received From:
            </Typography>
            <Box sx={{ pl: 1 }}>
                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ color: '#0d83fd !important' }} data-customer-name>
                <PersonIcon />
                {receipt.customer_name || receipt.customer?.name || 'Customer Name'}
                </Typography>
                {(receipt.customer_email || receipt.customer?.email)  && (
                <Typography variant="body2" gutterBottom sx={{
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    color: '#0d83fd !important',
                }} data-customer-email>
                    <EmailIcon fontSize="small" />
                    {receipt.customer_email || receipt.customer?.email}
                </Typography>
                )}
                {(receipt.customer_phone || receipt.customer?.phone) && (
                <Typography variant="body2" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: '#0d83fd !important',
                }} data-customer-phone>
                    <PhoneIcon fontSize="small" />
                    {receipt.customer_phone || receipt.customer?.phone}
                </Typography>
                )}
                {(receipt.customer_address  || receipt.customer?.address) && (
                <Typography variant="body2" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#0d83fd !important',
                }} data-customer-address>
                    <LocationIcon fontSize="small" />
                    {receipt.customer_address || receipt.customer?.address}
                </Typography>
                )}
            </Box>
            </Grid>

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
                <strong>Date:</strong> {receipt.date}
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                justifyContent: 'flex-start',
                color: '#0d83fd !important',
                }}>
                <ReceiptIcon fontSize="small" />
                <strong>Receipt #:</strong> {receipt.receipt_number || 'Pending'}
                </Typography>
                {receipt.invoice_number && (
                <Typography variant="body2" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    justifyContent: 'flex-start',
                    color: '#0d83fd !important',
                }}>
                    <PaymentIcon fontSize="small" />
                    <strong>Invoice #:</strong> {receipt.invoice_number}
                </Typography>
                )}
            </Box>
            </Grid>
        </Grid>

        {/* Payment Details */}
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#0d83fd !important' }}>
            Payment Details
            </Typography>
            <Grid container spacing={2}>
            <Grid item xs={6}>
                <Typography sx={{ color: '#0d83fd !important' }}><strong>Payment Method:</strong></Typography>
                <Typography>
                {receipt.payment_method ? 
                    receipt.payment_method.charAt(0).toUpperCase() + receipt.payment_method.slice(1).replace('_', ' ') 
                    : 'Cash'
                }
                </Typography>
            </Grid>
            {receipt.transaction_id && (
                <Grid item xs={6}>
                <Typography sx={{ color: '#0d83fd !important' }}><strong>Transaction ID:</strong></Typography>
                <Typography>{receipt.transaction_id}</Typography>
                </Grid>
            )}
            {receipt.bank_name && (
                <Grid item xs={6}>
                <Typography sx={{ color: '#0d83fd !important' }}><strong>Bank Name:</strong></Typography>
                <Typography>{receipt.bank_name}</Typography>
                </Grid>
            )}
            {receipt.check_number && (
                <Grid item xs={6}>
                <Typography sx={{ color: '#0d83fd !important' }}><strong>Check Number:</strong></Typography>
                <Typography>{receipt.check_number}</Typography>
                </Grid>
            )}
            {receipt.mobile_number && (
                <Grid item xs={6}>
                <Typography sx={{ color: '#0d83fd !important' }}><strong>Mobile Number:</strong></Typography>
                <Typography>{receipt.mobile_number}</Typography>
                </Grid>
            )}
            {receipt.received_by && (
                <Grid item xs={6}>
                <Typography sx={{ color: '#0d83fd !important' }}><strong>Received By:</strong></Typography>
                <Typography>{receipt.received_by}</Typography>
                </Grid>
            )}
            </Grid>
        </Box>

        {/* Payment Items Table */}
        <TableContainer component={Paper} elevation={forPDF ? 0 : 1} sx={{ mb: 4 }}>
            <Table>
            <TableHead>
                <TableRow sx={{ backgroundColor: '#0d4991 !important' }}>
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
                    borderRight: '2px solid #0d4991 !important',
                    borderBottom: '2px solid #0d4991 !important',
                    borderTop: '2px solid #0d4991 !important',
                }} align="right">
                    Amount
                </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {receipt.items?.map((item, index) => (
                <TableRow key={index} sx={{ backgroundColor: '#EFF8FF !important' }}>
                    <TableCell sx={{ 
                    padding: '12px', 
                    color: '#000000 !important',
                    borderBottom: '2px solid #0d4991 !important',
                    borderLeft: '2px solid #0d4991 !important'
                    }}>
                    {item.description || 'Payment item'}
                    </TableCell>
                    <TableCell sx={{ 
                    padding: '12px', 
                    color: '#000000 !important',
                    borderRight: '2px solid #0d4991 !important',
                    borderBottom: '2px solid #0d4991 !important',
                    }} align="right">
                    {formatNumberWithComma(item.amount)}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>

        {/* Totals Section - Table Style */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <Box sx={{ 
            width: 300, 
            border: '2px solid #0d4991 !important',
            borderRadius: 1,
            overflow: 'hidden',
            backgroundColor: 'white'
            }}>
            {/* Table Header */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                backgroundColor: '#0d4991 !important',
                borderBottom: '2px solid #0d4991 !important'
            }}>
                <Typography sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '16px' }}>
                PAYMENT SUMMARY
                </Typography>
            </Box>

            {/* Table Rows */}
            <Box sx={{ p: 0 }}>
                {/* Invoice Total Row */}
                <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                borderBottom: '1px solid #e0e0e0 !important'
                }}>
                <Typography sx={{ color: '#0d83fd !important', fontWeight: 'bold' }}>
                    Invoice Total:
                </Typography>
                <Typography sx={{ color: '#0d83fd !important', fontWeight: 'bold' }}>
                    {formatNumberWithComma(totalInvoiceAmount)}
                </Typography>
                </Box>
                
                {/* Amount Paid Row */}
                <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                borderBottom: receipt.balance > 0 ? '1px solid #e0e0e0 !important' : '2px solid #0d4991 !important',
                backgroundColor: receipt.balance === 0 ? '#f8fff8 !important' : 'transparent'
                }}>
                <Typography sx={{ color: '#0d83fd !important', fontWeight: 'bold' }}>
                    Amount Paid:
                </Typography>
                <Typography sx={{ color: '#059652 !important', fontWeight: 'bold', fontSize: '18px' }}>
                    {formatNumberWithComma(receipt.amount_paid)}
                </Typography>
                </Box>
                
                {/* Balance Due Row */}
                {receipt.balance > 0 && (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderBottom: '2px solid #0d4991 !important',
                    backgroundColor: '#fffaf0 !important'
                }}>
                    <Typography sx={{ color: '#0d83fd !important', fontWeight: 'bold' }}>
                    Balance Due:
                    </Typography>
                    <Typography sx={{ color: '#ff9800 !important', fontWeight: 'bold', fontSize: '16px' }}>
                    {formatNumberWithComma(receipt.balance)}
                    </Typography>
                </Box>
                )}
            </Box>

            {/* Payment Status Footer */}
            <Box sx={{ 
                p: 2,
                backgroundColor: receipt.balance === 0 ? '#e8f5e8 !important' : '#fff3e0 !important',
                borderTop: receipt.balance > 0 ? '2px solid #0d4991 !important' : 'none'
            }}>
                <Typography 
                variant="h6" 
                fontWeight="bold" 
                textAlign="center"
                sx={{ 
                    color: receipt.balance === 0 ? '#059652 !important' : '#ff9800 !important',
                }}
                >
                {receipt.balance === 0 ? 'PAID IN FULL' : 'PARTIAL PAYMENT'}
                </Typography>
            </Box>
            </Box>
        </Box>

        {/* Notes */}
        {receipt.notes && (
            <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#0d83fd !important' }}>
                Notes
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f8f9fa !important', border: '1px solid #0d4991 !important' }}>
                <Typography variant="body2">{receipt.notes}</Typography>
            </Paper>
            </Box>
        )}

        {/* Footer */}
        <Box sx={{ 
            textAlign: 'center', 
            mt: 4, 
            pt: 3, 
            borderTop: '2px dotted', 
            borderColor: '#0d83fd !important',
        }}>
            <Typography variant="body2" fontStyle="italic" sx={{ color: '#059652 !important' }}>
            {companyInfo.receiptFooter}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#0d83fd !important' }}>
            This is an official receipt. Please keep it for your records.
            </Typography>
        </Box>
        </Box>
    );
    };


export default Receipt;