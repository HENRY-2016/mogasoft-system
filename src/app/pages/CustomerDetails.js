import React, { useState, useEffect } from 'react';
import {
Box,
Button,
Container,
Paper,
Typography,
Grid,
Card,
CardContent,
Divider,
Chip,
Avatar,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
TablePagination,
IconButton,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
TextField,
useTheme,
useMediaQuery,
Tabs,
Tab,
Alert,
LinearProgress,
Badge
} from '@mui/material';
import {
ArrowBack as BackIcon,
Email as EmailIcon,
Phone as PhoneIcon,
LocationOn as LocationIcon,
Business as BusinessIcon,
Receipt as ReceiptIcon,
CalendarToday as CalendarIcon,
Person as PersonIcon,
Edit as EditIcon,
Delete as DeleteIcon,
PictureAsPdf as PdfIcon,
Visibility as ViewIcon,
Add as AddIcon,
AttachMoney as MoneyIcon,
TrendingUp as TrendingUpIcon,
History as HistoryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import axios from 'axios';
import useCustomToast from '../hooks/useToast';
import { formatCreatedAtDate, formatNumberWithComma } from '../utilities/Functions';
import { invoiceService } from '../services/invoiceService';
import { headers } from '../utilities/Env';
import { APICustomerShow } from '../utilities/APIS';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
color: 'white',
borderRadius: theme.spacing(2),
boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const InfoRow = styled(Box)(({ theme }) => ({
display: 'flex',
alignItems: 'center',
gap: theme.spacing(1),
marginBottom: theme.spacing(1),
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

const CustomerDetails = ({ customerId, onBack }) => {
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const showToast = useCustomToast();

const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [customer, setCustomer] = useState(null);
const [invoices, setInvoices] = useState([]);
const [tabValue, setTabValue] = useState(0);
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

// Dialog states
const [openEdit, setOpenEdit] = useState(false);
const [openCreateInvoice, setOpenCreateInvoice] = useState(false);
const [openViewInvoice, setOpenViewInvoice] = useState(false);
const [selectedInvoice, setSelectedInvoice] = useState(null);

// Form states
const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company_name: '',
    tax_number: ''
});

const [newInvoice, setNewInvoice] = useState({
    items: [{ description: '', quantity: 1, price: 0, amount: 0 }],
    taxRate: 18,
    discount: 0,
    date: new Date().toISOString().split('T')[0]
});

useEffect(() => {
    // Set toast function for invoice service
    invoiceService.setToastFunction(showToast);
    fetchCustomerDetails();
}, [customerId]);

const fetchCustomerDetails = async () => {
    setLoading(true);
    setError(null);

    try {
    // Fetch customer details
    const customerResponse = await axios.get(`${APICustomerShow}/${customerId}`, { headers });
    const customerData = customerResponse.data.data;
    
    if (customerData) {
        setCustomer(customerData);
        setEditForm({
        name: customerData.name || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        company_name: customerData.company_name || '',
        tax_number: customerData.tax_number || ''
        });
    }

    // Fetch customer invoices
    const invoicesResponse = await invoiceService.getCustomerInvoices(customerId);
    if (invoicesResponse.success) {
        setInvoices(invoicesResponse.data.data || []);
    }

    } catch (error) {
    let errorMessage = "Failed to load customer details";
    if (error.response) {
        errorMessage = error.response.data.message || error.message;
    }
    setError(errorMessage);
    showToast("Error", errorMessage, "error");
    } finally {
    setLoading(false);
    }
};

const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
    const result = await invoiceService.updateCustomer(customerId, editForm);
    if (result.success) {
        setCustomer(result.data.data);
        setOpenEdit(false);
        showToast("Success", "Customer updated successfully", "success");
    }
    } catch (error) {
    showToast("Error", "Failed to update customer", "error");
    }
};

const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
    const invoiceData = {
        customer_id: customerId,
        invoice_date: newInvoice.date,
        items: newInvoice.items,
        subtotal: calculateSubtotal(),
        tax_rate: newInvoice.taxRate,
        tax_amount: calculateTax(),
        discount: newInvoice.discount,
        total: calculateTotal()
    };

    const result = await invoiceService.createInvoice(invoiceData);
    if (result.success) {
        setOpenCreateInvoice(false);
        setNewInvoice({
        items: [{ description: '', quantity: 1, price: 0, amount: 0 }],
        taxRate: 18,
        discount: 0,
        date: new Date().toISOString().split('T')[0]
        });
        fetchCustomerDetails(); // Refresh invoices list
        showToast("Success", "Invoice created successfully", "success");
    }
    } catch (error) {
    showToast("Error", "Failed to create invoice", "error");
    }
};

const handleGeneratePDF = async (invoice) => {
    try {
    await invoiceService.generateInvoicePDF(invoice.id);
    } catch (error) {
    showToast("Error", "Failed to generate PDF", "error");
    }
};

