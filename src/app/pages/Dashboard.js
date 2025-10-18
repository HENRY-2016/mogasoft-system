// app/pages/Dashboard.js
import React from 'react';
import {
Box,
Grid,
Card,
CardContent,
Typography,
Paper,
List,
ListItem,
ListItemText,
ListItemIcon,
Chip,
LinearProgress,
Avatar,
AvatarGroup,
Button
} from '@mui/material';
import {
Receipt as InvoiceIcon,
Description as ReceiptIcon,
People as CustomerIcon,
TrendingUp as TrendingUpIcon,
TrendingDown as TrendingDownIcon,
AccountBalanceWallet as WalletIcon,
Payment as PaymentIcon,
Schedule as PendingIcon,
Warning as OverdueIcon,
CheckCircle as PaidIcon,
Add as AddIcon,
ArrowForward as ArrowForwardIcon,
CalendarToday as CalendarIcon,
AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for charts
const revenueData = [
{ name: 'Jan', revenue: 4000, invoices: 24 },
{ name: 'Feb', revenue: 3000, invoices: 13 },
{ name: 'Mar', revenue: 2000, invoices: 18 },
{ name: 'Apr', revenue: 2780, invoices: 22 },
{ name: 'May', revenue: 1890, invoices: 15 },
{ name: 'Jun', revenue: 2390, invoices: 20 },
];

const recentActivities = [
{ id: 1, type: 'invoice', message: 'New invoice #INV-024 created', time: '2 min ago', status: 'success' },
{ id: 2, type: 'receipt', message: 'Payment received from John Doe', time: '1 hour ago', status: 'success' },
{ id: 3, type: 'customer', message: 'New customer Acme Corp added', time: '2 hours ago', status: 'info' },
{ id: 4, type: 'invoice', message: 'Invoice #INV-022 is overdue', time: '5 hours ago', status: 'error' },
];

const StatCard = ({ title, value, change, icon, color, subtitle }) => (
<Card 
    sx={{ 
    height: '100%',
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    color: 'white',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
    }
    }}
>
    <CardContent sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
            {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {change >= 0 ? (
            <TrendingUpIcon sx={{ fontSize: 16 }} />
            ) : (
            <TrendingDownIcon sx={{ fontSize: 16 }} />
            )}
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {change >= 0 ? '+' : ''}{change}% from last month
            </Typography>
        </Box>
        {subtitle && (
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            {subtitle}
            </Typography>
        )}
        </Box>
        <Box
        sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        >
        {icon}
        </Box>
    </Box>
    </CardContent>
</Card>
);

const QuickActionCard = ({ title, description, icon, buttonText, onClick, color }) => (
<Paper
    sx={{
    p: 3,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
    border: '1px solid #e0e0e0',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 4,
        borderColor: color
    }
    }}
>
    <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box
        sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        >
        {icon}
        </Box>
        <Typography variant="h6" fontWeight="600">
        {title}
        </Typography>
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description}
    </Typography>
    </Box>
    <Button
    variant="outlined"
    startIcon={<AddIcon />}
    onClick={onClick}
    sx={{
        borderColor: color,
        color: color,
        '&:hover': {
        backgroundColor: `${color}15`,
        borderColor: color
        },
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600
    }}
    >
    {buttonText}
    </Button>
</Paper>
);

