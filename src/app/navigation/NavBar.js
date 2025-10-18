import React, { useState, useEffect } from 'react';
import {
Drawer,
AppBar,
Toolbar,
IconButton,
List,
ListItem,
ListItemIcon,
ListItemText,
Collapse,
Divider,
Typography,
Avatar,
Menu,
MenuItem,
useMediaQuery,
useTheme
} from '@mui/material';
import {
Menu as MenuIcon,
Close as CloseIcon,
Dashboard as DashboardIcon,
TrackChanges as TrackIcon,
Autorenew as RenewalIcon,
AccountBalanceWallet as ExpensesIcon,
FitnessCenter as GymIcon,
Receipt as OtherExpensesIcon,
Group as CustomersIcon,
Today as DailyIcon,
CalendarViewDay as DaysIcon,
DateRange as MonthlyIcon,
AdminPanelSettings as AdminIcon,
People as StaffIcon,
AttachMoney as SalaryIcon,
Assessment as ReportsIcon,
ExitToApp as LogoutIcon,
ExpandMore as ExpandMoreIcon,
ExpandLess as ExpandLessIcon,
ChevronLeft as ChevronLeftIcon,
ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useCustomToast from '../hooks/useToast';
import { UserIcone } from '../assests';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../utilities/Permission';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
width: open ? drawerWidth : collapsedDrawerWidth,
flexShrink: 0,
whiteSpace: 'nowrap',
boxSizing: 'border-box',
'& .MuiDrawer-paper': {
    width: open ? drawerWidth : collapsedDrawerWidth,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
    }),
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
},
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
'&:hover': {
    backgroundColor:"#1b7132",
},
borderRadius: theme.shape.borderRadius,
margin: theme.spacing(0.5, 1),
paddingLeft: theme.spacing(2),
paddingRight: theme.spacing(2),
minHeight: 48,
justifyContent: 'initial',
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
minWidth: 0,
marginRight: theme.spacing(open => open ? 2 : 'auto'),
justifyContent: 'center',
color: 'inherit',
}));

