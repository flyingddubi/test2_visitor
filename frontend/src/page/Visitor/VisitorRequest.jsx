import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import PrivacyConsent from "../../components/PrivacyConsent/PrivacyConsent";

function VisitorRequest() {
  const navigate = useNavigate();
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [formData, setFormData] = useState({
    visitorName: "",
    visitorPhone: "",
    visitorCompany: "",
    visitorEmail: "",
    visitDate: "",
    visitPurpose: "",
    internalContact: "",
    location: "",
  });
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // 전화번호 입력 시 과거 방문 기록 자동 불러오기
  const handlePhoneChange = async (phone) => {
    if (phone.length >= 10) {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/visitor-request/history/${phone}`
        );
        if (response.data.success && response.data.data) {
          const history = response.data.data;
          setFormData((prev) => ({
            ...prev,
            visitorName: history.visitorName || prev.visitorName,
            visitorCompany: history.visitorCompany || prev.visitorCompany,
            visitPurpose: history.visitPurpose || prev.visitPurpose,
            internalContact: history.internalContact || prev.internalContact,
            location: history.location || prev.location,
          }));
          Swal.fire({
            icon: "info",
            title: "과거 방문 기록",
            text: "이전 방문 정보를 불러왔습니다.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        // 과거 기록이 없어도 에러로 처리하지 않음
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowPrivacyConsent(true);
  };

  const handlePrivacyConsent = async () => {
    setPrivacyConsent(true);
    setShowPrivacyConsent(false);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/visitor-request",
        {
          ...formData,
          privacyConsent: true,
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "등록 완료",
          text: response.data.message,
        });
        navigate("/");
      }
    } catch (error) {
      console.error("방문 요청 등록 실패:", error);
      Swal.fire({
        icon: "error",
        title: "오류",
        text: error.response?.data?.message || "등록 중 오류가 발생했습니다.",
      });
    }
  };

  // 공통 폼 필드
  const FormFields = () => (
    <>
      <div>
        <label
          htmlFor="visitorName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="visitorName"
          value={formData.visitorName}
          onChange={(e) =>
            setFormData({ ...formData, visitorName: e.target.value })
          }
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="이름을 입력하세요"
        />
      </div>

      <div>
        <label
          htmlFor="visitorPhone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          전화번호 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="visitorPhone"
          value={formData.visitorPhone}
          onChange={(e) => {
            setFormData({ ...formData, visitorPhone: e.target.value });
            handlePhoneChange(e.target.value);
          }}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="010-1234-5678"
        />
        <p className="mt-1 text-xs text-gray-500">
          전화번호를 입력하면 이전 방문 정보를 자동으로 불러옵니다.
        </p>
      </div>

      <div>
        <label
          htmlFor="visitorCompany"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          회사명
        </label>
        <input
          type="text"
          id="visitorCompany"
          value={formData.visitorCompany}
          onChange={(e) =>
            setFormData({ ...formData, visitorCompany: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="회사명을 입력하세요"
        />
      </div>

      <div>
        <label
          htmlFor="visitorEmail"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          이메일
        </label>
        <input
          type="email"
          id="visitorEmail"
          value={formData.visitorEmail}
          onChange={(e) =>
            setFormData({ ...formData, visitorEmail: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="email@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="visitDate"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          방문일자 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="visitDate"
          value={formData.visitDate}
          onChange={(e) =>
            setFormData({ ...formData, visitDate: e.target.value })
          }
          required
          min={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="visitPurpose"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          방문 목적 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="visitPurpose"
          value={formData.visitPurpose}
          onChange={(e) =>
            setFormData({ ...formData, visitPurpose: e.target.value })
          }
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="방문 목적을 입력하세요"
        />
      </div>

      <div>
        <label
          htmlFor="internalContact"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          내부 담당자
        </label>
        <input
          type="text"
          id="internalContact"
          value={formData.internalContact}
          onChange={(e) =>
            setFormData({ ...formData, internalContact: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="만날 내부 담당자 이름"
        />
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          방문 장소
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="방문할 장소 (예: 본관 3층 회의실)"
        />
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 모바일 버전 */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">방문 요청 등록</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormFields />
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                방문 요청 등록
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 웹 버전 */}
      <div className="hidden md:block">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">방문 요청 등록</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormFields />
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                방문 요청 등록
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPrivacyConsent && (
        <PrivacyConsent
          onConsent={handlePrivacyConsent}
          onCancel={() => setShowPrivacyConsent(false)}
        />
      )}
    </div>
  );
}

export default VisitorRequest;
