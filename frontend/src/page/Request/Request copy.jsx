import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PrivacyConsent from "../../components/PrivacyConsent/PrivacyConsent";

function VisitorRequest() {
    const [formData, setFormData] = useState({
        visitorName: "",
        visitorPhone: "",
        visitorCompany: "",
        visitorEmail: "",
        visitDateFrom: "",
        visitDateTo: "",
        visitPurpose: "",
        internalContact: "",
        location: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 개인정보 동의 확인
        setShowPrivacyConsent(true);
    };

    const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
    const [additionalVisitors, setAdditionalVisitors] = useState([]);
    const [showVisitorModal, setShowVisitorModal] = useState(false);
    const [visitorFormData, setVisitorFormData] = useState({
        visitorName: "",
        visitorPhone: "",
        visitorCompany: "",
        visitorEmail: "",
        visitDateFrom: "",
        visitDateTo: "",
    });
    const [useSameCompany, setUseSameCompany] = useState(false);
    const [useSameDate, setUseSameDate] = useState(false);

    // 전화번호 입력 시 과거 방문 기록 자동 불러오기
    const handlePhoneChange = async (phone) => {
        if (phone.length >= 10) {
            try {
                const response = await axios.get(
                    `http://localhost:3001/api/visitorRequest/history/${phone}`
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

    const handlePrivacyConsent = async () => {
        setShowPrivacyConsent(false);

        try {
            const response = await axios.post(
                "http://localhost:3001/api/request",
                {
                    ...formData,
                    businessId: "REQ",
                    privacyConsent: true,
                    additionalVisitors: additionalVisitors,
                }
            );

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "등록 완료",
                    text: response.data.message,
                });
                setFormData({
                    visitorName: "",
                    visitorPhone: "",
                    visitorCompany: "",
                    visitorEmail: "",
                    visitDateFrom: "",
                    visitDateTo: "",
                    visitPurpose: "",
                    internalContact: "",
                    location: "",
                });
                setAdditionalVisitors([]);
            }
        } catch (error) {
            console.error("방문 요청 등록 실패:", error);
            Swal.fire({
                icon: "error",
                title: "등록 실패",
                text: error.response?.data?.message || "등록 중 오류가 발생했습니다.",
            });
        }
    };

    const handleVisitorFormChange = (e) => {
        setVisitorFormData({
            ...visitorFormData,
            [e.target.name]: e.target.value,
        });
    };

    const handleOpenVisitorModal = () => {
        setVisitorFormData({
            visitorName: "",
            visitorPhone: "",
            visitorCompany: "",
            visitorEmail: "",
            visitDateFrom: "",
            visitDateTo: "",
        });
        setUseSameCompany(false);
        setUseSameDate(false);
        setShowVisitorModal(true);
    };

    const handleCloseVisitorModal = () => {
        setShowVisitorModal(false);
        setVisitorFormData({
            visitorName: "",
            visitorPhone: "",
            visitorCompany: "",
            visitorEmail: "",
            visitDateFrom: "",
            visitDateTo: "",
        });
        setUseSameCompany(false);
        setUseSameDate(false);
    };

    const handleAddVisitor = () => {
        const newVisitor = {
            ...visitorFormData,
            visitorCompany: useSameCompany ? formData.visitorCompany : visitorFormData.visitorCompany,
            visitDateFrom: useSameDate ? formData.visitDateFrom : visitorFormData.visitDateFrom,
            visitDateTo: useSameDate ? formData.visitDateTo : visitorFormData.visitDateTo,
        };

        // 필수 필드 검증
        if (!newVisitor.visitorName || !newVisitor.visitorPhone || !newVisitor.visitorEmail || !newVisitor.visitDateFrom || !newVisitor.visitDateTo) {
            Swal.fire({
                icon: "warning",
                title: "입력 오류",
                text: "모든 필수 항목을 입력해주세요.",
            });
            return;
        }

        setAdditionalVisitors([...additionalVisitors, newVisitor]);
        handleCloseVisitorModal();
    };

    const handleRemoveVisitor = (index) => {
        setAdditionalVisitors(additionalVisitors.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-white py-32">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                        방문 요청 등록
                    </h1>
                </div>

                <form
                            className="bg-white rounded-2xl shadow-xl p-8"
                            onSubmit={handleSubmit}
                        >
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        이름
                                    </label>
                                    <input
                                        type="text"
                                        name="visitorName"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300"
                                        placeholder="홍길동"
                                        required
                                        value={formData.visitorName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        전화번호
                                    </label>
                                    <input
                                        type="tel"
                                        name="visitorPhone"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300"
                                        placeholder="010-1234-5678"
                                        required
                                        value={formData.visitorPhone}
                                        onChange={(e) => {
                                            handleChange(e);
                                            handlePhoneChange(e.target.value);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        회사명
                                    </label>
                                    <input
                                        type="text"
                                        name="visitorCompany"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300"
                                        placeholder="회사명을 입력하세요"
                                        required
                                        value={formData.visitorCompany}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        이메일
                                    </label>
                                    <input
                                        type="email"
                                        name="visitorEmail"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300"
                                        placeholder="example@emxaple.com"
                                        required
                                        value={formData.visitorEmail}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        방문일자 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm text-gray-600 mb-1">From</label>
                                            <input
                                                type="date"
                                                name="visitDateFrom"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300"
                                                required
                                                min={new Date().toISOString().split("T")[0]}
                                                value={formData.visitDateFrom}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm text-gray-600 mb-1">To</label>
                                            <input
                                                type="date"
                                                name="visitDateTo"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300"
                                                required
                                                min={formData.visitDateFrom || new Date().toISOString().split("T")[0]}
                                                value={formData.visitDateTo}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        방문 목적
                                    </label>
                                    <textarea
                                        name="visitPurpose"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300 h-40"
                                        placeholder="방문 목적을 입력하세요."
                                        required
                                        value={formData.visitPurpose}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        내부 담당자
                                    </label>
                                    <input
                                        type="text"
                                        name="internalContact"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300"
                                        placeholder="만날 내부 담당자 이름"
                                        required
                                        value={formData.internalContact}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        방문 장소
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300"
                                        placeholder="방문할 장소 (예: 본관 3층 회의실)"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                    <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300 mt-20">
                                        방문 요청하기
                                    </button>
                                </div>
                            </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    방문자 추가
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleOpenVisitorModal}
                                    className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300 text-2xl font-bold"
                                >
                                    +
                                </button>
                            </div>
                            <div className="space-y-3">
                                {additionalVisitors.map((visitor, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">
                                                {visitor.visitorName}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {visitor.visitorPhone} | {visitor.visitorCompany}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {visitor.visitorEmail}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {visitor.visitDateFrom && visitor.visitDateTo 
                                                    ? `${visitor.visitDateFrom} ~ ${visitor.visitDateTo}`
                                                    : '방문일자 미입력'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVisitor(index)}
                                            className="ml-4 text-red-600 hover:text-red-800 font-medium"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                ))}
                                {additionalVisitors.length === 0 && (
                                    <div className="text-center text-gray-400 py-8">
                                        추가된 방문자가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                </form>
            </div>

            {showPrivacyConsent && (
                <PrivacyConsent
                    onConsent={handlePrivacyConsent}
                    onCancel={() => setShowPrivacyConsent(false)}
                />
            )}

            {showVisitorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">
                            방문자 추가 등록
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    이름 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="visitorName"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                    placeholder="홍길동"
                                    required
                                    value={visitorFormData.visitorName}
                                    onChange={handleVisitorFormChange}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    전화번호 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="visitorPhone"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                    placeholder="010-1234-5678"
                                    required
                                    value={visitorFormData.visitorPhone}
                                    onChange={handleVisitorFormChange}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    회사명 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        id="useSameCompany"
                                        checked={useSameCompany}
                                        onChange={(e) => {
                                            setUseSameCompany(e.target.checked);
                                            if (e.target.checked) {
                                                setVisitorFormData({
                                                    ...visitorFormData,
                                                    visitorCompany: formData.visitorCompany,
                                                });
                                            }
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="useSameCompany" className="text-sm text-gray-600">
                                        요청자와 동일한 회사명 사용
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    name="visitorCompany"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                    placeholder="회사명을 입력하세요"
                                    required
                                    value={visitorFormData.visitorCompany}
                                    onChange={handleVisitorFormChange}
                                    disabled={useSameCompany}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    이메일 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="visitorEmail"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                    placeholder="example@example.com"
                                    required
                                    value={visitorFormData.visitorEmail}
                                    onChange={handleVisitorFormChange}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    방문일자 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        id="useSameDate"
                                        checked={useSameDate}
                                        onChange={(e) => {
                                            setUseSameDate(e.target.checked);
                                            if (e.target.checked) {
                                                setVisitorFormData({
                                                    ...visitorFormData,
                                                    visitDateFrom: formData.visitDateFrom,
                                                    visitDateTo: formData.visitDateTo,
                                                });
                                            }
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="useSameDate" className="text-sm text-gray-600">
                                        요청자와 동일한 방문일자 사용
                                    </label>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-1">From</label>
                                        <input
                                            type="date"
                                            name="visitDateFrom"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                            required
                                            min={new Date().toISOString().split("T")[0]}
                                            value={visitorFormData.visitDateFrom}
                                            onChange={handleVisitorFormChange}
                                            disabled={useSameDate}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-1">To</label>
                                        <input
                                            type="date"
                                            name="visitDateTo"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                            required
                                            min={visitorFormData.visitDateFrom || new Date().toISOString().split("T")[0]}
                                            value={visitorFormData.visitDateTo}
                                            onChange={handleVisitorFormChange}
                                            disabled={useSameDate}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleCloseVisitorModal}
                                className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-300"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleAddVisitor}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VisitorRequest;