const NavBar = () => {
    const showToast = useCustomToast();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopOpen, setDesktopOpen] = useState(true);
    const [expensesOpen, setExpensesOpen] = useState(false);
    const [customersOpen, setCustomersOpen] = useState(false);
    const [invoicesOpen, setInvoicesOpen] = useState(false);
    const [receiptsOpen, setReceiptsOpen] = useState(false);
    const [reportsOpen, setReportsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const userType = 'Admin';
    const [userState, setUserState] = useState({
        name: '',
        contact: '',
        role: '',
        id: ''
    });

//  Permisions
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
        loadUser();
    }, []);

    const loadUser = () => {
        const user = sessionStorage.getItem('userInfo');
        if (user) {
        const jsonData = JSON.parse(user);
        setUserState(prev => ({
            ...prev,
            name: jsonData.name,
            contact: jsonData.contact,
            id: jsonData.id,
            role: jsonData.role
        }));
        }
    };

    const handleDrawerToggle = () => {
        if (isMobile) {
        setMobileOpen(!mobileOpen);
        } else {
        setDesktopOpen(!desktopOpen);
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
        setMobileOpen(false);
        }
    };

    const handleLogOut = () => {
        sessionStorage.removeItem('userInfo');
        handleNavigation('/');
        showToast("Warning", "You have logged out successfully", "warning");
    };

    const drawerContent = (
        <div>
        <Toolbar sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            minHeight: 64 
        }}>
            {desktopOpen && (
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Mogasoft
            </Typography>
            )}
            <IconButton onClick={handleDrawerToggle} color="inherit">
            {isMobile ? (
                <CloseIcon />
            ) : desktopOpen ? (
                <ChevronLeftIcon />
            ) : (
                <ChevronRightIcon />
            )}
            </IconButton>
        </Toolbar>
        <Divider sx={{ bgcolor: '#FFFFFF' }} />

        <List>
            {/* Dashboard */}
            <StyledListItem
            button
            onClick={() => handleNavigation('/dashboard')}
            selected={location.pathname === '/dashboard'}
            sx={{ justifyContent: desktopOpen ? 'initial' : 'center' }}
            >
            <StyledListItemIcon open={desktopOpen} sx={{paddingRight:2}}>
                <DashboardIcon />
            </StyledListItemIcon>
            {desktopOpen && <ListItemText  primary="Dashboard" />}
            </StyledListItem>

            {/* Customers Section */}
            <StyledListItem
            button
            onClick={() => desktopOpen && setCustomersOpen(!customersOpen)}
            sx={{ justifyContent: desktopOpen ? 'initial' : 'center' }}
            >
            <StyledListItemIcon open={desktopOpen} sx={{paddingRight:2}}>
                <CustomersIcon />
            </StyledListItemIcon>
            {desktopOpen && (
                <>
                <ListItemText primary="Customers" />
                {customersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </>
            )}
            </StyledListItem>
            {desktopOpen && (
            <Collapse in={customersOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                <StyledListItem
                    button
                    sx={{ pl: 4 }}
                    onClick={() => handleNavigation('/customers')}
                    selected={location.pathname === '/customers'}
                >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                    <DailyIcon />
                    </ListItemIcon>
                    <ListItemText primary="Customers" />
                </StyledListItem>
                </List>
            </Collapse>
            )}

             {/* Invoices Section */}
            <StyledListItem
            button
            onClick={() => desktopOpen && setInvoicesOpen(!invoicesOpen)}
            sx={{ justifyContent: desktopOpen ? 'initial' : 'center' }}
            >
            <StyledListItemIcon open={desktopOpen} sx={{paddingRight:2}}>
                <RenewalIcon/>
            </StyledListItemIcon>
            {desktopOpen && (
                <>
                <ListItemText primary="Invoices" />
                {invoicesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </>
            )}
            </StyledListItem>
            {desktopOpen && (
            <Collapse in={invoicesOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                <StyledListItem
                    button
                    sx={{ pl: 4 }}
                    onClick={() => handleNavigation('/invoices')}
                    selected={location.pathname === '/invoices'}
                >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                    <MonthlyIcon />
                    </ListItemIcon>
                    <ListItemText primary="invoices" />
                </StyledListItem>
                </List>
            </Collapse>
            )}
             {/* Tracking Section */}
            <StyledListItem
            button
            onClick={() => desktopOpen && setReceiptsOpen(!receiptsOpen)}
            sx={{ justifyContent: desktopOpen ? 'initial' : 'center' }}
            >
            <StyledListItemIcon open={desktopOpen} sx={{paddingRight:2}}>
                <TrackIcon/>
            </StyledListItemIcon>
            {desktopOpen && (
                <>
                <ListItemText primary="Receipts" />
                {receiptsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </>
            )}
            </StyledListItem>
            {desktopOpen && (
            <Collapse in={receiptsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                <StyledListItem
                    button
                    sx={{ pl: 4 }}
                    onClick={() => handleNavigation('/receipts')}
                    selected={location.pathname === '/receipts'}
                >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                    <MonthlyIcon />
                    </ListItemIcon>
                    <ListItemText primary="Receipts" />
                </StyledListItem>
                </List>
            </Collapse>
            )}


            {/* Expenses Section */}
            <StyledListItem 
            button 
            onClick={() => desktopOpen && setExpensesOpen(!expensesOpen)}
            sx={{ justifyContent: desktopOpen ? 'initial' : 'center' }}
            >
            <StyledListItemIcon open={desktopOpen} sx={{paddingRight:2}}>
                <ExpensesIcon />
            </StyledListItemIcon>
            {desktopOpen && (
                <>
                <ListItemText primary="Expenses" />
                {expensesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </>
            )}
            </StyledListItem>
            {desktopOpen && (
            <Collapse in={expensesOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                <StyledListItem
                    button
                    sx={{ pl: 4 }}
                    onClick={() => handleNavigation('/expenses')}
                    selected={location.pathname === '/expenses'}
                >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                    <GymIcon />
                    </ListItemIcon>
                    <ListItemText primary="Others" />
                </StyledListItem>
                </List>
            </Collapse>
            )}


            <StyledListItem 
            button 
            onClick={() => desktopOpen && setReportsOpen(!reportsOpen)}
            sx={{ justifyContent: desktopOpen ? 'initial' : 'center' }}
            >
            <StyledListItemIcon open={desktopOpen} sx={{paddingRight:2}}>
                <ReportsIcon />
            </StyledListItemIcon>
            {desktopOpen && (
                <>
                <ListItemText primary="Reports" />
                {reportsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </>
            )}
            </StyledListItem>
            {desktopOpen && (
            <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                <StyledListItem
                    button
                    sx={{ pl: 4 }}
                    onClick={() => handleNavigation('/reports')}
                    selected={location.pathname === '/reports'}
                >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                    <DailyIcon />
                    </ListItemIcon>
                    <ListItemText primary="Reports" />
                </StyledListItem>
                </List>
            </Collapse>
            )}
        </List>
        </div>
    );

return (
    <>
    <AppBar
        position="fixed"
        sx={{
        width: { md: `calc(100% - ${desktopOpen ? drawerWidth : collapsedDrawerWidth}px)` },
        ml: { md: `${desktopOpen ? drawerWidth : collapsedDrawerWidth}px` },
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        }}
    >
        <Toolbar>
        <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
        >
            <MenuIcon />
        </IconButton>

        <div style={{ flexGrow: 1 }} />

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(2) }}
        >
            <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
            </Typography>

            <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls="account-menu"
            aria-haspopup="true"
            >
            <img src={UserIcone} style={{ width: 32, height: 32 }} alt='user' />
            </IconButton>

            <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
                elevation: 0,
                sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                },
                '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                },
                },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
            <center>
                <p>{userState.name}</p>
                <p>{userState.contact}</p>
                <p>{userState.role}</p>
            </center>
            <Divider />
            <MenuItem onClick={() => handleLogOut()}>
                <ListItemIcon>
                <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
            </MenuItem>
            </Menu>
        </motion.div>
        </Toolbar>
    </AppBar>

    {/* Mobile Drawer */}
    <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
        keepMounted: true,
        }}
        sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
        }}
    >
        {drawerContent}
    </Drawer>

    {/* Desktop Drawer */}
    <StyledDrawer
        variant="permanent"
        open={desktopOpen}
        sx={{
        display: { xs: 'none', md: 'block' },
        }}
    >
        {drawerContent}
    </StyledDrawer>
    </>
);
};

export default NavBar;