// services/invoiceService.js
import axios from 'axios';
import {
    Message_400, Message_401, Message_403, Message_404,
    Message_405, Message_409, Message_422, Message_500,
    Message_503 
} from './errorMsgs';
import {AUTH_TOKEN, BASE_URL} from '../utilities/Env';
import { APICustomerDelete, APIInvoiceList, APIInvoiceStore, APIInvoiceUpdate } from '../utilities/APIS';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
});

class InvoiceService {
    constructor() {
        this.showToast = null;
    }

    /**
     * Set the toast function from useToast hook
     */
    setToastFunction(toastFunction) {
        this.showToast = toastFunction;
    }

    /**
     * Handle API errors consistently
     */
    handleError(error, defaultMessage = 'Operation failed') {
        let message = defaultMessage;
        let statusCode = null;
        console.log("error"+error)

        if (error.response) {
            statusCode = error.response.status;
            message = error.response.data?.message ||
                    error.response.data?.error ||
                    defaultMessage;

            switch (statusCode) {
                case 400:
                    message = message || Message_400;
                    break;
                case 401:
                    message = message || Message_401;
                    break;
                case 403:
                    message = message || Message_403;
                    break;
                case 404:
                    message = message || Message_404;
                    break;
                case 405:
                    message = message || Message_405;
                    break;
                case 409:
                    message = message || Message_409;
                    break;
                case 422:
                    message = message || Message_422;
                    break;
                case 500:
                    message = message || Message_500;
                    break;
                case 503:
                    message = message || Message_503;
                    break;
                default:
                    message = message || `Server error (${statusCode})`;
            }
        } else if (error.request) {
            message = 'Network error. Please check your connection';
        } else {
            message = error.message || defaultMessage;
        }

        if (this.showToast) {
            this.showToast("Error", message, "error", Infinity);
        } else {
            console.warn('Toast function not set. Message:', message);
        }

        return {
            success: false,
            message,
            statusCode,
            error: error.response?.data || error
        };
    }

    // ===== CUSTOMER MANAGEMENT =====

    /**
     * Get all customers
     */
    async getCustomers() {
        try {
            const response = await api.get('/customers');
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customers fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customers');
        }
    }