const Dashboard = () => {
// Mock data
const stats = {
    totalInvoices: 156,
    totalReceipts: 128,
    totalCustomers: 42,
    pendingAmount: 12500,
    paidAmount: 89200,
    overdueAmount: 3200
};

const handleCreateInvoice = () => {
    console.log('Create invoice clicked');
    // Navigate to invoice creation page
};

const handleCreateReceipt = () => {
    console.log('Create receipt clicked');
    // Navigate to receipt creation page
};

const handleAddCustomer = () => {
    console.log('Add customer clicked');
    // Navigate to customer creation page
};

const getStatusIcon = (status) => {
    const icons = {
    success: <PaidIcon sx={{ color: 'success.main', fontSize: 16 }} />,
    error: <OverdueIcon sx={{ color: 'error.main', fontSize: 16 }} />,
    info: <PendingIcon sx={{ color: 'info.main', fontSize: 16 }} />,
    };
    return icons[status] || <PendingIcon />;
};

return (
    <Box sx={{ p: 3 }}>
    {/* Header */}
    <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
        Welcome back! Here's what's happening with your business today.
        </Typography>
    </Box>

    {/* Main Stats Grid */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
        <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            change={12.5}
            icon={<InvoiceIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="#0d83fd"
            subtitle="24 pending approval"
        />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <StatCard
            title="Total Receipts"
            value={stats.totalReceipts}
            change={8.2}
            icon={<ReceiptIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="#059652"
            subtitle="$89.2K received"
        />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            change={5.7}
            icon={<CustomerIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="#ffb63a"
            subtitle="12 new this month"
        />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <StatCard
            title="Pending Amount"
            value={`$${stats.pendingAmount.toLocaleString()}`}
            change={-3.2}
            icon={<WalletIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="#c91940"
            subtitle="$3.2K overdue"
        />
        </Grid>
    </Grid>

    {/* Charts and Quick Actions */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
            Revenue & Invoices Overview
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
            <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0d83fd" 
                strokeWidth={3}
                dot={{ fill: '#0d83fd', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#0d83fd' }}
                />
                <Line 
                type="monotone" 
                dataKey="invoices" 
                stroke="#059652" 
                strokeWidth={2}
                strokeDasharray="5 5"
                />
            </LineChart>
            </ResponsiveContainer>
        </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
            Quick Actions
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <QuickActionCard
                title="Create Invoice"
                description="Generate a new invoice for your customer"
                icon={<InvoiceIcon />}
                buttonText="New Invoice"
                onClick={handleCreateInvoice}
                color="#0d83fd"
            />
            <QuickActionCard
                title="Record Payment"
                description="Create a receipt for received payment"
                icon={<ReceiptIcon />}
                buttonText="New Receipt"
                onClick={handleCreateReceipt}
                color="#059652"
            />
            <QuickActionCard
                title="Add Customer"
                description="Add a new customer to your system"
                icon={<CustomerIcon />}
                buttonText="Add Customer"
                onClick={handleAddCustomer}
                color="#ffb63a"
            />
            </Box>
        </Paper>
        </Grid>
    </Grid>

    {/* Bottom Section */}
    <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="600">
                Recent Activity
            </Typography>
            <Button endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none' }}>
                View All
            </Button>
            </Box>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                    {getStatusIcon(activity.status)}
                </ListItemIcon>
                <ListItemText
                    primary={activity.message}
                    secondary={activity.time}
                />
                <Chip
                    label={activity.type}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                />
                </ListItem>
            ))}
            </List>
        </Paper>
        </Grid>

        {/* Payment Status */}
        <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
            Payment Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="500">
                    Paid
                </Typography>
                <Typography variant="body2" color="success.main" fontWeight="600">
                    ${stats.paidAmount.toLocaleString()}
                </Typography>
                </Box>
                <LinearProgress 
                variant="determinate" 
                value={82} 
                sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                    backgroundColor: '#059652'
                    }
                }}
                />
            </Box>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="500">
                    Pending
                </Typography>
                <Typography variant="body2" color="warning.main" fontWeight="600">
                    ${stats.pendingAmount.toLocaleString()}
                </Typography>
                </Box>
                <LinearProgress 
                variant="determinate" 
                value={12} 
                sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ffb63a'
                    }
                }}
                />
            </Box>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="500">
                    Overdue
                </Typography>
                <Typography variant="body2" color="error.main" fontWeight="600">
                    ${stats.overdueAmount.toLocaleString()}
                </Typography>
                </Box>
                <LinearProgress 
                variant="determinate" 
                value={6} 
                sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                    backgroundColor: '#c91940'
                    }
                }}
                />
            </Box>
            </Box>
        </Paper>
        </Grid>
    </Grid>
    </Box>
);
};

export default Dashboard;