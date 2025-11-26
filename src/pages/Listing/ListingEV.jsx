import EVForm from "../../components/EVForm";

/**
 * Page ListingEV - Wrapper page cho EVForm component
 * 
 * Route: /listing/ev
 * 
 * Chức năng:
 * - Wrapper đơn giản để import EVForm component
 * - EVForm component xử lý việc nhập thông tin xe điện để đăng bán
 * 
 * Flow:
 * User chọn "Xe Điện" ở ChooseListing → điền form ở đây → chọn gói VIP
 */
function ListingEV() {
  return (
    <div className="page listing-ev-page">
      <EVForm />
    </div>
  );
}

export default ListingEV;
