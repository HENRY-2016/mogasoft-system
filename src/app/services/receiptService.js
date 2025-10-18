// services/ReceiptService.js
import axios from 'axios';
import {
    Message_400, Message_401, Message_403, Message_404,
    Message_405, Message_409, Message_422, Message_500,
    Message_503
} from './errorMsgs';
import { APIReceiptDelete, APIReceiptList, APIReceiptStore, APIReceiptUpdate } from '../utilities/APIS';
import { AUTH_TOKEN, BASE_URL, headers } from '../utilities/Env';

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

class ReceiptService {
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
     * Get all Receipt
     */
    async getReceipts() {
        try {
            const response = await api.get(APIReceiptList, headers);
            return {
                success: true,
                data: response.data,
                message: response.data?.message || 'Receipt fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch Receipt');
        }
    }

    /**
     * Get customer by ID
     */
    async getCustomerById(updateId) {
        try {
            const response = await api.get(`/Receipt/${updateId}`);
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
     * Create new receipt
     */
    async createReceipt(receiptData) {
        try {
            const response = await api.post(APIReceiptStore, JSON.stringify(receiptData));
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
     * Update  receipt
     */
    async updateReceipt(updateId, receiptData) {
        try {
            const response = await api.post(APIReceiptUpdate, {
                updateId: updateId,
                ...receiptData
            });

            return {
                success: true,
                data: response.data,
                message: response.data?.message || 'Receipt updated successfully'
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update receipt');
        }
    }

    /**
     * Delete Receipt
     */
    async deleteReceipt(updateId) {
        try {
            const response = await api.post(APIReceiptDelete, { updateId: updateId });
            return {
                success: true,
                data: response.data,
                message: response.data?.message || 'Receipt deleted successfully'
            };
        } catch (error) {
            return this.handleError(error, 'Failed to delete receipt');
        }
    }

    // ===== CUSTOMER SEARCH & FILTERS =====

    /**
     * Search Receipt
     */
    async searchReceipt(query, filters = {}) {
        try {
            const response = await api.get('/Receipt/search', {
                params: { q: query, ...filters }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Receipt search completed' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to search Receipt');
        }
    }

    /**
     * Get Receipt by status
     */
    async getReceiptByStatus(status = 'active') {
        try {
            const response = await api.get('/Receipt', {
                params: { status }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Receipt fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch Receipt by status');
        }
    }

    /**
     * Filter Receipt by various criteria
     */
    async filterReceipt(filters) {
        try {
            const response = await api.get('/Receipt/filter', {
                params: filters
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Receipt filtered successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to filter Receipt');
        }
    }

    // ===== CUSTOMER INVOICES =====

    /**
     * Get customer invoices
     */
    async getCustomerInvoices(updateId, status = 'all') {
        try {
            const response = await api.get(`/Receipt/${updateId}/invoices`, {
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
    async getCustomerInvoiceStats(updateId) {
        try {
            const response = await api.get(`/Receipt/${updateId}/invoice-stats`);
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
    async getCustomerPaymentHistory(updateId) {
        try {
            const response = await api.get(`/Receipt/${updateId}/payments`);
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
    async sendEmailToCustomer(updateId, emailData) {
        try {
            const response = await api.post(`/Receipt/${updateId}/send-email`, JSON.stringify(emailData));
            
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
    async sendSMSToCustomer(updateId, smsData) {
        try {
            const response = await api.post(`/Receipt/${updateId}/send-sms`, JSON.stringify(smsData));
            
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
    async getCustomerCommunicationHistory(updateId) {
        try {
            const response = await api.get(`/Receipt/${updateId}/communications`);
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
    async addCustomerNote(updateId, noteData) {
        try {
            const response = await api.post(`/Receipt/${updateId}/notes`, JSON.stringify(noteData));
            
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
    async getCustomerNotes(updateId) {
        try {
            const response = await api.get(`/Receipt/${updateId}/notes`);
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
    async updateCustomerNote(updateId, noteId, noteData) {
        try {
            const response = await api.put(`/Receipt/${updateId}/notes/${noteId}`, JSON.stringify(noteData));
            
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
    async deleteCustomerNote(updateId, noteId) {
        try {
            const response = await api.delete(`/Receipt/${updateId}/notes/${noteId}`);
            
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
     * Import Receipt from CSV/Excel
     */
    async importReceipt(fileData) {
        try {
            const formData = new FormData();
            formData.append('file', fileData);

            const response = await api.post('/Receipt/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (this.showToast) {
                this.showToast("Success", "Receipt imported successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Receipt imported successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to import Receipt');
        }
    }

    /**
     * Export Receipt to CSV/Excel
     */
    async exportReceipt(format = 'csv', filters = {}) {
        try {
            const response = await api.get('/Receipt/export', {
                params: { format, ...filters },
                responseType: 'blob'
            });
            
            if (this.showToast) {
                this.showToast("Success", `Receipt exported as ${format.toUpperCase()} successfully!`, "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: `Receipt exported as ${format.toUpperCase()} successfully` 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to export Receipt');
        }
    }

    /**
     * Download customer template
     */
    async downloadCustomerTemplate() {
        try {
            const response = await api.get('/Receipt/template', {
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
            const response = await api.get('/Receipt/analytics', {
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
            const response = await api.get('/Receipt/growth-stats', {
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
     * Get top Receipt by revenue
     */
    async getTopReceiptByRevenue(limit = 10, timeframe = 'all') {
        try {
            const response = await api.get('/Receipt/top-by-revenue', {
                params: { limit, timeframe }
            });
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Top Receipt fetched successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to fetch top Receipt');
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
    async addCustomerToGroup(updateId, groupId) {
        try {
            const response = await api.post(`/Receipt/${updateId}/groups/${groupId}`);
            
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
    async removeCustomerFromGroup(updateId, groupId) {
        try {
            const response = await api.delete(`/Receipt/${updateId}/groups/${groupId}`);
            
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
    async updateCustomerPreferences(updateId, preferences) {
        try {
            const response = await api.put(`/Receipt/${updateId}/preferences`, JSON.stringify(preferences));
            
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
    async getCustomerPreferences(updateId) {
        try {
            const response = await api.get(`/Receipt/${updateId}/preferences`);
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
    async storereceiptData(receiptData) {
        // try {
        //     const data = typeof receiptData === 'string' ? JSON.parse(receiptData) : receiptData;
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
    async getStoredreceiptData() {
        // try {
        //     const receiptData = await AsyncStorage.getItem('customer_data');
        //     return receiptData ? JSON.parse(receiptData) : null;
        // } catch (error) {
        //     console.error('Error getting customer data:', error);
        //     return null;
        // }
    }

    /**
     * Store Receipt list to local storage
     */
    async storeReceiptList(Receipt) {
        // try {
        //     const data = typeof Receipt === 'string' ? JSON.parse(Receipt) : Receipt;
        //     await AsyncStorage.setItem('Receipt_list', JSON.stringify(data));
        //     console.log('Receipt list stored successfully');
        //     return { success: true, data };
        // } catch (error) {
        //     console.error('Error storing Receipt list:', error);
        //     return this.handleError(error, 'Failed to store Receipt list');
        // }
    }

    /**
     * Get stored Receipt list from local storage
     */
    async getStoredReceiptList() {
        // try {
        //     const Receipt = await AsyncStorage.getItem('Receipt_list');
        //     return Receipt ? JSON.parse(Receipt) : null;
        // } catch (error) {
        //     console.error('Error getting Receipt list:', error);
        //     return null;
        // }
    }

    /**
     * Clear customer data from local storage
     */
    async clearStoredreceiptData() {
        // try {
        //     await AsyncStorage.multiRemove([
        //         'customer_data',
        //         'Receipt_list',
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
     * Bulk create Receipt
     */
    async bulkCreateReceipt(ReceiptData) {
        try {
            const response = await api.post('/Receipt/bulk-create', JSON.stringify(ReceiptData));
            
            if (this.showToast) {
                this.showToast("Success", "Receipt created in bulk successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Receipt created successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to create Receipt in bulk');
        }
    }

    /**
     * Bulk update Receipt
     */
    async bulkUpdateReceipt(updateData) {
        try {
            const response = await api.put('/Receipt/bulk-update', JSON.stringify(updateData));
            
            if (this.showToast) {
                this.showToast("Success", "Receipt updated in bulk successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Receipt updated successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to update Receipt in bulk');
        }
    }

    /**
     * Bulk delete Receipt
     */
    async bulkDeleteReceipt(updateIds) {
        try {
            const response = await api.delete('/Receipt/bulk-delete', {
                data: { customer_ids: updateIds }
            });
            
            if (this.showToast) {
                this.showToast("Success", "Receipt deleted in bulk successfully!", "success");
            }
            
            return { 
                success: true, 
                data: response.data, 
                message: response.data?.message || 'Receipt deleted successfully' 
            };
        } catch (error) {
            return this.handleError(error, 'Failed to delete Receipt in bulk');
        }
    }

    // ===== CUSTOMER VALIDATION =====

    /**
     * Validate customer email
     */
    async validateCustomerEmail(email) {
        try {
            const response = await api.post('/Receipt/validate-email', JSON.stringify({ email }));
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
    async checkCustomerDuplicate(receiptData) {
        try {
            const response = await api.post('/Receipt/check-duplicate', JSON.stringify(receiptData));
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

export const receiptService = new ReceiptService();