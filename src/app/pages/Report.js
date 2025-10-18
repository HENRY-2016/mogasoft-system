// Report.js
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
AppBar,
Toolbar,
Box,
Divider,
Chip,
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
TablePagination,
Tabs,
Tab,
LinearProgress,
Alert,
InputAdornment,
IconButton,
Dialog,
DialogTitle,
DialogContent,
DialogActions
} from '@mui/material';
import {
PictureAsPdf as PdfIcon,
Receipt as ReceiptIcon,
People as PeopleIcon,
AttachMoney as MoneyIcon,
TrendingUp as TrendingUpIcon,
CalendarToday as DateIcon,
Search as SearchIcon,
FilterList as FilterIcon,
Refresh as RefreshIcon,
Download as DownloadIcon,
Visibility as VisibilityIcon,
BarChart as ChartIcon,
PieChart as PieChartIcon,
ShowChart as LineChartIcon,
Business as BusinessIcon,
Email as EmailIcon,
Phone as PhoneIcon,
LocationOn as LocationIcon,
CheckCircle as CheckCircleIcon,
Pending as PendingIcon,
Warning as WarningIcon,
ShoppingCart as CartIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import useCustomToast from '../hooks/useToast';
import { invoiceService } from '../services/invoiceService';
import { customerService } from '../services/customerService';
import { receiptService } from '../services/receiptService';
import { formatNumberWithComma, formatCreatedAtDate } from '../utilities/Functions';

// Styled Components
const StyledCard = styled(Card)(({ theme, color = 'primary' }) => ({
background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
color: 'white',
borderRadius: theme.spacing(2),
boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
transition: 'transform 0.2s',
'&:hover': {
transform: 'translateY(-4px)',
},
}));

const StatCard = ({ title, value, subtitle, icon, color = 'primary', onClick }) => (
<StyledCard color={color} onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
<CardContent>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
        {value}
        </Typography>
        <Typography variant="h6" gutterBottom>
        {title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
        {subtitle}
        </Typography>
    </Box>
    <Box sx={{ 
        bgcolor: 'rgba(255,255,255,0.2)', 
        p: 1, 
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        {icon}
    </Box>
    </Box>
</CardContent>
</StyledCard>
);

const ReportSection = styled(Paper)(({ theme }) => ({
padding: theme.spacing(3),
borderRadius: theme.spacing(2),
boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
marginBottom: theme.spacing(3),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
backgroundColor: 
status === 'paid' || status === 'completed' ? theme.palette.success.main :
status === 'pending' ? theme.palette.warning.main :
status === 'overdue' || status === 'partial' ? theme.palette.error.main :
theme.palette.grey[500],
color: 'white',
fontWeight: 'bold',
}));

const Report = () => {
const showToast = useCustomToast();
const [loading, setLoading] = useState(true);
const [generatingPDF, setGeneratingPDF] = useState(false);
const [tabValue, setTabValue] = useState(0);
const [dateRange, setDateRange] = useState({
start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
end: new Date().toISOString().split('T')[0]
});
const [reportType, setReportType] = useState('all');
const [searchTerm, setSearchTerm] = useState('');

// Data states
const [invoices, setInvoices] = useState([]);
const [customers, setCustomers] = useState([]);
const [receipts, setReceipts] = useState([]);
const [stats, setStats] = useState({
totalInvoices: 0,
totalCustomers: 0,
totalReceipts: 0,
totalRevenue: 0,
pendingInvoices: 0,
paidInvoices: 0,
overdueInvoices: 0
});

// Set toast functions and fetch data
useEffect(() => {
invoiceService.setToastFunction(showToast);
customerService.setToastFunction(showToast);
receiptService.setToastFunction(showToast);
fetchAllData();
}, []);

const fetchAllData = async () => {
try {
    setLoading(true);
    await Promise.all([
    fetchInvoices(),
    fetchCustomers(),
    fetchReceipts()
    ]);
} catch (error) {
    console.error('Error fetching report data:', error);
    showToast('Error', 'Failed to load report data', 'error');
} finally {
    setLoading(false);
}
};

const fetchInvoices = async () => {
try {
    const result = await invoiceService.getInvoices();
    if (result.success) {
    setInvoices(result.data.data || []);
    calculateStats(result.data.data || []);
    }
} catch (error) {
    console.error('Error fetching invoices:', error);
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
}
};

const fetchReceipts = async () => {
try {
    const result = await receiptService.getReceipts();
    if (result.success) {
    setReceipts(result.data.data || []);
    }
} catch (error) {
    console.error('Error fetching receipts:', error);
}
};

const calculateStats = (invoiceData) => {
const totalInvoices = invoiceData.length;
const totalCustomers = customers.length;
const totalReceipts = receipts.length;

const totalRevenue = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount_paid || 0), 0);
const pendingInvoices = invoiceData.filter(inv => inv.status === 'pending').length;
const paidInvoices = invoiceData.filter(inv => inv.status === 'paid').length;
const overdueInvoices = invoiceData.filter(inv => inv.status === 'overdue').length;

setStats({
    totalInvoices,
    totalCustomers,
    totalReceipts,
    totalRevenue,
    pendingInvoices,
    paidInvoices,
    overdueInvoices
});
};

// Filter data based on date range and report type
const filteredInvoices = invoices.filter(invoice => {
const invoiceDate = new Date(invoice.invoice_date);
const startDate = new Date(dateRange.start);
const endDate = new Date(dateRange.end);
endDate.setHours(23, 59, 59, 999);

const matchesDate = invoiceDate >= startDate && invoiceDate <= endDate;
const matchesSearch = !searchTerm || 
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

return matchesDate && matchesSearch;
});

const filteredReceipts = receipts.filter(receipt => {
const receiptDate = new Date(receipt.date);
const startDate = new Date(dateRange.start);
const endDate = new Date(dateRange.end);
endDate.setHours(23, 59, 59, 999);

const matchesDate = receiptDate >= startDate && receiptDate <= endDate;
const matchesSearch = !searchTerm || 
    receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

return matchesDate && matchesSearch;
});

const filteredCustomers = customers.filter(customer => {
return !searchTerm || 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
});

// Calculate report statistics
const calculateInvoiceStats = () => {
const totalAmount = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
const paidAmount = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
const pendingAmount = filteredInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

return {
    totalAmount,
    paidAmount,
    pendingAmount,
    collectionRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
};
};

const calculateReceiptStats = () => {
const totalCollected = filteredReceipts.reduce((sum, rec) => sum + parseFloat(rec.amount_paid || 0), 0);
const completedPayments = filteredReceipts.filter(rec => rec.status === 'completed').length;
const partialPayments = filteredReceipts.filter(rec => rec.status === 'partial').length;

return {
    totalCollected,
    completedPayments,
    partialPayments,
    averagePayment: filteredReceipts.length > 0 ? totalCollected / filteredReceipts.length : 0
};
};

const generatePDFReport = async (section = 'all') => {
setGeneratingPDF(true);
try {
    const element = document.getElementById(`report-${section}`);
    
    if (!element) {
    throw new Error('Report element not found');
    }

    const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`business-report-${section}-${dateRange.start}-to-${dateRange.end}.pdf`);
    showToast('Success', 'PDF report generated successfully!', 'success');
} catch (error) {
    console.error('Error generating PDF report:', error);
    showToast('Error', 'Error generating PDF report', 'error');
} finally {
    setGeneratingPDF(false);
}
};

const invoiceStats = calculateInvoiceStats();
const receiptStats = calculateReceiptStats();

const renderOverviewTab = () => (
<Box>
    {/* Statistics Cards */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
    <Grid item xs={12} sm={6} md={3}>
        <StatCard
        title="Total Revenue"
        value={`$${formatNumberWithComma(stats.totalRevenue)}`}
        subtitle="All time collected"
        icon={<MoneyIcon sx={{ fontSize: 32 }} />}
        color="success"
        />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
        <StatCard
        title="Total Invoices"
        value={stats.totalInvoices}
        subtitle={`${stats.paidInvoices} paid, ${stats.pendingInvoices} pending`}
        icon={<ReceiptIcon sx={{ fontSize: 32 }} />}
        color="primary"
        />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
        <StatCard
        title="Total Customers"
        value={stats.totalCustomers}
        subtitle="Active customers"
        icon={<PeopleIcon sx={{ fontSize: 32 }} />}
        color="info"
        />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
        <StatCard
        title="Total Receipts"
        value={stats.totalReceipts}
        subtitle="Payment records"
        icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
        color="warning"
        />
    </Grid>
    </Grid>

    {/* Current Period Summary */}
    <ReportSection>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChartIcon />
        Current Period Summary ({dateRange.start} to {dateRange.end})
        </Typography>
        <Button
        startIcon={<PdfIcon />}
        onClick={() => generatePDFReport('overview')}
        variant="outlined"
        color="primary"
        disabled={generatingPDF}
        >
        {generatingPDF ? 'Generating...' : 'Export PDF'}
        </Button>
    </Box>

    <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
        <Card variant="outlined">
            <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                Invoice Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Total Invoices:</Typography>
                <Typography fontWeight="bold">{filteredInvoices.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Total Amount:</Typography>
                <Typography fontWeight="bold" color="primary">
                    ${formatNumberWithComma(invoiceStats.totalAmount)}
                </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Paid Amount:</Typography>
                <Typography fontWeight="bold" color="success.main">
                    ${formatNumberWithComma(invoiceStats.paidAmount)}
                </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Pending Amount:</Typography>
                <Typography fontWeight="bold" color="warning.main">
                    ${formatNumberWithComma(invoiceStats.pendingAmount)}
                </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Collection Rate:</Typography>
                <Typography fontWeight="bold">
                    {invoiceStats.collectionRate.toFixed(1)}%
                </Typography>
                </Box>
            </Box>
            </CardContent>
        </Card>
        </Grid>

        <Grid item xs={12} md={6}>
        <Card variant="outlined">
            <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="success" />
                Payment Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Total Receipts:</Typography>
                <Typography fontWeight="bold">{filteredReceipts.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Amount Collected:</Typography>
                <Typography fontWeight="bold" color="success.main">
                    ${formatNumberWithComma(receiptStats.totalCollected)}
                </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Completed Payments:</Typography>
                <Typography fontWeight="bold">{receiptStats.completedPayments}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Partial Payments:</Typography>
                <Typography fontWeight="bold">{receiptStats.partialPayments}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Average Payment:</Typography>
                <Typography fontWeight="bold">
                    ${formatNumberWithComma(receiptStats.averagePayment.toFixed(2))}
                </Typography>
                </Box>
            </Box>
            </CardContent>
        </Card>
        </Grid>
    </Grid>
    </ReportSection>

    {/* Recent Activity */}
    <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
        <ReportSection>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Recent Invoices
        </Typography>
        <TableContainer>
            <Table size="small">
            <TableHead>
                <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredInvoices.slice(0, 5).map((invoice) => (
                <TableRow key={invoice.id} hover>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell align="right">${formatNumberWithComma(invoice.total)}</TableCell>
                    <TableCell>
                    <StatusChip
                        label={invoice.status}
                        status={invoice.status}
                        size="small"
                    />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>
        </ReportSection>
    </Grid>

    <Grid item xs={12} md={6}>
        <ReportSection>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            Recent Payments
        </Typography>
        <TableContainer>
            <Table size="small">
            <TableHead>
                <TableRow>
                <TableCell>Receipt #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Method</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredReceipts.slice(0, 5).map((receipt) => (
                <TableRow key={receipt.id} hover>
                    <TableCell>{receipt.receipt_number}</TableCell>
                    <TableCell>{receipt.customer_name}</TableCell>
                    <TableCell align="right">${formatNumberWithComma(receipt.amount_paid)}</TableCell>
                    <TableCell>
                    <Chip 
                        label={receipt.payment_method} 
                        size="small" 
                        variant="outlined"
                    />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>
        </ReportSection>
    </Grid>
    </Grid>
</Box>
);

const renderInvoicesTab = () => (
<ReportSection id="report-invoices">
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Typography variant="h5" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptIcon />
        Invoice Reports
    </Typography>
    <Button
        startIcon={<PdfIcon />}
        onClick={() => generatePDFReport('invoices')}
        variant="outlined"
        color="primary"
        disabled={generatingPDF}
    >
        {generatingPDF ? 'Generating...' : 'Export PDF'}
    </Button>
    </Box>

    {/* Invoice Statistics */}
    <Grid container spacing={2} sx={{ mb: 3 }}>
    <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">Total Invoices</Typography>
        <Typography variant="h4">{filteredInvoices.length}</Typography>
        </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
        <Typography variant="h6">Paid Invoices</Typography>
        <Typography variant="h4">
            {filteredInvoices.filter(inv => inv.status === 'paid').length}
        </Typography>
        </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
        <Typography variant="h6">Pending Invoices</Typography>
        <Typography variant="h4">
            {filteredInvoices.filter(inv => inv.status === 'pending').length}
        </Typography>
        </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.main', color: 'white' }}>
        <Typography variant="h6">Overdue Invoices</Typography>
        <Typography variant="h4">
            {filteredInvoices.filter(inv => inv.status === 'overdue').length}
        </Typography>
        </Paper>
    </Grid>
    </Grid>

    {/* Invoices Table */}
    <TableContainer component={Paper} variant="outlined">
    <Table>
        <TableHead sx={{ bgcolor: 'primary.main' }}>
        <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Invoice #</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Amount</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
        {filteredInvoices.length === 0 ? (
            <TableRow>
            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                No invoices found for the selected period
                </Typography>
            </TableCell>
            </TableRow>
        ) : (
            filteredInvoices.map((invoice) => (
            <TableRow key={invoice.id} hover>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>
                <Box>
                    <Typography variant="subtitle2">{invoice.customer_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                    {invoice.customer_email}
                    </Typography>
                </Box>
                </TableCell>
                <TableCell>{formatCreatedAtDate(invoice.invoice_date)}</TableCell>
                <TableCell align="right">
                <Typography variant="subtitle2" fontWeight="bold">
                    ${formatNumberWithComma(invoice.total)}
                </Typography>
                </TableCell>
                <TableCell>
                <StatusChip
                    label={invoice.status}
                    status={invoice.status}
                    size="small"
                />
                </TableCell>
                <TableCell>
                {invoice.due_date ? formatCreatedAtDate(invoice.due_date) : 'N/A'}
                </TableCell>
            </TableRow>
            ))
        )}
        </TableBody>
    </Table>
    </TableContainer>
</ReportSection>
);

const renderCustomersTab = () => (
<ReportSection id="report-customers">
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Typography variant="h5" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PeopleIcon />
        Customer Reports
    </Typography>
    <Button
        startIcon={<PdfIcon />}
        onClick={() => generatePDFReport('customers')}
        variant="outlined"
        color="primary"
        disabled={generatingPDF}
    >
        {generatingPDF ? 'Generating...' : 'Export PDF'}
    </Button>
    </Box>

    {/* Customer Statistics */}
    <Grid container spacing={2} sx={{ mb: 3 }}>
    <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary">Total Customers</Typography>
        <Typography variant="h4">{filteredCustomers.length}</Typography>
        </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="success.main">Active Customers</Typography>
        <Typography variant="h4">
            {customers.filter(c => invoices.some(inv => inv.customer_id === c.id)).length}
        </Typography>
        </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="info.main">New This Month</Typography>
        <Typography variant="h4">
            {customers.filter(c => {
            const created = new Date(c.created_at);
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            return created >= monthStart;
            }).length}
        </Typography>
        </Paper>
    </Grid>
    </Grid>

    {/* Customers Table */}
    <TableContainer component={Paper} variant="outlined">
    <Table>
        <TableHead sx={{ bgcolor: 'primary.main' }}>
        <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Invoices</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Spent</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Since</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
        {filteredCustomers.length === 0 ? (
            <TableRow>
            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                No customers found
                </Typography>
            </TableCell>
            </TableRow>
        ) : (
            filteredCustomers.map((customer) => {
            const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
            const totalSpent = customerInvoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

            return (
                <TableRow key={customer.id} hover>
                <TableCell>
                    <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {customer.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {customer.email}
                    </Typography>
                    </Box>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">{customer.phone}</Typography>
                    {customer.address && (
                    <Typography variant="caption" color="text.secondary">
                        {customer.address}
                    </Typography>
                    )}
                </TableCell>
                <TableCell>
                    {customer.company_name ? (
                    <Chip label={customer.company_name} size="small" variant="outlined" />
                    ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                </TableCell>
                <TableCell>
                    <Typography variant="body2">{customerInvoices.length}</Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                    ${formatNumberWithComma(totalSpent)}
                    </Typography>
                </TableCell>
                <TableCell>
                    {formatCreatedAtDate(customer.created_at)}
                </TableCell>
                </TableRow>
            );
            })
        )}
        </TableBody>
    </Table>
    </TableContainer>
</ReportSection>
);

const renderReceiptsTab = () => (
<ReportSection id="report-receipts">
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Typography variant="h5" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MoneyIcon />
        Payment Reports
    </Typography>
    <Button
        startIcon={<PdfIcon />}
        onClick={() => generatePDFReport('receipts')}
        variant="outlined"
        color="primary"
        disabled={generatingPDF}
    >
        {generatingPDF ? 'Generating...' : 'Export PDF'}
    </Button>
    </Box>

    {/* Payment Statistics */}
    <Grid container spacing={2} sx={{ mb: 3 }}>
    <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
        <Typography variant="h6">Total Collected</Typography>
        <Typography variant="h4">${formatNumberWithComma(receiptStats.totalCollected)}</Typography>
        </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">Total Receipts</Typography>
        <Typography variant="h4">{filteredReceipts.length}</Typography>
        </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
        <Typography variant="h6">Completed</Typography>
        <Typography variant="h4">{receiptStats.completedPayments}</Typography>
        </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
        <Typography variant="h6">Partial</Typography>
        <Typography variant="h4">{receiptStats.partialPayments}</Typography>
        </Paper>
    </Grid>
    </Grid>

    {/* Payment Methods Breakdown */}
    <Box sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom>Payment Methods</Typography>
    <Grid container spacing={1}>
        {['cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_money', 'check', 'other'].map((method) => {
        const methodReceipts = filteredReceipts.filter(rec => rec.payment_method === method);
        const total = methodReceipts.reduce((sum, rec) => sum + parseFloat(rec.amount_paid || 0), 0);
        const percentage = receiptStats.totalCollected > 0 ? (total / receiptStats.totalCollected) * 100 : 0;

        return (
            <Grid item xs={12} sm={6} md={4} key={method}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold">
                    {method.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body2" color="primary.main">
                    {percentage.toFixed(1)}%
                </Typography>
                </Box>
                <Typography variant="h6" color="success.main">
                ${formatNumberWithComma(total)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                {methodReceipts.length} payments
                </Typography>
            </Paper>
            </Grid>
        );
        })}
    </Grid>
    </Box>

    {/* Receipts Table */}
    <TableContainer component={Paper} variant="outlined">
    <Table>
        <TableHead sx={{ bgcolor: 'primary.main' }}>
        <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Receipt #</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Invoice #</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Amount</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Method</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
        {filteredReceipts.length === 0 ? (
            <TableRow>
            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                No receipts found for the selected period
                </Typography>
            </TableCell>
            </TableRow>
        ) : (
            filteredReceipts.map((receipt) => (
            <TableRow key={receipt.id} hover>
                <TableCell>{receipt.receipt_number}</TableCell>
                <TableCell>{receipt.customer_name}</TableCell>
                <TableCell>{receipt.invoice_number}</TableCell>
                <TableCell>{formatCreatedAtDate(receipt.date)}</TableCell>
                <TableCell align="right">
                <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                    ${formatNumberWithComma(receipt.amount_paid)}
                </Typography>
                </TableCell>
                <TableCell>
                <Chip 
                    label={receipt.payment_method} 
                    size="small" 
                    variant="outlined"
                />
                </TableCell>
                <TableCell>
                <StatusChip
                    label={receipt.status}
                    status={receipt.status}
                    size="small"
                />
                </TableCell>
            </TableRow>
            ))
        )}
        </TableBody>
    </Table>
    </TableContainer>
</ReportSection>
);

return (
<>
    <br /><br />
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
    <Toolbar>
        <TrendingUpIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
        Business Reports & Analytics
        </Typography>
        <Chip 
        icon={<ChartIcon />}
        label="Live Reports" 
        variant="outlined" 
        color="primary"
        />
    </Toolbar>
    </AppBar>

    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
    {/* Filters and Controls */}
    <ReportSection>
        <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
            <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
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
        <Grid item xs={12} sm={6} md={3}>
            <TextField
            fullWidth
            label="End Date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
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
        <Grid item xs={12} sm={6} md={3}>
            <TextField
            fullWidth
            label="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon color="action" />
                </InputAdornment>
                ),
            }}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
                startIcon={<RefreshIcon />}
                onClick={fetchAllData}
                variant="outlined"
                fullWidth
            >
                Refresh
            </Button>
            <Button
                startIcon={<DownloadIcon />}
                onClick={() => generatePDFReport('all')}
                variant="contained"
                fullWidth
                disabled={generatingPDF}
            >
                {generatingPDF ? 'Generating...' : 'Full Report'}
            </Button>
            </Box>
        </Grid>
        </Grid>
    </ReportSection>

    {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
            Loading report data...
        </Typography>
        </Box>
    ) : (
        <Box id="report-all">
        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            >
            <Tab label="Overview" icon={<ChartIcon />} iconPosition="start" />
            <Tab label="Invoices" icon={<ReceiptIcon />} iconPosition="start" />
            <Tab label="Customers" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Payments" icon={<MoneyIcon />} iconPosition="start" />
            </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && renderOverviewTab()}
        {tabValue === 1 && renderInvoicesTab()}
        {tabValue === 2 && renderCustomersTab()}
        {tabValue === 3 && renderReceiptsTab()}
        </Box>
    )}
    </Container>
</>
);
};

export default Report;