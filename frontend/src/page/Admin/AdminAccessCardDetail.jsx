import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";

function AdminRequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

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
    const [status, setStatus] = useState(null);
    const [additionalVisitors, setAdditionalVisitors] = useState([]);
    const [availableCards, setAvailableCards] = useState([]);
    const [reqId, setReqId] = useState(null);
    const [selectedCards, setSelectedCards] = useState({}); // { visitorSeq: cardNo }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // 사용 가능한 카드 목록 조회 함수
    const fetchAvailableCards = async () => {
        try {
            const cardsResponse = await axios.get(`http://localhost:3001/api/accessCard`);
            if (cardsResponse.data.success && Array.isArray(cardsResponse.data.data)) {
                setAvailableCards(cardsResponse.data.data.map(card => card.accessCardNo));
            } else {
                setAvailableCards([]);
            }
        } catch (cardError) {
            console.error("카드 목록 불러오기 실패: ", cardError);
            setAvailableCards([]);
        }
    };

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/request/${id}`);
                if (response.data.success && response.data.data) {
                    const request = response.data.data;
                    setStatus(request.status);
                    setReqId(request.reqId);
                    setFormData({
                        visitorName: request.visitorName || "",
                        visitorPhone: request.visitorPhone || "",
                        visitorCompany: request.visitorCompany || "",
                        visitorEmail: request.visitorEmail || "",
                        visitDate: request.visitDate ? request.visitDate.split('T')[0] : "",
                        visitPurpose: request.visitPurpose || "",
                        internalContact: request.internalContact || "",
                        location: request.location || "",
                    });

                    // 방문자 목록 조회 (reqId 사용)
                    if (request.reqId) {
                        try {
                            const visitorsResponse = await axios.get(`http://localhost:3001/api/request/visitors/${request.reqId}`);
                            if (visitorsResponse.data.success && Array.isArray(visitorsResponse.data.data)) {
                                const visitors = visitorsResponse.data.data.map(visitor => ({
                                    visitorSeq: visitor.visitorSeq || 0,
                                    visitorName: visitor.visitorName || "",
                                    visitorPhone: visitor.visitorPhone || "",
                                    visitorCompany: visitor.visitorCompany || "",
                                    visitorEmail: visitor.visitorEmail || "",
                                    visitDateFrom: visitor.visitDateFrom || "",
                                    visitDateTo: visitor.visitDateTo || "",
                                    accessCardNo: visitor.accessCardNo || null,
                                    accessCardIssueStat: visitor.accessCardIssueStat || "N",
                                    carNo: visitor.carNo || null,
                                    itemCnt: visitor.itemCnt || 0,
                                }));
                                setAdditionalVisitors(visitors);
                                
                                // 이미 발급된 카드 정보 저장
                                const cardMap = {};
                                visitors.forEach(visitor => {
                                    if (visitor.accessCardNo) {
                                        cardMap[visitor.visitorSeq] = visitor.accessCardNo;
                                    }
                                });
                                setSelectedCards(cardMap);
                            } else {
                                setAdditionalVisitors([]);
                            }
                        } catch (visitorError) {
                            console.error("방문자 목록 불러오기 실패: ", visitorError);
                            setAdditionalVisitors([]);
                        }
                    } else {
                        setAdditionalVisitors([]);
                    }

                    // 사용 가능한 카드 목록 조회
                    await fetchAvailableCards();
                }
            } catch (error) {
                console.error("방문 요청 상세 불러오기 실패: ", error);
                Swal.fire({
                    icon: "error",
                    title: "데이터 로드 실패",
                    text: error.response?.data?.message || "방문 요청 정보를 불러올 수 없습니다.",
                });
            }
        };

        if (id) {
            fetchRequest();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `http://localhost:3001/api/approval/${id}`,
                {
                    ...formData,
                    BusinessId: "VIST",
                }
            );

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "결재 상신 완료",
                    text: response.data.message,
                });
            }
        } catch (error) {
            console.error("방문 요청 결재 상신 실패:", error);
            Swal.fire({
                icon: "error",
                title: "결재 상신 실패",
                text: error.response?.data?.message || "결재 상신 중 오류가 발생했습니다.",
            });
        }
    };
    // 방문거절 start 
    const handleReject = async (e) => {
        e.preventDefault();

        const { value: rejectionReason } = await Swal.fire({
            title: '방문 거절 사유',
            input: 'textarea',
            inputLabel: '거절 사유를 입력해주세요',
            inputPlaceholder: '거절 사유를 입력하세요...',
            inputAttributes: {
                'aria-label': '거절 사유를 입력하세요'
            },
            showCancelButton: true,
            confirmButtonText: '거절',
            cancelButtonText: '취소',
            confirmButtonColor: '#dc2626',
            inputValidator: (value) => {
                if (!value) {
                    return '거절 사유를 입력해주세요';
                }
            }
        });

        if (rejectionReason) {
            try {
                const response = await axios.put(
                    `http://localhost:3001/api/request/${id}`,
                    {
                        rejectionReason: rejectionReason,
                    }
                );

                if (response.data.success || response.status === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "방문 거절 완료",
                        text: response.data.message || "방문 요청이 거절되었습니다.",
                    }).then(() => {
                        navigate("/admin/requests");
                    });
                } else {
                    // success가 false인 경우에도 이동
                    navigate("/admin/requests");
                }
            } catch (error) {
                console.error("방문 요청 거절 실패:", error);
                Swal.fire({
                    icon: "error",
                    title: "방문 거절 실패",
                    text: error.response?.data?.message || "방문 거절 중 오류가 발생했습니다.",
                });
            }
        }
    };
    // 방문거절 end 

    // 카드 발급 핸들러
    const handleIssueCard = async (visitorSeq) => {
        const cardNo = selectedCards[visitorSeq];
        if (!cardNo || !reqId) {
            Swal.fire({
                icon: "warning",
                title: "카드 선택 필요",
                text: "카드를 선택해주세요.",
            });
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3001/api/accessCard`, {
                reqId: reqId,
                visitorSeq: visitorSeq,
                cardNo: cardNo,
            });

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "카드 발급 완료",
                    text: "카드가 성공적으로 발급되었습니다.",
                });
                
                // 방문자 목록 업데이트 (발급 상태를 Y로 변경)
                setAdditionalVisitors(prev => 
                    prev.map(visitor => 
                        visitor.visitorSeq === visitorSeq 
                            ? { ...visitor, accessCardNo: cardNo, accessCardIssueStat: "Y" }
                            : visitor
                    )
                );
                
                // 사용 가능한 카드 목록 새로고침
                await fetchAvailableCards();
            }
        } catch (error) {
            console.error("카드 발급 실패:", error);
            Swal.fire({
                icon: "error",
                title: "카드 발급 실패",
                text: error.response?.data?.message || "카드 발급 중 오류가 발생했습니다.",
            });
        }
    };

    // 카드 선택 핸들러
    const handleCardSelect = (visitorSeq, cardNo) => {
        setSelectedCards(prev => ({
            ...prev,
            [visitorSeq]: cardNo,
        }));
    };

    // 카드 반납 핸들러
    const handleReturnCard = async (visitorSeq) => {
        const visitor = additionalVisitors.find(v => v.visitorSeq === visitorSeq);
        const cardNo = visitor?.accessCardNo;
        
        if (!cardNo || !reqId) {
            Swal.fire({
                icon: "warning",
                title: "반납 불가",
                text: "발급된 카드가 없습니다.",
            });
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3001/api/accessCard/return`, {
                reqId: reqId,
                visitorSeq: visitorSeq,
                cardNo: cardNo,
            });

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "카드 반납 완료",
                    text: "카드가 성공적으로 반납되었습니다.",
                });
                
                // 방문자 목록 업데이트 (반납 상태를 R로 변경, 반납된 카드번호는 유지)
                setAdditionalVisitors(prev => 
                    prev.map(v => 
                        v.visitorSeq === visitorSeq 
                            ? { ...v, accessCardIssueStat: "R" }
                            : v
                    )
                );
                
                // 선택된 카드 정보 제거
                setSelectedCards(prev => {
                    const newCards = { ...prev };
                    delete newCards[visitorSeq];
                    return newCards;
                });
                
                // 사용 가능한 카드 목록 새로고침
                await fetchAvailableCards();
            }
        } catch (error) {
            console.error("카드 반납 실패:", error);
            Swal.fire({
                icon: "error",
                title: "카드 반납 실패",
                text: error.response?.data?.message || "카드 반납 중 오류가 발생했습니다.",
            });
        }
    };

    // 미출입 핸들러
    const handleNoIssue = async (visitorSeq) => {
        if (!reqId) {
            Swal.fire({
                icon: "warning",
                title: "오류",
                text: "요청 정보가 없습니다.",
            });
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3001/api/accessCard/NoIssue`, {
                reqId: reqId,
                visitorSeq: visitorSeq,
            });

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "미출입 처리 완료",
                    text: "미출입으로 처리되었습니다.",
                });
                
                // 방문자 목록 업데이트 (미출입 상태를 P로 변경)
                setAdditionalVisitors(prev => 
                    prev.map(v => 
                        v.visitorSeq === visitorSeq 
                            ? { ...v, accessCardIssueStat: "P" }
                            : v
                    )
                );
                
                // 선택된 카드 정보 제거
                setSelectedCards(prev => {
                    const newCards = { ...prev };
                    delete newCards[visitorSeq];
                    return newCards;
                });
            }
        } catch (error) {
            console.error("미출입 처리 실패:", error);
            Swal.fire({
                icon: "error",
                title: "미출입 처리 실패",
                text: error.response?.data?.message || "미출입 처리 중 오류가 발생했습니다.",
            });
        }
    };

    // 전산기기 목록 조회 및 팝업 표시
    const handleShowItems = async (visitorSeq) => {
        if (!reqId || !visitorSeq) {
            Swal.fire({
                icon: "warning",
                title: "정보 부족",
                text: "방문자 정보를 불러올 수 없습니다.",
            });
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3001/api/request/items/${reqId}/${visitorSeq}`);
            
            if (response.data.success && response.data.data) {
                const items = response.data.data;
                
                if (items.length === 0) {
                    Swal.fire({
                        icon: "info",
                        title: "전산기기 목록",
                        text: "등록된 전산기기가 없습니다.",
                    });
                    return;
                }

                // 전산기기 목록을 Request.jsx 스타일로 구성
                const itemsHtml = `
                    <div class="text-left mt-4">
                        <div class="mb-2">
                            <span class="text-sm font-medium text-gray-700">등록된 전산기기</span>
                        </div>
                        <div class="space-y-2 max-h-96 overflow-y-auto">
                            ${items.map((item, index) => `
                                <div class="flex items-center p-3 rounded-lg border bg-gray-50 border-gray-200">
                                    <div class="flex-1 grid grid-cols-4 gap-2 text-sm">
                                        <div>
                                            <span class="text-gray-600">분류:</span>
                                            <span class="ml-1 font-medium text-gray-800">${item.itemGubun || '-'}</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-600">반입목적:</span>
                                            <span class="ml-1 font-medium text-gray-800">${item.itemDesc || '-'}</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-600">모델명:</span>
                                            <span class="ml-1 font-medium text-gray-800">${item.itemModel || '-'}</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-600">제품번호:</span>
                                            <span class="ml-1 font-medium text-gray-800">${item.itemNo || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                Swal.fire({
                    icon: "info",
                    title: "전산기기 목록",
                    html: itemsHtml,
                    width: "900px",
                    confirmButtonText: "확인",
                });
            } else {
                Swal.fire({
                    icon: "info",
                    title: "전산기기 목록",
                    text: "등록된 전산기기가 없습니다.",
                });
            }
        } catch (error) {
            console.error("전산기기 목록 조회 실패:", error);
            Swal.fire({
                icon: "error",
                title: "조회 실패",
                text: error.response?.data?.message || "전산기기 목록을 불러올 수 없습니다.",
            });
        }
    };

    // 재발급 핸들러
    const handleReIssue = async (visitorSeq) => {
        const visitor = additionalVisitors.find(v => v.visitorSeq === visitorSeq);
        const cardNo = visitor?.accessCardNo;
        
        if (!reqId) {
            Swal.fire({
                icon: "warning",
                title: "재발급 불가",
                text: "요청 정보가 없습니다.",
            });
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3001/api/accessCard/reIssue`, {
                reqId: reqId,
                visitorSeq: visitorSeq,
                cardNo: cardNo || null,
            });

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "재발급 준비 완료",
                    text: "재발급이 가능한 상태로 변경되었습니다.",
                });
                
                // 방문자 목록 업데이트 (초기 상태로 복원)
                setAdditionalVisitors(prev => 
                    prev.map(v => 
                        v.visitorSeq === visitorSeq 
                            ? { ...v, accessCardNo: null, accessCardIssueStat: null }
                            : v
                    )
                );
                
                // 선택된 카드 정보 제거
                setSelectedCards(prev => {
                    const newCards = { ...prev };
                    delete newCards[visitorSeq];
                    return newCards;
                });
                
                // 사용 가능한 카드 목록 새로고침
                await fetchAvailableCards();
            }
        } catch (error) {
            console.error("재발급 처리 실패:", error);
            Swal.fire({
                icon: "error",
                title: "재발급 처리 실패",
                text: error.response?.data?.message || "재발급 처리 중 오류가 발생했습니다.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-white py-10">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                        출입카드 관리
                    </h1>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">

                        <div>
                            <div className="space-y-6 mb-8">
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
                                    방문 정보
                                </h2>
                            </div>
                            <div className="space-y-6">
                                {/* <div>
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
                                        onChange={handleChange}
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
                                </div> */}
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
                            </div>
                        </div>

                        <div className="space-y-12">
                            {/* <div>
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
                            </div> */}
                            <div>
                                <label className="block text-gray-700 font-medium mt-12 mb-2">
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
                            </div>

                        </div>
                    </div>
                </div><div className="space-y-8 mt-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        추가 방문자
                    </h3>
                    <div className="space-y-3">
                        {additionalVisitors
                            .sort((a, b) => (a.visitorSeq || 0) - (b.visitorSeq || 0))
                            .map((visitor, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">
                                            방문자{visitor.visitorSeq || index + 1}
                                        </div>
                                        <div className="font-medium text-gray-800 mt-1">
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
                                        {visitor.carNo && (
                                            <div className="text-sm text-blue-600 mt-1">
                                                차량등록 {visitor.carNo}
                                            </div>
                                        )}
                                        <div 
                                            className="text-sm text-green-600 mt-1 cursor-pointer hover:text-green-800 hover:underline"
                                            onClick={() => handleShowItems(visitor.visitorSeq)}
                                        >
                                            전산기기등록 {visitor.itemCnt || 0}대
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 ml-4">
                                        <select 
                                            className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-300 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                            value={visitor.accessCardIssueStat === "P" ? "" : (selectedCards[visitor.visitorSeq] || visitor.accessCardNo || "")}
                                            onChange={(e) => handleCardSelect(visitor.visitorSeq, e.target.value)}
                                            disabled={visitor.accessCardIssueStat === "Y" || visitor.accessCardIssueStat === "R" || visitor.accessCardIssueStat === "P"}
                                        >
                                            <option value="">카드 선택</option>
                                            {availableCards.map((cardNo, idx) => (
                                                <option key={idx} value={cardNo}>
                                                    {cardNo}
                                                </option>
                                            ))}
                                            {visitor.accessCardNo && !availableCards.includes(visitor.accessCardNo) && (
                                                <option value={visitor.accessCardNo}>
                                                    {visitor.accessCardNo}
                                                </option>
                                            )}
                                        </select>
                                        {visitor.accessCardIssueStat === "Y" ? (
                                            // 발급된 경우: 반납 버튼만 표시
                                            <button
                                                type="button"
                                                onClick={() => handleReturnCard(visitor.visitorSeq)}
                                                disabled={!visitor.accessCardNo}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                                                    !visitor.accessCardNo
                                                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                                        : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                                }`}
                                            >
                                                반납
                                            </button>
                                        ) : visitor.accessCardIssueStat === "R" ? (
                                            // 반납된 경우: 반납완료 텍스트와 재발급 버튼 표시
                                            <>
                                                <div className="px-4 py-2 text-center text-green-600 font-medium">
                                                    반납완료
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReIssue(visitor.visitorSeq)}
                                                    className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                                                >
                                                    재발급
                                                </button>
                                            </>
                                        ) : visitor.accessCardIssueStat === "P" ? (
                                            // 미출입 처리된 경우: 미발급 텍스트와 재발급 버튼 표시
                                            <>
                                                <div className="px-4 py-2 text-center text-yellow-600 font-medium">
                                                    미발급
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReIssue(visitor.visitorSeq)}
                                                    className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                                                >
                                                    재발급
                                                </button>
                                            </>
                                        ) : (
                                            // 발급되지 않은 경우 (null, "N", "P" 등): 발급 버튼과 미출입 버튼 표시
                                            // 발급되지 않은 경우: 발급 버튼과 미출입 버튼 표시
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleIssueCard(visitor.visitorSeq)}
                                                    disabled={!selectedCards[visitor.visitorSeq]}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                                                        !selectedCards[visitor.visitorSeq]
                                                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                                            : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                                    }`}
                                                >
                                                    발급
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleNoIssue(visitor.visitorSeq)}
                                                    className="px-4 py-2 rounded-lg font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-colors duration-300"
                                                >
                                                    미출입
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        {additionalVisitors.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                추가된 방문자가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
                {/* <div className="grid lg:grid-cols-2 gap-12 items-start">

                        <div>
                            <div className="space-y-6 mb-8">
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
                                    출입카드 정보
                                </h2>
                            </div>
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
                                        onChange={handleChange}
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
                                <div className="flex gap-4 mt-20">
                                    <button
                                        type="submit"
                                        disabled={status !== "0"}
                                        className={`flex-1 py-4 rounded-lg font-medium transition-colors duration-300 ${status === "0"
                                            ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                            }`}
                                    >
                                        카드발급
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReject}
                                        disabled={status !== "0"}
                                        className={`flex-1 py-4 rounded-lg font-medium transition-colors duration-300 ${status === "0"
                                            ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                            }`}
                                    >
                                        카드반납
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
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

                        </div>
                    </div> */}
            </div>
        </div>
    );
}

export default AdminRequestDetail;
