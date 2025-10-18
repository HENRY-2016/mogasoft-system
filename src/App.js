// App.js
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import CheckAuth from './app/auth/CheckAuth';
import MainLayout from './app/navigation/MainLayout';
import Customer from './app/pages/Customer';
import Receipt from './app/pages/Receipt';
import Invoice from './app/pages/Invoice';
import Report from './app/pages/Report';
import Login from './app/auth/LogIn';
import NotFoundPage from './app/pages/NotFoundPage';
import Dashboard from './app/pages/Dashboard';



const theme = createTheme({
palette: {
	primary: {
	main: '#0d83fd',
	light: '#fff',
	},
	secondary: {
	main: '#059652',
	},
	success: {
	light: '#4caf50',
	main: '#2e7d32',
	// main:'#074900',
	contrastText: '#fff',
	},
	info: {
	light: '#2196f3',
	main: '#1976d2',
	contrastText: '#fff',
	},
	background: {
	default: '#f5f5f5',
	paper: '#fff'
	},
	custom: {
	primaryColor: '#074900',
	greenColor: '#1b7132',
	redColor: '#c91940',
	cardColor: '#1369D3',
	blueColor: '#0d4991',
	yellowColor: '#ffb63a',
	}
},
typography: {
	fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
},
});

function App() {
return (
	<ThemeProvider theme={theme}>
	<CssBaseline />
	<SnackbarProvider
		maxSnack={3}
		anchorOrigin={{
		vertical: 'top',
		horizontal: 'right',
		}}
	>
		<Router>
		<Routes>
			{/* Public Route */}
			<Route path="/" element={<Login />} />

			{/* Protected Routes */}
			<Route path="/*" element={
			<MainLayout>
				<Routes>
				{/* Wrap all protected routes with CheckAuth */}
				<Route path="/dashboard" element={<CheckAuth> <Dashboard /> </CheckAuth> } />
				<Route path="/invoices" element={<CheckAuth> <Invoice /> </CheckAuth>} />
				<Route path="/receipts" element={<CheckAuth><Receipt /></CheckAuth>} />
				<Route path="/customers" element={<CheckAuth><Customer /></CheckAuth>} />
				<Route path="/reports" element={<CheckAuth><Report /></CheckAuth>} />

				{/* 404 Page for unmatched routes */}
				<Route path="*" element={<CheckAuth><NotFoundPage /></CheckAuth>} />
				</Routes>
			</MainLayout>
			} />
		</Routes>
		</Router>
	</SnackbarProvider>
	</ThemeProvider>
);
}

export default App;