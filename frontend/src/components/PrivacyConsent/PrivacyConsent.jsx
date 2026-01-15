import { useState } from "react";
import Swal from "sweetalert2";

function PrivacyConsent({ onConsent, onCancel }) {
  const [isChecked, setIsChecked] = useState(false);

  const handleConfirm = () => {
    if (!isChecked) {
      Swal.fire({
        icon: "warning",
        title: "동의 필요",
        text: "개인정보 처리에 동의해주세요.",
      });
      return;
    }
    onConsent();
  };

  const ConsentContent = () => (
    <>
      <h2 className="text-2xl font-bold mb-4">개인정보 처리 동의</h2>

      <div className="space-y-4 text-sm">
        <section>
          <h3 className="font-bold text-lg mb-2">1. 수집 목적</h3>
          <p className="text-gray-700">
            방문자 출입 관리 및 보안을 위한 개인정보 수집
          </p>
        </section>

        <section>
          <h3 className="font-bold text-lg mb-2">2. 수집 항목</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>이름</li>
            <li>연락처 (전화번호)</li>
            <li>이메일 주소 (선택)</li>
            <li>회사명</li>
            <li>방문 목적</li>
            <li>방문 일시</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-lg mb-2">3. 보유 기간</h3>
          <p className="text-gray-700">
            방문일로부터 1년간 보관 후 파기 (단, 법령에 따라 보관이 필요한 경우
            해당 기간 동안 보관)
          </p>
        </section>

        <section>
          <h3 className="font-bold text-lg mb-2">4. 법적 근거</h3>
          <p className="text-gray-700">
            개인정보 보호법 제15조(개인정보의 수집·이용) 및 제22조(정보주체의
            동의)
          </p>
        </section>

        <section>
          <h3 className="font-bold text-lg mb-2">5. 제3자 제공</h3>
          <p className="text-gray-700">
            수집된 개인정보는 방문 관리 목적 외의 용도로 사용되지 않으며, 제3자에게
            제공되지 않습니다.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-lg mb-2">6. 동의 거부 권리</h3>
          <p className="text-gray-700">
            개인정보 수집·이용에 대한 동의를 거부할 수 있으나, 동의를 거부할 경우
            방문 요청 서비스를 이용하실 수 없습니다.
          </p>
        </section>
      </div>

      <div className="mt-6 flex items-center">
        <input
          type="checkbox"
          id="privacy-consent"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="privacy-consent"
          className="ml-2 text-sm text-gray-700"
        >
          위 개인정보 수집·이용에 동의합니다. (필수)
        </label>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* 모바일 버전 */}
      <div className="md:hidden bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <ConsentContent />
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleConfirm}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              동의하고 계속하기
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              취소
            </button>
          </div>
        </div>
      </div>

      {/* 웹 버전 */}
      <div className="hidden md:block bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <ConsentContent />
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              동의하고 계속하기
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyConsent;
