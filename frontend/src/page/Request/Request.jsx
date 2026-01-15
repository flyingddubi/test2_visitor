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
        visitDate: "",
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
                "http://localhost:3001/api/visitorRequest",
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
                setFormData({
                    visitorName: "",
                    visitorPhone: "",
                    visitorCompany: "",
                    visitorEmail: "",
                    visitDate: "",
                    visitPurpose: "",
                    internalContact: "",
                    location: "",
                });
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

    return (
        <div className="min-h-screen bg-white py-32">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                        방문 요청 등록
                    </h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div>
                        <form
                            className="bg-white rounded-2xl shadow-xl p-8"
                            onSubmit={handleSubmit}
                        >
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
                                    <input
                                        type="date"
                                        name="visitDate"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 trasition-colors duration-300"
                                        required
                                        min={new Date().toISOString().split("T")[0]}
                                        value={formData.visitDate}
                                        onChange={handleChange}
                                    />
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
                        </form>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                                연락처 정보
                            </h3>
                            <div className="space-y-6">
                                {[
                                    {
                                        title: "전화",
                                        info: "02-1234-5678",
                                        desc: "평일 09:00 - 18:00",
                                    },
                                    {
                                        title: "이메일",
                                        info: "support@example.com",
                                        desc: "24시간 접수 가능",
                                    },
                                    {
                                        title: "주소",
                                        info: "서울특별시 중구 파인에비뉴",
                                        desc: "본사",
                                    },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="ml-4">
                                            <h4 className="font-medium text-gray-800">
                                                {item.title}
                                            </h4>
                                            <p className="text-gray-600">{item.info}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.546562389828!2d126.98600287622531!3d37.565745572038814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca2e5b4226d93%3A0xf7280a88ef03712f!2z7YyM7J247JeQ67mE64m0IOu5jOuUqQ!5e0!3m2!1sko!2skr!4v1764748245975!5m2!1sko!2skr"
                                width="100%"
                                height="400"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-[400px] md:h-[600px] lg:h-[600px]"
                            ></iframe>
                        </div>
                    </div>
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