const handleSendEmail = async (invoice) => {
    try {
    const emailData = {
        to: customer.email,
        subject: `Invoice ${invoice.invoice_number}`,
        message: `Dear ${customer.name}, please find your invoice attached.`
    };
    const result = await invoiceService.sendInvoiceEmail(invoice.id, emailData);
    if (result.success) {
        showToast("Success", "Invoice sent via email", "success");
    }
    } catch (error) {
    showToast("Error", "Failed to send email", "error");
    }
};

// Calculation functions
const calculateSubtotal = () => {
    return newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
};

const calculateTax = () => {
    return (calculateSubtotal() * newInvoice.taxRate) / 100;
};

const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - newInvoice.discount;
};

const handleInvoiceItemChange = (index, field, value) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index] = {
    ...updatedItems[index],
    [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
    };

    if (field === 'quantity' || field === 'price') {
    updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].price;
    }

    setNewInvoice(prev => ({
    ...prev,
    items: updatedItems
    }));
};

const addInvoiceItem = () => {
    setNewInvoice(prev => ({
    ...prev,
    items: [
        ...prev.items,
        { id: Date.now(), description: '', quantity: 1, price: 0, amount: 0 }
    ]
    }));
};

const removeInvoiceItem = (index) => {
    if (newInvoice.items.length > 1) {
    const updatedItems = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice(prev => ({
        ...prev,
        items: updatedItems
    }));
    }
};

// Statistics calculations
const totalInvoices = invoices.length;
const totalRevenue = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.total || 0), 0);
const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;

if (loading) {
    return (
    <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
        Loading customer details...
        </Typography>
    </Box>
    );
}

if (error) {
    return (
    <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={onBack} variant="contained">
        Back to Customers
        </Button>
    </Box>
    );
}

if (!customer) {
    return (
    <Box sx={{ p: 3 }}>
        <Alert severity="warning">
        Customer not found
        </Alert>
        <Button startIcon={<BackIcon />} onClick={onBack} variant="contained" sx={{ mt: 2 }}>
        Back to Customers
        </Button>
    </Box>
    );
}

