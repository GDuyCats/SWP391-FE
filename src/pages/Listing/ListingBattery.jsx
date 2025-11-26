import BatteryForm from "../../components/BatteryForm";

/**
 * Page ListingBattery - Wrapper page cho BatteryForm component
 * 
 * Route: /listing/battery
 * 
 * Chức năng:
 * - Wrapper đơn giản để import BatteryForm component
 * - BatteryForm component xử lý việc nhập thông tin pin để đăng bán
 * 
 * Flow:
 * User chọn "Pin" ở ChooseListing → điền form ở đây → chọn gói VIP
 */
function ListingBattery() {
  return (
    <div className="page listing-battery-page">
      <BatteryForm />
    </div>
  );
}

export default ListingBattery;
