// services/customerService.js
import axios from 'axios';
import {
    Message_400, Message_401, Message_403, Message_404,
    Message_405, Message_409, Message_422, Message_500,
    Message_503
} from './errorMsgs';
import { APICustomerList, APICustomerStore, APICustomerUpdate } from '../utilities/APIS';
import { AUTH_TOKEN, BASE_URL } from '../utilities/Env';

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

class CustomerService {
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

    // ===== CUSTOMER CRUD OPERATIONS =====

    /**
     * Get all customers
     */
    async getCustomers(filters = {}) {
        try {
            const response = await api.get(APICustomerList, { params: filters });
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
     * Get customer by ID
     */
    async getCustomerById(customerId) {
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

    /**
     * Create new customer
     */
    async createCustomer(customerData) {
        try {
            const response = await api.post(APICustomerStore, JSON.stringify(customerData));
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
            const response = await api.post(APICustomerUpdate, {
                updateId: customerId,
                ...customerData
            });

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

    // ===== CUSTOMER SEARCH & FILTERS =====

    /**
     * Search customers
     */
    async searchCustomers(query, filters = {}) {
        try {
            const response = await api.get('/customers/search', {
                params: { q: query, ...filters }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customers search completed' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to search customers');
        }
    }

    /**
     * Get customers by status
     */
    async getCustomersByStatus(status = 'active') {
        try {
            const response = await api.get('/customers', {
                params: { status }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customers fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customers by status');
        }
    }

    /**
     * Filter customers by various criteria
     */
    async filterCustomers(filters) {
        try {
            const response = await api.get('/customers/filter', {
                params: filters
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customers filtered successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to filter customers');
        }
    }

    // ===== CUSTOMER INVOICES =====

    /**
     * Get customer invoices
     */
    async getCustomerInvoices(customerId, status = 'all') {
        try {
            const response = await api.get(`/customers/${customerId}/invoices`, {
                params: { status }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer invoices fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer invoices');
        }
    }

    /**
     * Get customer invoice statistics
     */
    async getCustomerInvoiceStats(customerId) {
        try {
            const response = await api.get(`/customers/${customerId}/invoice-stats`);
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer invoice statistics fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer invoice statistics');
        }
    }

    /**
     * Get customer payment history
     */
    async getCustomerPaymentHistory(customerId) {
        try {
            const response = await api.get(`/customers/${customerId}/payments`);
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer payment history fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer payment history');
        }
    }

    // ===== CUSTOMER COMMUNICATION =====

    /**
     * Send email to customer
     */
    async sendEmailToCustomer(customerId, emailData) {
        try {
            const response = await api.post(`/customers/${customerId}/send-email`, JSON.stringify(emailData));
            
            if (this.showToast) {
                this.showToast("Success", "Email sent to customer successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Email sent successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to send email to customer');
        }
    }

    /**
     * Send SMS to customer
     */
    async sendSMSToCustomer(customerId, smsData) {
        try {
            const response = await api.post(`/customers/${customerId}/send-sms`, JSON.stringify(smsData));
            
            if (this.showToast) {
                this.showToast("Success", "SMS sent to customer successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'SMS sent successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to send SMS to customer');
        }
    }

    /**
     * Get customer communication history
     */
    async getCustomerCommunicationHistory(customerId) {
        try {
            const response = await api.get(`/customers/${customerId}/communications`);
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Communication history fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch communication history');
        }
    }

    // ===== CUSTOMER NOTES & REMARKS =====

    /**
     * Add note to customer
     */
    async addCustomerNote(customerId, noteData) {
        try {
            const response = await api.post(`/customers/${customerId}/notes`, JSON.stringify(noteData));
            
            if (this.showToast) {
                this.showToast("Success", "Note added successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Note added successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to add note');
        }
    }

    /**
     * Get customer notes
     */
    async getCustomerNotes(customerId) {
        try {
            const response = await api.get(`/customers/${customerId}/notes`);
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer notes fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer notes');
        }
    }

    /**
     * Update customer note
     */
    async updateCustomerNote(customerId, noteId, noteData) {
        try {
            const response = await api.put(`/customers/${customerId}/notes/${noteId}`, JSON.stringify(noteData));
            
            if (this.showToast) {
                this.showToast("Success", "Note updated successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Note updated successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update note');
        }
    }

    /**
     * Delete customer note
     */
    async deleteCustomerNote(customerId, noteId) {
        try {
            const response = await api.delete(`/customers/${customerId}/notes/${noteId}`);
            
            if (this.showToast) {
                this.showToast("Success", "Note deleted successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Note deleted successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to delete note');
        }
    }

    // ===== CUSTOMER IMPORT/EXPORT =====

    /**
     * Import customers from CSV/Excel
     */
    async importCustomers(fileData) {
        try {
            const formData = new FormData();
            formData.append('file', fileData);

            const response = await api.post('/customers/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (this.showToast) {
                this.showToast("Success", "Customers imported successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customers imported successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to import customers');
        }
    }

    /**
     * Export customers to CSV/Excel
     */
    async exportCustomers(format = 'csv', filters = {}) {
        try {
            const response = await api.get('/customers/export', {
                params: { format, ...filters },
                responseType: 'blob'
            });
            
            if (this.showToast) {
                this.showToast("Success", `Customers exported as ${format.toUpperCase()} successfully!`, "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: `Customers exported as ${format.toUpperCase()} successfully` 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to export customers');
        }
    }

    /**
     * Download customer template
     */
    async downloadCustomerTemplate() {
        try {
            const response = await api.get('/customers/template', {
                responseType: 'blob'
            });
            
            return { 
                success: true, 
                data: response.data, 
                message: 'Template downloaded successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to download template');
        }
    }

    // ===== CUSTOMER ANALYTICS & REPORTS =====

    /**
     * Get customer analytics
     */
    async getCustomerAnalytics(timeframe = 'monthly') {
        try {
            const response = await api.get('/customers/analytics', {
                params: { timeframe }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer analytics fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer analytics');
        }
    }

    /**
     * Get customer growth statistics
     */
    async getCustomerGrowthStats(startDate, endDate) {
        try {
            const response = await api.get('/customers/growth-stats', {
                params: { start_date: startDate, end_date: endDate }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer growth statistics fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer growth statistics');
        }
    }

    /**
     * Get top customers by revenue
     */
    async getTopCustomersByRevenue(limit = 10, timeframe = 'all') {
        try {
            const response = await api.get('/customers/top-by-revenue', {
                params: { limit, timeframe }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Top customers fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch top customers');
        }
    }

    // ===== CUSTOMER GROUPS & TAGS =====

    /**
     * Get customer groups
     */
    async getCustomerGroups() {
        try {
            const response = await api.get('/customer-groups');
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer groups fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer groups');
        }
    }

    /**
     * Create customer group
     */
    async createCustomerGroup(groupData) {
        try {
            const response = await api.post('/customer-groups', JSON.stringify(groupData));
            
            if (this.showToast) {
                this.showToast("Success", "Customer group created successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer group created successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to create customer group');
        }
    }

    /**
     * Add customer to group
     */
    async addCustomerToGroup(customerId, groupId) {
        try {
            const response = await api.post(`/customers/${customerId}/groups/${groupId}`);
            
            if (this.showToast) {
                this.showToast("Success", "Customer added to group successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer added to group successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to add customer to group');
        }
    }

    /**
     * Remove customer from group
     */
    async removeCustomerFromGroup(customerId, groupId) {
        try {
            const response = await api.delete(`/customers/${customerId}/groups/${groupId}`);
            
            if (this.showToast) {
                this.showToast("Success", "Customer removed from group successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer removed from group successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to remove customer from group');
        }
    }

    // ===== CUSTOMER SETTINGS & PREFERENCES =====

    /**
     * Update customer preferences
     */
    async updateCustomerPreferences(customerId, preferences) {
        try {
            const response = await api.put(`/customers/${customerId}/preferences`, JSON.stringify(preferences));
            
            if (this.showToast) {
                this.showToast("Success", "Customer preferences updated successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer preferences updated successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update customer preferences');
        }
    }

    /**
     * Get customer preferences
     */
    async getCustomerPreferences(customerId) {
        try {
            const response = await api.get(`/customers/${customerId}/preferences`);
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customer preferences fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch customer preferences');
        }
    }

    // ===== LOCAL STORAGE MANAGEMENT =====

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
     * Store customers list to local storage
     */
    async storeCustomersList(customers) {
        // try {
        //     const data = typeof customers === 'string' ? JSON.parse(customers) : customers;
        //     await AsyncStorage.setItem('customers_list', JSON.stringify(data));
        //     console.log('Customers list stored successfully');
        //     return { success: true, data };
        // } catch (error) {
        //     console.error('Error storing customers list:', error);
        //     return this.handleError(error, 'Failed to store customers list');
        // }
    }

    /**
     * Get stored customers list from local storage
     */
    async getStoredCustomersList() {
        // try {
        //     const customers = await AsyncStorage.getItem('customers_list');
        //     return customers ? JSON.parse(customers) : null;
        // } catch (error) {
        //     console.error('Error getting customers list:', error);
        //     return null;
        // }
    }

    /**
     * Clear customer data from local storage
     */
    async clearStoredCustomerData() {
        // try {
        //     await AsyncStorage.multiRemove([
        //         'customer_data',
        //         'customers_list',
        //         'customer_preferences'
        //     ]);
        //     return { success: true };
        // } catch (error) {
        //     console.error('Error clearing customer data:', error);
        //     return this.handleError(error, 'Failed to clear customer data');
        // }
    }

    // ===== BULK OPERATIONS =====

    /**
     * Bulk create customers
     */
    async bulkCreateCustomers(customersData) {
        try {
            const response = await api.post('/customers/bulk-create', JSON.stringify(customersData));
            
            if (this.showToast) {
                this.showToast("Success", "Customers created in bulk successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customers created successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to create customers in bulk');
        }
    }

    /**
     * Bulk update customers
     */
    async bulkUpdateCustomers(updateData) {
        try {
            const response = await api.put('/customers/bulk-update', JSON.stringify(updateData));
            
            if (this.showToast) {
                this.showToast("Success", "Customers updated in bulk successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customers updated successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update customers in bulk');
        }
    }

    /**
     * Bulk delete customers
     */
    async bulkDeleteCustomers(customerIds) {
        try {
            const response = await api.delete('/customers/bulk-delete', {
                data: { customer_ids: customerIds }
            });
            
            if (this.showToast) {
                this.showToast("Success", "Customers deleted in bulk successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Customers deleted successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to delete customers in bulk');
        }
    }

    // ===== CUSTOMER VALIDATION =====

    /**
     * Validate customer email
     */
    async validateCustomerEmail(email) {
        try {
            const response = await api.post('/customers/validate-email', JSON.stringify({ email }));
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Email validation completed' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to validate email');
        }
    }

    /**
     * Check customer duplicate
     */
    async checkCustomerDuplicate(customerData) {
        try {
            const response = await api.post('/customers/check-duplicate', JSON.stringify(customerData));
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Duplicate check completed' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to check duplicate');
        }
    }
}

export const customerService = new CustomerService();