return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
    {/* Header */}
    <Box sx={{ mb: 4 }}>
        <Button
        startIcon={<BackIcon />}
        onClick={onBack}
        variant="outlined"
        sx={{ mb: 2 }}
        >
        Back to Customers
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
            sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold'
            }}
            >
            {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
            </Avatar>
            <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                {customer.name}
            </Typography>
            <Typography variant="h6" color="text.secondary">
                Customer Details
            </Typography>
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
            startIcon={<EditIcon />}
            onClick={() => setOpenEdit(true)}
            variant="outlined"
            color="primary"
            >
            Edit Customer
            </Button>
            <Button
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateInvoice(true)}
            variant="contained"
            color="primary"
            >
            Create Invoice
            </Button>
        </Box>
        </Box>
    </Box>

    <Grid container spacing={3}>
        {/* Customer Information Card */}
        <Grid item xs={12} md={4}>
        <StyledCard>
            <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
                Customer Information
            </Typography>
            
            <InfoRow>
                <PersonIcon sx={{ color: 'white' }} />
                <Typography variant="body1" sx={{ color: 'white' }}>
                <strong>Name:</strong> {customer.name}
                </Typography>
            </InfoRow>
            
            <InfoRow>
                <EmailIcon sx={{ color: 'white' }} />
                <Typography variant="body1" sx={{ color: 'white' }}>
                <strong>Email:</strong> {customer.email}
                </Typography>
            </InfoRow>
            
            <InfoRow>
                <PhoneIcon sx={{ color: 'white' }} />
                <Typography variant="body1" sx={{ color: 'white' }}>
                <strong>Phone:</strong> {customer.phone}
                </Typography>
            </InfoRow>
            
            {customer.address && (
                <InfoRow>
                <LocationIcon sx={{ color: 'white' }} />
                <Typography variant="body1" sx={{ color: 'white' }}>
                    <strong>Address:</strong> {customer.address}
                </Typography>
                </InfoRow>
            )}
            
            {customer.company_name && (
                <InfoRow>
                <BusinessIcon sx={{ color: 'white' }} />
                <Typography variant="body1" sx={{ color: 'white' }}>
                    <strong>Company:</strong> {customer.company_name}
                </Typography>
                </InfoRow>
            )}
            
            {customer.tax_number && (
                <InfoRow>
                <ReceiptIcon sx={{ color: 'white' }} />
                <Typography variant="body1" sx={{ color: 'white' }}>
                    <strong>Tax Number:</strong> {customer.tax_number}
                </Typography>
                </InfoRow>
            )}
            
            <InfoRow>
                <CalendarIcon sx={{ color: 'white' }} />
                <Typography variant="body1" sx={{ color: 'white' }}>
                <strong>Member Since:</strong> {formatCreatedAtDate(customer.created_at)}
                </Typography>
            </InfoRow>
            </CardContent>
        </StyledCard>

        {/* Quick Stats */}
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
            Quick Stats
            </Typography>
            <Grid container spacing={2}>
            <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                <Badge badgeContent={totalInvoices} color="primary" max={999}>
                    <ReceiptIcon color="action" fontSize="large" />
                </Badge>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Total Invoices
                </Typography>
                </Box>
            </Grid>
            <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                <MoneyIcon color="success" fontSize="large" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    {formatNumberWithComma(totalRevenue)}
                </Typography>
                <Typography variant="caption">
                    Total Revenue
                </Typography>
                </Box>
            </Grid>
            <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                <TrendingUpIcon color="warning" fontSize="large" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    {pendingInvoices}
                </Typography>
                <Typography variant="caption">
                    Pending
                </Typography>
                </Box>
            </Grid>
            <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                <HistoryIcon color="success" fontSize="large" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    {paidInvoices}
                </Typography>
                <Typography variant="caption">
                    Paid
                </Typography>
                </Box>
            </Grid>
            </Grid>
        </Paper>
        </Grid>

        {/* Invoices Section */}
        <Grid item xs={12} md={8}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab 
                icon={<ReceiptIcon />} 
                iconPosition="start" 
                label={`Invoices (${invoices.length})`} 
                />
                <Tab 
                icon={<HistoryIcon />} 
                iconPosition="start" 
                label="Activity History" 
                />
            </Tabs>
            </Box>

            {/* Invoices Tab */}
            {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
                {invoices.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Invoices Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    This customer doesn't have any invoices yet.
                    </Typography>
                    <Button
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateInvoice(true)}
                    variant="contained"
                    >
                    Create First Invoice
                    </Button>
                </Box>
                ) : (
                <>
                    <TableContainer>
                    <Table>
                        <TableHead>
                        <TableRow>
                            <TableCell>Invoice #</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {invoices
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((invoice) => (
                            <TableRow key={invoice.id} hover>
                                <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {invoice.invoice_number}
                                </Typography>
                                </TableCell>
                                <TableCell>
                                {formatCreatedAtDate(invoice.invoice_date || invoice.created_at)}
                                </TableCell>
                                <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                    {formatNumberWithComma(invoice.total)}
                                </Typography>
                                </TableCell>
                                <TableCell>
                                <StatusChip
                                    label={invoice.status || 'pending'}
                                    status={invoice.status}
                                    size="small"
                                />
                                </TableCell>
                                <TableCell>
                                {invoice.due_date ? formatCreatedAtDate(invoice.due_date) : '-'}
                                </TableCell>
                                <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                    size="small"
                                    onClick={() => {
                                        setSelectedInvoice(invoice);
                                        setOpenViewInvoice(true);
                                    }}
                                    color="primary"
                                    >
                                    <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                    size="small"
                                    onClick={() => handleGeneratePDF(invoice)}
                                    color="secondary"
                                    >
                                    <PdfIcon />
                                    </IconButton>
                                    <IconButton
                                    size="small"
                                    onClick={() => handleSendEmail(invoice)}
                                    color="info"
                                    >
                                    <EmailIcon />
                                    </IconButton>
                                </Box>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                    
                    <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={invoices.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    />
                </>
                )}
            </Box>
            )}

            {/* Activity History Tab */}
            {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Activity history feature coming soon...
                </Typography>
            </Box>
            )}
        </Paper>
        </Grid>
    </Grid>

    {/* Edit Customer Dialog */}
    <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="sm"
        fullWidth
    >
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
        <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                required
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                required
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                required
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                fullWidth
                label="Address"
                name="address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                multiline
                rows={2}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                fullWidth
                label="Company Name"
                name="company_name"
                value={editForm.company_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, company_name: e.target.value }))}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                fullWidth
                label="Tax Number"
                name="tax_number"
                value={editForm.tax_number}
                onChange={(e) => setEditForm(prev => ({ ...prev, tax_number: e.target.value }))}
                />
            </Grid>
            </Grid>
            <DialogActions sx={{ mt: 3, px: 0 }}>
            <Button onClick={() => setOpenEdit(false)} color="error">
                Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
                Update Customer
            </Button>
            </DialogActions>
        </Box>
        </DialogContent>
    </Dialog>

    {/* Create Invoice Dialog */}
    <Dialog
        open={openCreateInvoice}
        onClose={() => setOpenCreateInvoice(false)}
        maxWidth="md"
        fullWidth
    >
        <DialogTitle>Create New Invoice for {customer.name}</DialogTitle>
        <DialogContent>
        <Box component="form" onSubmit={handleCreateInvoice} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                fullWidth
                label="Invoice Date"
                type="date"
                value={newInvoice.date}
                onChange={(e) => setNewInvoice(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
                />
            </Grid>
            
            {/* Invoice Items */}
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                Invoice Items
                </Typography>
                {newInvoice.items.map((item, index) => (
                <Grid container spacing={1} key={item.id} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={5}>
                    <TextField
                        fullWidth
                        label="Description"
                        value={item.description}
                        onChange={(e) => handleInvoiceItemChange(index, 'description', e.target.value)}
                        size="small"
                        required
                    />
                    </Grid>
                    <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Qty"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleInvoiceItemChange(index, 'quantity', e.target.value)}
                        size="small"
                        inputProps={{ min: 1 }}
                    />
                    </Grid>
                    <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        value={item.price}
                        onChange={(e) => handleInvoiceItemChange(index, 'price', e.target.value)}
                        size="small"
                    />
                    </Grid>
                    <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Amount"
                        value={formatNumberWithComma(item.amount)}
                        size="small"
                        InputProps={{ readOnly: true }}
                    />
                    </Grid>
                    <Grid item xs={1}>
                    <IconButton
                        onClick={() => removeInvoiceItem(index)}
                        color="error"
                        size="small"
                        disabled={newInvoice.items.length === 1}
                    >
                        <DeleteIcon />
                    </IconButton>
                    </Grid>
                </Grid>
                ))}
                
                <Button
                startIcon={<AddIcon />}
                onClick={addInvoiceItem}
                variant="outlined"
                size="small"
                sx={{ mb: 3 }}
                >
                Add Item
                </Button>
            </Grid>

            {/* Invoice Summary */}
            <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                    Invoice Summary
                </Typography>
                <Grid container spacing={1}>
                    <Grid item xs={6}>Subtotal:</Grid>
                    <Grid item xs={6} textAlign="right">
                    {formatNumberWithComma(calculateSubtotal())}
                    </Grid>
                    
                    <Grid item xs={6}>Tax ({newInvoice.taxRate}%):</Grid>
                    <Grid item xs={6} textAlign="right">
                    {formatNumberWithComma(calculateTax())}
                    </Grid>
                    
                    <Grid item xs={6}>Discount:</Grid>
                    <Grid item xs={6} textAlign="right">
                    -{formatNumberWithComma(newInvoice.discount)}
                    </Grid>
                    
                    <Grid item xs={6} sx={{ fontWeight: 'bold', mt: 1 }}>
                    Total:
                    </Grid>
                    <Grid item xs={6} textAlign="right" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {formatNumberWithComma(calculateTotal())}
                    </Grid>
                </Grid>
                </Paper>
            </Grid>
            </Grid>
            
            <DialogActions sx={{ mt: 3, px: 0 }}>
            <Button onClick={() => setOpenCreateInvoice(false)} color="error">
                Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
                Create Invoice
            </Button>
            </DialogActions>
        </Box>
        </DialogContent>
    </Dialog>

    {/* View Invoice Dialog */}
    <Dialog
        open={openViewInvoice}
        onClose={() => setOpenViewInvoice(false)}
        maxWidth="lg"
        fullWidth
    >
        <DialogTitle>
        Invoice Details - {selectedInvoice?.invoice_number}
        </DialogTitle>
        <DialogContent>
        {selectedInvoice && (
            <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                    <strong>Invoice Number:</strong> {selectedInvoice.invoice_number}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    <strong>Date:</strong> {formatCreatedAtDate(selectedInvoice.invoice_date)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    <strong>Status:</strong> 
                    <StatusChip
                    label={selectedInvoice.status}
                    status={selectedInvoice.status}
                    sx={{ ml: 1 }}
                    />
                </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                    <strong>Subtotal:</strong> {formatNumberWithComma(selectedInvoice.subtotal)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    <strong>Tax:</strong> {formatNumberWithComma(selectedInvoice.tax_amount)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    <strong>Discount:</strong> {formatNumberWithComma(selectedInvoice.discount)}
                </Typography>
                <Typography variant="h6" gutterBottom color="primary">
                    <strong>Total:</strong> {formatNumberWithComma(selectedInvoice.total)}
                </Typography>
                </Grid>
            </Grid>
            
            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <TableContainer sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Amount</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{formatNumberWithComma(item.price)}</TableCell>
                        <TableCell align="right">{formatNumberWithComma(item.amount)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
            )}
            </Box>
        )}
        </DialogContent>
        <DialogActions>
        <Button onClick={() => setOpenViewInvoice(false)}>Close</Button>
        {selectedInvoice && (
            <Button
            startIcon={<PdfIcon />}
            onClick={() => handleGeneratePDF(selectedInvoice)}
            variant="contained"
            color="primary"
            >
            Download PDF
            </Button>
        )}
        </DialogActions>
    </Dialog>
    </Container>
);
};

export default CustomerDetails;