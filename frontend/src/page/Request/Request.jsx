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
    
    // 차량등록/전산기기등록 관련 상태 (방문자 추가 모달용)
    const [visitorCarNumber, setVisitorCarNumber] = useState("");
    const [visitorItemList, setVisitorItemList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [newItem, setNewItem] = useState({
        itemGubun: "",
        itemDesc: "",
        itemModel: "",
        itemNo: "",
    });
    
    // 메인 방문 요청자용 차량번호/전산기기 등록 상태
    const [mainCarNumber, setMainCarNumber] = useState("");
    const [mainItemList, setMainItemList] = useState([]);
    const [mainSelectedItems, setMainSelectedItems] = useState([]);
    const [mainNewItem, setMainNewItem] = useState({
        itemGubun: "",
        itemDesc: "",
        itemModel: "",
        itemNo: "",
    });
    
    // 수정 모드 관련 상태
    const [editingVisitorIndex, setEditingVisitorIndex] = useState(null);

    // 전화번호 입력 시 과거 방문 기록 자동 불러오기
    const handlePhoneChange = async (phone) => {
        if (phone.length >= 10) {
            try {
                const response = await axios.get(
                    `http://localhost:3001/api/request/history/${phone}`
                );
                if (response.data.success && response.data.data) {
                    const history = response.data.data;
                    setFormData((prev) => ({
                        ...prev,
                        visitorName: history.visitorName || prev.visitorName,
                        visitorCompany: history.visitorCompany || prev.visitorCompany,
                        visitDateFrom: history.visitDateFrom || prev.visitDateFrom,
                        visitDateTo: history.visitDateTo || prev.visitDateTo,
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
            // 추가 방문자들의 차량번호와 전산기기 정보를 포함하여 전송
            const visitorsWithDetails = additionalVisitors.map(visitor => ({
                ...visitor,
                carNumber: visitor.carNumber || null,
                itemCount: visitor.itemCount || 0,
                items: visitor.items || [],
            }));

            const response = await axios.post(
                "http://localhost:3001/api/request",
                {
                    ...formData,
                    businessId: "REQ",
                    privacyConsent: true,
                    additionalVisitors: visitorsWithDetails,
                    // 메인 방문 요청자의 차량번호와 전산기기 정보
                    mainCarNumber: mainCarNumber || null,
                    mainItemCount: mainItemList.length || 0,
                    mainItems: mainItemList || [],
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
                setMainCarNumber("");
                setMainItemList([]);
                setMainSelectedItems([]);
                setMainNewItem({
                    itemGubun: "",
                    itemDesc: "",
                    itemModel: "",
                    itemNo: "",
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
        setVisitorCarNumber("");
        setVisitorItemList([]);
        setSelectedItems([]);
        setNewItem({
            itemGubun: "",
            itemDesc: "",
            itemModel: "",
            itemNo: "",
        });
        setEditingVisitorIndex(null);
        setShowVisitorModal(true);
    };

    const handleEditVisitor = (index) => {
        const visitor = additionalVisitors[index];
        setVisitorFormData({
            visitorName: visitor.visitorName || "",
            visitorPhone: visitor.visitorPhone || "",
            visitorCompany: visitor.visitorCompany || "",
            visitorEmail: visitor.visitorEmail || "",
            visitDateFrom: visitor.visitDateFrom || "",
            visitDateTo: visitor.visitDateTo || "",
        });
        setVisitorCarNumber(visitor.carNumber || "");
        setVisitorItemList(visitor.items || []);
        setSelectedItems([]);
        setNewItem({
            itemGubun: "",
            itemDesc: "",
            itemModel: "",
            itemNo: "",
        });
        setUseSameCompany(false);
        setUseSameDate(false);
        setEditingVisitorIndex(index);
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
        setVisitorCarNumber("");
        setVisitorItemList([]);
        setSelectedItems([]);
        setNewItem({
            itemGubun: "",
            itemDesc: "",
            itemModel: "",
            itemNo: "",
        });
        setEditingVisitorIndex(null);
    };

    const handleAddVisitor = () => {
        const newVisitor = {
            ...visitorFormData,
            visitorCompany: useSameCompany ? formData.visitorCompany : visitorFormData.visitorCompany,
            visitDateFrom: useSameDate ? formData.visitDateFrom : visitorFormData.visitDateFrom,
            visitDateTo: useSameDate ? formData.visitDateTo : visitorFormData.visitDateTo,
            carNumber: visitorCarNumber,
            itemCount: visitorItemList.length,
            items: visitorItemList,
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

        if (editingVisitorIndex !== null) {
            // 수정 모드
            const updatedVisitors = [...additionalVisitors];
            updatedVisitors[editingVisitorIndex] = newVisitor;
            setAdditionalVisitors(updatedVisitors);
        } else {
            // 추가 모드
            setAdditionalVisitors([...additionalVisitors, newVisitor]);
        }
        handleCloseVisitorModal();
    };

    // 전산기기 관련 함수
    const handleItemChange = (e) => {
        setNewItem({
            ...newItem,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddItem = () => {
        if (!newItem.itemGubun || !newItem.itemDesc || !newItem.itemModel || !newItem.itemNo) {
            Swal.fire({
                icon: "warning",
                title: "입력 오류",
                text: "모든 항목을 입력해주세요.",
            });
            return;
        }
        setVisitorItemList([...visitorItemList, { ...newItem, id: Date.now() }]);
        setNewItem({
            itemGubun: "",
            itemDesc: "",
            itemModel: "",
            itemNo: "",
        });
    };

    const handleToggleItemSelection = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleDeleteSelectedItems = () => {
        if (selectedItems.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "선택 오류",
                text: "삭제할 항목을 선택해주세요.",
            });
            return;
        }
        setVisitorItemList(visitorItemList.filter((item) => !selectedItems.includes(item.id)));
        setSelectedItems([]);
    };

    const handleRemoveVisitor = (e, index) => {
        e.stopPropagation(); // 이벤트 전파 방지
        setAdditionalVisitors(additionalVisitors.filter((_, i) => i !== index));
    };

    // 메인 방문 요청자용 전산기기 관련 함수
    const handleMainItemChange = (e) => {
        setMainNewItem({
            ...mainNewItem,
            [e.target.name]: e.target.value,
        });
    };

    const handleMainAddItem = () => {
        if (!mainNewItem.itemGubun || !mainNewItem.itemDesc || !mainNewItem.itemModel || !mainNewItem.itemNo) {
            Swal.fire({
                icon: "warning",
                title: "입력 오류",
                text: "모든 항목을 입력해주세요.",
            });
            return;
        }
        setMainItemList([...mainItemList, { ...mainNewItem, id: Date.now() }]);
        setMainNewItem({
            itemGubun: "",
            itemDesc: "",
            itemModel: "",
            itemNo: "",
        });
    };

    const handleMainToggleItemSelection = (id) => {
        if (mainSelectedItems.includes(id)) {
            setMainSelectedItems(mainSelectedItems.filter((itemId) => itemId !== id));
        } else {
            setMainSelectedItems([...mainSelectedItems, id]);
        }
    };

    const handleMainDeleteSelectedItems = () => {
        if (mainSelectedItems.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "선택 오류",
                text: "삭제할 항목을 선택해주세요.",
            });
            return;
        }
        setMainItemList(mainItemList.filter((item) => !mainSelectedItems.includes(item.id)));
        setMainSelectedItems([]);
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
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            차량등록
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                            placeholder="차량번호를 입력하세요 (예: 12가3456)"
                                            value={mainCarNumber}
                                            onChange={(e) => setMainCarNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>    
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            전산기기등록 {mainItemList.length > 0 && <span className="text-blue-600">({mainItemList.length}대)</span>}
                                        </label>
                                        <div className="space-y-4 border border-gray-300 rounded-lg p-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">
                                                        분류 <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="itemGubun"
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                                        placeholder="분류를 입력하세요"
                                                        value={mainNewItem.itemGubun}
                                                        onChange={handleMainItemChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">
                                                        반입목적 <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="itemDesc"
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                                        placeholder="반입목적을 입력하세요"
                                                        value={mainNewItem.itemDesc}
                                                        onChange={handleMainItemChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">
                                                        모델명 <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="itemModel"
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                                        placeholder="모델명을 입력하세요"
                                                        value={mainNewItem.itemModel}
                                                        onChange={handleMainItemChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">
                                                        제품번호 <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="itemNo"
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                                        placeholder="제품번호를 입력하세요"
                                                        value={mainNewItem.itemNo}
                                                        onChange={handleMainItemChange}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleMainAddItem}
                                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300"
                                            >
                                                추가
                                            </button>
                                            
                                            {mainItemList.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-700">등록된 전산기기</span>
                                                        <button
                                                            type="button"
                                                            onClick={handleMainDeleteSelectedItems}
                                                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-300"
                                                        >
                                                            선택 삭제
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {mainItemList.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className={`flex items-center p-3 rounded-lg border ${
                                                                    mainSelectedItems.includes(item.id)
                                                                        ? "bg-blue-50 border-blue-300"
                                                                        : "bg-gray-50 border-gray-200"
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={mainSelectedItems.includes(item.id)}
                                                                    onChange={() => handleMainToggleItemSelection(item.id)}
                                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                                                />
                                                                <div className="flex-1 grid grid-cols-4 gap-2 text-sm">
                                                                    <div>
                                                                        <span className="text-gray-600">분류:</span>
                                                                        <span className="ml-1 font-medium text-gray-800">{item.itemGubun}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">반입목적:</span>
                                                                        <span className="ml-1 font-medium text-gray-800">{item.itemDesc}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">모델명:</span>
                                                                        <span className="ml-1 font-medium text-gray-800">{item.itemModel}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">제품번호:</span>
                                                                        <span className="ml-1 font-medium text-gray-800">{item.itemNo}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => handleEditVisitor(index)}
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
                                            {visitor.carNumber && (
                                                <div className="text-sm text-blue-600 mt-1">
                                                    차량등록 {visitor.carNumber}
                                                </div>
                                            )}
                                            {visitor.itemCount > 0 && (
                                                <div className="text-sm text-green-600 mt-1">
                                                    전산기기등록 {visitor.itemCount}대
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleRemoveVisitor(e, index)}
                                            className="ml-4 text-red-600 hover:text-red-800 font-medium"
                                        >
                                            방문자 삭제
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
                            {editingVisitorIndex !== null ? "방문자 정보 수정" : "방문자 추가 등록"}
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
                            <div>    
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        차량등록
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                        placeholder="차량번호를 입력하세요 (예: 12가3456)"
                                        value={visitorCarNumber}
                                        onChange={(e) => setVisitorCarNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>    
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        전산기기등록 {visitorItemList.length > 0 && <span className="text-blue-600">({visitorItemList.length}대)</span>}
                                    </label>
                                    <div className="space-y-4 border border-gray-300 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">
                                                    분류 <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="itemGubun"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                                    placeholder="분류를 입력하세요"
                                                    value={newItem.itemGubun}
                                                    onChange={handleItemChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">
                                                    반입목적 <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="itemDesc"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                                    placeholder="반입목적을 입력하세요"
                                                    value={newItem.itemDesc}
                                                    onChange={handleItemChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">
                                                    모델명 <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="itemModel"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                                    placeholder="모델명을 입력하세요"
                                                    value={newItem.itemModel}
                                                    onChange={handleItemChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">
                                                    제품번호 <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="itemNo"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300"
                                                    placeholder="제품번호를 입력하세요"
                                                    value={newItem.itemNo}
                                                    onChange={handleItemChange}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300"
                                        >
                                            추가
                                        </button>
                                        
                                        {visitorItemList.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">등록된 전산기기</span>
                                                    <button
                                                        type="button"
                                                        onClick={handleDeleteSelectedItems}
                                                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-300"
                                                    >
                                                        선택 삭제
                                                    </button>
                                                </div>
                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                    {visitorItemList.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className={`flex items-center p-3 rounded-lg border ${
                                                                selectedItems.includes(item.id)
                                                                    ? "bg-blue-50 border-blue-300"
                                                                    : "bg-gray-50 border-gray-200"
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedItems.includes(item.id)}
                                                                onChange={() => handleToggleItemSelection(item.id)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                                            />
                                                            <div className="flex-1 grid grid-cols-4 gap-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600">분류:</span>
                                                                    <span className="ml-1 font-medium text-gray-800">{item.itemGubun}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">반입목적:</span>
                                                                    <span className="ml-1 font-medium text-gray-800">{item.itemDesc}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">모델명:</span>
                                                                    <span className="ml-1 font-medium text-gray-800">{item.itemModel}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">제품번호:</span>
                                                                    <span className="ml-1 font-medium text-gray-800">{item.itemNo}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
                                {editingVisitorIndex !== null ? "수정" : "확인"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VisitorRequest;
