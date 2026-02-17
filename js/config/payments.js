/* ===========================
   PrimeMar - Payments Configuration
   =========================== */

const PAYMENTS = {
    // Paystack configuration
    PAYSTACK: {
        PUBLIC_KEY: 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY',
        SECRET_KEY: 'sk_test_YOUR_PAYSTACK_SECRET_KEY',
        CURRENCY: 'NGN',
        BASEURL: 'https://api.paystack.co',
    },

    // Flutterwave configuration
    FLUTTERWAVE: {
        PUBLIC_KEY: 'FLTR_PUB_TEST_YOUR_FLUTTERWAVE_PUBLIC_KEY',
        SECRET_KEY: 'FLTR_SECRET_TEST_YOUR_FLUTTERWAVE_SECRET_KEY',
        CURRENCY: 'USD',
        BASEURL: 'https://api.flutterwave.com/v3',
    },

    // Initialize payment handlers
    init: () => {
        PAYMENTS.loadPaystackScript();
        PAYMENTS.loadFlutterwaveScript();
    },

    // Load Paystack script
    loadPaystackScript: () => {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        document.head.appendChild(script);
    },

    // Load Flutterwave script
    loadFlutterwaveScript: () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.flutterwave.com/v3.js';
        document.head.appendChild(script);
    },

    // Process Paystack payment
    processPaystackPayment: async (amount, email, metadata = {}) => {
        try {
            return new Promise((resolve, reject) => {
                if (typeof PaystackPop === 'undefined') {
                    reject(new Error('Paystack script not loaded'));
                    return;
                }

                PaystackPop.setup({
                    key: PAYMENTS.PAYSTACK.PUBLIC_KEY,
                    email: email,
                    amount: amount * 100, // Amount in kobo
                    currency: 'NGN',
                    metadata: metadata,
                    onClose: () => {
                        reject(new Error('Payment cancelled'));
                    },
                    onSuccess: (transaction) => {
                        resolve({
                            success: true,
                            reference: transaction.reference,
                            transactionId: transaction.transaction,
                            amount: amount,
                        });
                    },
                });
                PaystackPop.openIframe();
            });
        } catch (error) {
            ERROR_HANDLER.handleAPIError(error);
            throw error;
        }
    },

    // Process Flutterwave payment
    processFlutterwavePayment: async (amount, email, currency = 'USD', metadata = {}) => {
        try {
            return new Promise((resolve, reject) => {
                if (typeof FlutterwaveCheckout === 'undefined') {
                    reject(new Error('Flutterwave script not loaded'));
                    return;
                }

                FlutterwaveCheckout({
                    public_key: PAYMENTS.FLUTTERWAVE.PUBLIC_KEY,
                    tx_ref: `FLW_${Date.now()}`,
                    amount: amount,
                    currency: currency,
                    payment_options: 'card,mobilemoney,ussd',
                    customer: {
                        email: email,
                        phone_number: metadata.phone || '',
                        name: metadata.name || '',
                    },
                    customizations: {
                        title: 'PrimeMar Payment',
                        description: metadata.description || 'Payment for PrimeMar',
                        logo: './assets/icons/primebird.svg',
                    },
                    callback: (data) => {
                        if (data.status === 'successful') {
                            resolve({
                                success: true,
                                reference: data.transaction_id,
                                amount: amount,
                                currency: currency,
                            });
                        } else {
                            reject(new Error('Payment failed'));
                        }
                    },
                    onclose: () => {
                        reject(new Error('Payment cancelled'));
                    },
                });
            });
        } catch (error) {
            ERROR_HANDLER.handleAPIError(error);
            throw error;
        }
    },

    // Verify Paystack payment
    verifyPaystackPayment: async (reference) => {
        try {
            // This should be called from backend for security
            console.warn('Payment verification should be done from backend');
            return { verified: true, reference };
        } catch (error) {
            ERROR_HANDLER.handleAPIError(error);
            throw error;
        }
    },

    // Verify Flutterwave payment
    verifyFlutterwavePayment: async (transactionId) => {
        try {
            // This should be called from backend for security
            console.warn('Payment verification should be done from backend');
            return { verified: true, transactionId };
        } catch (error) {
            ERROR_HANDLER.handleAPIError(error);
            throw error;
        }
    },
};

// Initialize payment handlers when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PAYMENTS.init);
} else {
    PAYMENTS.init();
}

// Export payments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PAYMENTS };
}