    /**
     * Create new customer
     */
    async createCustomer(customerData) {
        try {
            const response = await api.post('/customers', JSON.stringify(customerData));
            
            if (this.showToast) {
                this.showToast("Success", "Customer created successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer created successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to create customer');
        }
    }

    /**
     * Update customer
     */
    async updateCustomer(customerId, customerData) {
        try {
            const response = await api.put(`/customers/update`, {
                updateId: customerId,
                ...customerData
            });
            
            if (this.showToast) {
                this.showToast("Success", "Customer updated successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer updated successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update customer');
        }
    }

    /**
     * Delete customer
     */
    async deleteCustomer(customerId) {
        try {
            const response = await api.delete('/customers/delete', {
                data: { updateId: customerId }
            });
            
            if (this.showToast) {
                this.showToast("Success", "Customer deleted successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer deleted successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to delete customer');
        }
    }

    /**
     * Get customer details
     */
    async getCustomerDetails(customerId) {
        try {
            const response = await api.get(`/customers/${customerId}`);
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer details fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer details');
        }
    }

    // ===== INVOICE MANAGEMENT =====

    /**
     * Get all invoices
     */
    async getInvoices() {
        try {
            const response = await api.get(APIInvoiceList);
            return {
                success: true,
                data: response.data,
                message: response.data?.message || 'Invoices fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch invoices');
        }
    }

    /**
     * Create new invoice
     */
    async createInvoice(invoiceData) {
        try {
            const response = await api.post(APIInvoiceStore, invoiceData);
            return {
                success: true,
                data: response.data,
                message: response.data?.message || 'Invoice created successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to create invoice');
        }
    }

    /**
     * Get invoice details
     */
    async getInvoiceDetails(invoiceId) {
        try {
            const response = await api.get(`/invoices/${invoiceId}`);
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Invoice details fetched successfully'
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch invoice details');
        }
    }

    /**
     * Update invoice
     */
    async updateInvoice(invoiceId, invoiceData) {
        try {
            const response = await api.post(APIInvoiceUpdate, {
                updateId: invoiceId,
                ...invoiceData
            });
            return {
                success: true,
                data: response.data,
                message: response.data?.message || 'Invoice updated successfully'
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update invoice');
        }
    }

    /**
     * Delete invoice
     */
    async deleteInvoice(invoiceId) {
        try {
            const response = await api.post(APICustomerDelete,
                { updateId: invoiceId });
            return {
                success: true,
                data: response.data,
                message: response.data?.message || 'Invoice deleted successfully'
            };
        } catch (error) {
            return this.handleError(error, 'Failed to delete invoice');
        }
    }

    /**
     * Update invoice status
     */
    async updateInvoiceStatus(invoiceId, status) {
        try {
            const response = await api.patch(`/invoices/${invoiceId}/status`, { status });
            
            if (this.showToast) {
                this.showToast("Success", `Invoice ${status} successfully!`, "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Invoice status updated successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update invoice status');
        }
    }

    // ===== INVOICE ITEMS MANAGEMENT =====

    /**
     * Add item to invoice
     */
    async addInvoiceItem(invoiceId, itemData) {
        try {
            const response = await api.post(`/invoices/${invoiceId}/items`, JSON.stringify(itemData));
            
            if (this.showToast) {
                this.showToast("Success", "Item added to invoice successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Item added successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to add item to invoice');
        }
    }

    /**
     * Update invoice item
     */
    async updateInvoiceItem(invoiceId, itemId, itemData) {
        try {
            const response = await api.put(`/invoices/${invoiceId}/items/${itemId}`, JSON.stringify(itemData));
            
            if (this.showToast) {
                this.showToast("Success", "Invoice item updated successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Invoice item updated successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update invoice item');
        }
    }

    /**
     * Delete invoice item
     */
    async deleteInvoiceItem(invoiceId, itemId) {
        try {
            const response = await api.delete(`/invoices/${invoiceId}/items/${itemId}`);
            
            if (this.showToast) {
                this.showToast("Success", "Item removed from invoice successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Item removed successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to remove item from invoice');
        }
    }

    // ===== INVOICE TEMPLATES =====

    /**
     * Get invoice templates
     */
    async getInvoiceTemplates() {
        try {
            const response = await api.get('/invoice-templates');
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Templates fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch invoice templates');
        }
    }

    /**
     * Save invoice template
     */
    async saveInvoiceTemplate(templateData) {
        try {
            const response = await api.post('/invoice-templates', JSON.stringify(templateData));
            
            if (this.showToast) {
                this.showToast("Success", "Template saved successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Template saved successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to save template');
        }
    }

    // ===== PDF GENERATION & EXPORT =====

    /**
     * Generate PDF for invoice
     */
    async generateInvoicePDF(invoiceId) {
        try {
            const response = await api.get(`/invoices/${invoiceId}/generate-pdf`, {
                responseType: 'blob'
            });
            
            if (this.showToast) {
                this.showToast("Success", "PDF generated successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: 'PDF generated successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to generate PDF');
        }
    }

    /**
     * Send invoice via email
     */
    async sendInvoiceEmail(invoiceId, emailData) {
        try {
            const response = await api.post(`/invoices/${invoiceId}/send-email`, JSON.stringify(emailData));
            
            if (this.showToast) {
                this.showToast("Success", "Invoice sent via email successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Invoice sent successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to send invoice via email');
        }
    }

    /**
     * Export invoices to Excel/CSV
     */
    async exportInvoices(format = 'excel', filters = {}) {
        try {
            const response = await api.get('/invoices/export', {
                params: { format, ...filters },
                responseType: 'blob'
            });
            
            if (this.showToast) {
                this.showToast("Success", `Invoices exported as ${format.toUpperCase()} successfully!`, "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: `Invoices exported as ${format.toUpperCase()} successfully` 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to export invoices');
        }
    }

    // ===== DASHBOARD & ANALYTICS =====

    /**
     * Get invoice dashboard statistics
     */
    async getInvoiceStats(timeframe = 'monthly') {
        try {
            const response = await api.get('/invoices/dashboard/stats', {
                params: { timeframe }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Statistics fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch invoice statistics');
        }
    }

    /**
     * Get revenue analytics
     */
    async getRevenueAnalytics(startDate, endDate, groupBy = 'monthly') {
        try {
            const response = await api.get('/invoices/analytics/revenue', {
                params: { start_date: startDate, end_date: endDate, group_by: groupBy }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Revenue analytics fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch revenue analytics');
        }
    }

    /**
     * Get customer analytics
     */
    async getCustomerAnalytics() {
        try {
            const response = await api.get('/invoices/analytics/customers');
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer analytics fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer analytics');
        }
    }

    // ===== PAYMENT TRACKING =====

    /**
     * Record invoice payment
     */
    async recordInvoicePayment(invoiceId, paymentData) {
        try {
            const response = await api.post(`/invoices/${invoiceId}/record-payment`, JSON.stringify(paymentData));
            
            if (this.showToast) {
                this.showToast("Success", "Payment recorded successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Payment recorded successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to record payment');
        }
    }

    /**
     * Get payment history for invoice
     */
    async getInvoicePaymentHistory(invoiceId) {
        try {
            const response = await api.get(`/invoices/${invoiceId}/payments`);
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Payment history fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch payment history');
        }
    }

    // ===== LOCAL STORAGE MANAGEMENT =====

    /**
     * Store invoice data to local storage
     */
    async storeInvoiceData(invoiceData) {
        // try {
        //     const data = typeof invoiceData === 'string' ? JSON.parse(invoiceData) : invoiceData;
        //     await AsyncStorage.setItem('invoice_data', JSON.stringify(data));
        //     console.log('Invoice data stored successfully');
        //     return { success: true, data };
        // } catch (error) {
        //     console.error('Error storing invoice data:', error);
        //     return this.handleError(error, 'Failed to store invoice data');
        // }
    }

    /**
     * Get stored invoice data from local storage
     */
    async getStoredInvoiceData() {
        // try {
        //     const invoiceData = await AsyncStorage.getItem('invoice_data');
        //     return invoiceData ? JSON.parse(invoiceData) : null;
        // } catch (error) {
        //     console.error('Error getting invoice data:', error);
        //     return null;
        // }
    }

    /**
     * Store customer data to local storage
     */
    async storeCustomerData(customerData) {
        // try {
        //     const data = typeof customerData === 'string' ? JSON.parse(customerData) : customerData;
        //     await AsyncStorage.setItem('customer_data', JSON.stringify(data));
        //     console.log('Customer data stored successfully');
        //     return { success: true, data };
        // } catch (error) {
        //     console.error('Error storing customer data:', error);
        //     return this.handleError(error, 'Failed to store customer data');
        // }
    }

    /**
     * Get stored customer data from local storage
     */
    async getStoredCustomerData() {
        // try {
        //     const customerData = await AsyncStorage.getItem('customer_data');
        //     return customerData ? JSON.parse(customerData) : null;
        // } catch (error) {
        //     console.error('Error getting customer data:', error);
        //     return null;
        // }
    }

    /**
     * Clear all invoice related data from local storage
     */
    async clearStoredData() {
        // try {
        //     await AsyncStorage.multiRemove([
        //         'invoice_data',
        //         'customer_data',
        //         'invoice_settings'
        //     ]);
        //     return { success: true };
        // } catch (error) {
        //     console.error('Error clearing invoice data:', error);
        //     return this.handleError(error, 'Failed to clear invoice data');
        // }
    }

    // ===== SETTINGS & PREFERENCES =====

    /**
     * Save invoice settings
     */
    async saveInvoiceSettings(settings) {
        try {
            const response = await api.post('/invoice-settings', JSON.stringify(settings));
            
            if (this.showToast) {
                this.showToast("Success", "Settings saved successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Settings saved successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to save settings');
        }
    }

    /**
     * Get invoice settings
     */
    async getInvoiceSettings() {
        try {
            const response = await api.get('/invoice-settings');
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Settings fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch settings');
        }
    }

    // ===== BULK OPERATIONS =====

    /**
     * Bulk create invoices
     */
    async bulkCreateInvoices(invoicesData) {
        try {
            const response = await api.post('/invoices/bulk-create', JSON.stringify(invoicesData));
            
            if (this.showToast) {
                this.showToast("Success", "Invoices created in bulk successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Invoices created successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to create invoices in bulk');
        }
    }

    /**
     * Bulk update invoices
     */
    async bulkUpdateInvoices(updateData) {
        try {
            const response = await api.put('/invoices/bulk-update', JSON.stringify(updateData));
            
            if (this.showToast) {
                this.showToast("Success", "Invoices updated in bulk successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Invoices updated successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update invoices in bulk');
        }
    }

    /**
     * Bulk delete invoices
     */
    async bulkDeleteInvoices(invoiceIds) {
        try {
            const response = await api.delete('/invoices/bulk-delete', {
                data: { invoice_ids: invoiceIds }
            });
            
            if (this.showToast) {
                this.showToast("Success", "Invoices deleted in bulk successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Invoices deleted successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to delete invoices in bulk');
        }
    }
}

export const invoiceService = new InvoiceService();