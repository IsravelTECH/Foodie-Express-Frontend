/**
 * Foodie Express - Payment & Checkout Controller
 */

const PaymentController = (() => {
  let selectedMethod = 'GPay';

  /**
   * Initialize Payment Page
   */
  const init = () => {
    const totalAmount = localStorage.getItem('paymentTotal') || '0.00';
    const totalEl = document.getElementById('totalAmount');
    const modalTotalEl = document.getElementById('modalTotal');
    const user = JSON.parse(localStorage.getItem('user'));
    const phoneInput = document.getElementById('phone');

    if (totalEl) totalEl.textContent = totalAmount;
    if (modalTotalEl) modalTotalEl.textContent = totalAmount;
    if (phoneInput && user && user.phone) phoneInput.value = user.phone;

    // Payment method card selection
    document.querySelectorAll('.payment-method-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          selectedMethod = radio.value;
        }
      });
    });
  };

  /**
   * Confirm Payment & Open Method Modal
   */
  const confirmPayment = () => {
    const phone = document.getElementById('phone')?.value.trim();
    const checkedRadio = document.querySelector('input[name="payment"]:checked');
    const method = checkedRadio ? checkedRadio.value : selectedMethod;

    if (!phone) {
      FoodieApp.showToast('Please enter your contact phone number.', 'warning');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      FoodieApp.showToast('Please enter a valid 10-digit phone number.', 'warning');
      return;
    }

    // Configure Modal UI
    const modal = document.getElementById('paymentModal');
    const gpayLogo = document.querySelector('.gpay-logo');
    const phonepeLogo = document.querySelector('.phonepe-logo');
    const upiInput = document.getElementById('upiId');
    const modalTitle = document.getElementById('modalPaymentTitle');

    if (gpayLogo) gpayLogo.style.display = method === 'GPay' ? 'block' : 'none';
    if (phonepeLogo) phonepeLogo.style.display = method === 'PhonePe' ? 'block' : 'none';
    if (upiInput) {
      upiInput.style.display = method === 'COD' ? 'none' : 'block';
      upiInput.placeholder = method === 'Card' ? 'Enter 16-digit Card Number' : 'Enter your UPI ID (e.g. name@okhdfcbank)';
    }

    if (modalTitle) {
      modalTitle.textContent = method === 'COD' ? 'Confirm Cash on Delivery' : `Pay via ${method}`;
    }

    FoodieApp.openModal('paymentModal');
  };

  /**
   * Finalize Payment & Call Spring Boot /api/payment Endpoint
   */
  const payNow = async () => {
    const phone = document.getElementById('phone')?.value.trim();
    const checkedRadio = document.querySelector('input[name="payment"]:checked');
    const method = checkedRadio ? checkedRadio.value : selectedMethod;
    const upiInput = document.getElementById('upiId');
    const upi = method !== 'COD' ? upiInput?.value.trim() : null;
    const totalAmount = localStorage.getItem('paymentTotal') || '0.00';
    const payBtn = document.querySelector('.pay-btn');

    const addressInput = document.getElementById('address');
    const address = addressInput?.value.trim() || 'Foodie Express Delivery Address';
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const pendingCart = localStorage.getItem('pendingOrder') || localStorage.getItem('cart') || '[]';

    if (!phone || !method) {
      FoodieApp.showToast('Please verify your phone number and selected method.', 'warning');
      return;
    }

    if (method !== 'COD' && !upi) {
      FoodieApp.showToast(method === 'Card' ? 'Please enter your card number.' : 'Please enter your UPI ID.', 'warning');
      return;
    }

    if (payBtn) {
      payBtn.disabled = true;
      payBtn.textContent = 'Processing Payment... 💳';
    }

    const paymentData = {
      phone,
      paymentMethod: method,
      totalAmount: parseFloat(totalAmount),
      upiId: upi
    };

    const orderData = {
      name: user.name || 'Foodie Customer',
      email: user.email || 'customer@foodie.com',
      phone: phone,
      address: address,
      cartJson: pendingCart
    };

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      // 1. Submit Order to Spring Boot
      try {
        await fetch(`${FoodieApp.API_BASE}/api/order`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(orderData)
        });
      } catch (errOrder) {
        console.warn('Order sync warning:', errOrder);
      }

      // 2. Submit Payment to Spring Boot
      const res = await fetch(`${FoodieApp.API_BASE}/api/payment`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(paymentData)
      });

      const resultText = await res.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch {
        result = { message: resultText };
      }

      if (res.ok) {
        FoodieApp.showToast('🎉 Payment & Order placed successfully!', 'success');

        // Store last order receipt info
        localStorage.setItem('lastOrderReceipt', JSON.stringify({
          orderId: 'FE-' + Math.floor(100000 + Math.random() * 900000),
          amount: totalAmount,
          method: method,
          phone: phone,
          address: address,
          date: new Date().toLocaleString()
        }));

        // Clean cart state
        localStorage.removeItem('cart');
        localStorage.removeItem('paymentTotal');
        localStorage.removeItem('pendingOrder');

        setTimeout(() => {
          window.location.href = 'success.html';
        }, 1200);
      } else {
        FoodieApp.showToast(`Payment failed: ${result.message || 'Please retry'}`, 'error');
      }
    } catch (err) {
      console.error('Payment error:', err);
      FoodieApp.showToast('Payment failed due to server connection error.', 'error');
    } finally {
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = 'Pay Now';
      }
    }
  };

  return {
    init,
    confirmPayment,
    payNow
  };
})();

// Global aliases for payment buttons
function confirmPayment() {
  PaymentController.confirmPayment();
}
function payNow() {
  PaymentController.payNow();
}

