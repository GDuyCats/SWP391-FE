import PaymentStep from "../../components/PaymentStep";

/**
 * Page PaymentStepPage - Wrapper page cho PaymentStep component
 * 
 * Route: /listing/payment
 * 
 * Chức năng:
 * - Wrapper đơn giản để import PaymentStep component
 * - PaymentStep component xử lý thanh toán VNPay cho gói VIP
 * 
 * Flow:
 * User chọn gói VIP → thanh toán ở đây → VNPay redirect về success/fail page
 */
function PaymentStepPage() {
  return (
    <div className="page payment-step-page">
      <PaymentStep />
    </div>
  );
}

export default PaymentStepPage;
