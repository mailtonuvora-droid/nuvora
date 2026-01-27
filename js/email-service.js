/**
 * Nuvora Email Service
 * Handles all email notifications using EmailJS
 * 
 * Setup Instructions:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Add your email service (Gmail recommended)
 * 3. Create templates for each notification type
 * 4. Update the configuration below with your credentials
 */

// EmailJS Configuration
// TODO: Replace with your actual EmailJS credentials
const EMAIL_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',        // Get from EmailJS dashboard
    publicKey: 'YOUR_PUBLIC_KEY',        // Get from EmailJS dashboard
    templates: {
        orderConfirmation: 'YOUR_ORDER_TEMPLATE_ID',
        statusUpdate: 'YOUR_STATUS_TEMPLATE_ID',
        stockAlert: 'YOUR_STOCK_TEMPLATE_ID'
    },
    enabled: false  // Set to true after configuring EmailJS
};

// Initialize EmailJS when script loads
if (EMAIL_CONFIG.enabled && typeof emailjs !== 'undefined') {
    emailjs.init(EMAIL_CONFIG.publicKey);
    console.log('📧 Email service initialized');
} else {
    console.log('📧 Email service disabled - configure EMAIL_CONFIG to enable');
}

/**
 * Send Order Confirmation Email
 * @param {Object} orderData - Order details
 * @param {string} orderData.customerName - Customer's full name
 * @param {string} orderData.email - Customer's email address
 * @param {string} orderData.orderId - Order ID
 * @param {number} orderData.total - Total amount
 * @param {string} orderData.paymentMethod - Payment method (COD/Online)
 * @param {Array} orderData.items - Array of order items
 * @param {string} orderData.shippingAddress - Full shipping address
 */
async function sendOrderConfirmation(orderData) {
    if (!EMAIL_CONFIG.enabled) {
        console.log('📧 Email disabled - Order confirmation not sent');
        return { success: false, message: 'Email service not configured' };
    }

    if (!orderData.email) {
        console.log('📧 No email provided - Order confirmation not sent');
        return { success: false, message: 'No email address provided' };
    }

    try {
        // Format items for email
        const itemsList = orderData.items.map(item =>
            `${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');

        const templateParams = {
            to_email: orderData.email,
            customer_name: orderData.customerName,
            order_id: orderData.orderId,
            total: `₹${orderData.total.toFixed(2)}`,
            payment_method: orderData.paymentMethod,
            items_list: itemsList,
            shipping_address: orderData.shippingAddress,
            tracking_link: `${window.location.origin}/order-tracking.html?id=${orderData.orderId}`,
            order_date: new Date().toLocaleDateString('en-IN')
        };

        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templates.orderConfirmation,
            templateParams
        );

        console.log('✅ Order confirmation email sent:', response);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('❌ Failed to send order confirmation email:', error);
        return { success: false, message: error.text || error.message };
    }
}

/**
 * Send Order Status Update Email
 * @param {Object} orderData - Order details
 * @param {string} newStatus - New order status
 */
async function sendStatusUpdate(orderData, newStatus) {
    if (!EMAIL_CONFIG.enabled) {
        console.log('📧 Email disabled - Status update not sent');
        return { success: false, message: 'Email service not configured' };
    }

    if (!orderData.user_email && !orderData.email) {
        console.log('📧 No email in order - Status update not sent');
        return { success: false, message: 'No email address in order' };
    }

    try {
        // Status-specific messages
        const statusMessages = {
            'pending': 'Your order has been received and is being processed.',
            'processing': 'Your order is being prepared for shipment.',
            'shipped': 'Your order has been shipped and is on its way!',
            'delivered': 'Your order has been delivered. Thank you for shopping with Nuvora!',
            'cancelled': 'Your order has been cancelled. If you have any questions, please contact us.'
        };

        const templateParams = {
            to_email: orderData.user_email || orderData.email,
            customer_name: orderData.customer_name || 'Customer',
            order_id: orderData.id,
            status: newStatus.toUpperCase(),
            status_message: statusMessages[newStatus] || 'Your order status has been updated.',
            tracking_link: `${window.location.origin}/order-tracking.html?id=${orderData.id}`,
            tracking_number: orderData.tracking_number || 'N/A',
            update_date: new Date().toLocaleDateString('en-IN')
        };

        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templates.statusUpdate,
            templateParams
        );

        console.log('✅ Status update email sent:', response);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('❌ Failed to send status update email:', error);
        return { success: false, message: error.text || error.message };
    }
}

/**
 * Send Stock Availability Alert
 * @param {Object} productData - Product details
 * @param {string} userEmail - User's email address
 */
async function sendStockAlert(productData, userEmail) {
    if (!EMAIL_CONFIG.enabled) {
        console.log('📧 Email disabled - Stock alert not sent');
        return { success: false, message: 'Email service not configured' };
    }

    try {
        const templateParams = {
            to_email: userEmail,
            product_name: productData.name,
            product_price: `₹${productData.price.toFixed(2)}`,
            product_image: productData.image_url || '',
            product_link: `${window.location.origin}/shop-detail.html?id=${productData.id}`,
            discount: productData.discount || 0,
            stock_date: new Date().toLocaleDateString('en-IN')
        };

        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templates.stockAlert,
            templateParams
        );

        console.log('✅ Stock alert email sent:', response);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('❌ Failed to send stock alert email:', error);
        return { success: false, message: error.text || error.message };
    }
}

/**
 * Test email configuration
 * Sends a test email to verify setup
 */
async function testEmailService() {
    if (!EMAIL_CONFIG.enabled) {
        console.log('📧 Email service is disabled. Enable it in EMAIL_CONFIG to test.');
        return;
    }

    console.log('📧 Testing email service...');

    const testData = {
        customerName: 'Test Customer',
        email: 'mailtonuvora@gmail.com',
        orderId: 'TEST123',
        total: 500,
        paymentMethod: 'COD',
        items: [
            { name: 'Test Product', quantity: 1, price: 500 }
        ],
        shippingAddress: 'Test Address, Test City, Test State - 123456'
    };

    const result = await sendOrderConfirmation(testData);
    console.log('Test result:', result);
}

// Export functions for use in other scripts
window.EmailService = {
    sendOrderConfirmation,
    sendStatusUpdate,
    sendStockAlert,
    testEmailService,
    config: EMAIL_CONFIG
};

console.log('📧 Email Service loaded');
