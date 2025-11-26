import PackageSelection from "../../components/PackageSelection";

/**
 * Page PackageSelectionPage - Wrapper page cho PackageSelection component
 * 
 * Route: /listing/package
 * 
 * Chức năng:
 * - Wrapper đơn giản để import PackageSelection component
 * - PackageSelection component xử lý việc chọn gói VIP cho bài đăng
 * 
 * Flow:
 * User tạo bài → chọn gói VIP ở đây → thanh toán
 */
function PackageSelectionPage() {
  return (
    <div className="page package-selection-page">
      <PackageSelection />
    </div>
  );
}

export default PackageSelectionPage;
