import ChooseListing from "../../components/ChooseListing";

/**
 * Page ChooseListingPage - Wrapper page cho ChooseListing component
 * 
 * Route: /chooselisting
 * 
 * Chức năng:
 * - Wrapper đơn giản để import ChooseListing component
 * - ChooseListing component cho phép user chọn loại sản phẩm (Xe/Pin)
 * 
 * Flow:
 * User click "Đăng bài" ở Header → chọn loại ở đây → form tương ứng
 */
function ChooseListingPage() {
  return (
    <div className="page choose-listing-page">
      <ChooseListing />
    </div>
  );
}

export default ChooseListingPage;
