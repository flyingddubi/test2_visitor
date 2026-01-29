import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";

const AdminCardManagement = () => {
  const [cardManagement, setCardManagement] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [isNewCard, setIsNewCard] = useState(false);
  const [originalData, setOriginalData] = useState(null); // 원본 데이터 저장
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false); // 모바일 팝업 상태
  const [formData, setFormData] = useState({
    accessCardNo: "",
    accessCardType: "",
    accessCardUse: "",
  });

  useEffect(() => {
    const fetchCardManagement = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/cardManagement');
        const data = Array.isArray(response.data) ? response.data : [];
        setCardManagement(data);
        
        // 기본적으로 첫 번째 카드 선택 (한 번만 실행)
        if (data.length > 0) {
          const firstCard = data[0];
          setSelectedCard(prev => {
            // 이미 선택된 카드가 있으면 유지
            if (prev) return prev;
            // 없으면 첫 번째 카드 선택
            return firstCard;
          });
          setOriginalData(prev => {
            if (prev) return prev;
            return {
              accessCardType: firstCard.accessCardType || "",
              accessCardUse: firstCard.accessCardUse || "",
            };
          });
          setFormData(prev => {
            if (prev.accessCardNo) return prev;
            return {
              accessCardNo: firstCard.accessCardNo || "",
              accessCardType: firstCard.accessCardType || "",
              accessCardUse: firstCard.accessCardUse || "",
            };
          });
        }
      } catch (error) {
        console.log("카드 목록 가져오기 실패: " + error);
      }
    };
    fetchCardManagement();
  }, []);

  const filteredCards = useMemo(() => {
    return cardManagement.filter((cardManagement) => {
      const fieldValue = cardManagement[searchType];
      const value = (fieldValue || "").toLowerCase();
      const matchesSearch = value.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "" || String(cardManagement.purpose) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cardManagement, searchTerm, searchType, statusFilter]);

  const totalPages = pageSize > 0 ? Math.ceil(filteredCards.length / pageSize) : 1;
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCards.slice(start, start + pageSize);
  }, [filteredCards, currentPage, pageSize]);

  // 데이터 변경 여부 확인
  const hasChanges = () => {
    if (isNewCard) {
      return formData.accessCardNo || formData.accessCardType || formData.accessCardUse;
    }
    if (!selectedCard || !originalData) return false;
    return (
      formData.accessCardType !== originalData.accessCardType ||
      formData.accessCardUse !== originalData.accessCardUse
    );
  };

  // 카드 선택 핸들러
  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setIsNewCard(false);
    setOriginalData({
      accessCardType: card.accessCardType || "",
      accessCardUse: card.accessCardUse || "",
    });
    setFormData({
      accessCardNo: card.accessCardNo || "",
      accessCardType: card.accessCardType || "",
      accessCardUse: card.accessCardUse || "",
    });
  };

  // 모바일 카드 선택 핸들러 (팝업 열기)
  const handleMobileCardSelect = (card) => {
    handleCardSelect(card);
    setIsMobileModalOpen(true);
  };

  // 추가하기 버튼 핸들러
  const handleAddNew = () => {
    setIsNewCard(true);
    setSelectedCard(null);
    setOriginalData(null);
    setFormData({
      accessCardNo: "",
      accessCardType: "",
      accessCardUse: "",
    });
    // 모바일에서도 팝업 열기
    setIsMobileModalOpen(true);
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (isNewCard) {
      // 새 카드 모드 취소 시 첫 번째 카드 선택
      if (cardManagement.length > 0) {
        const firstCard = cardManagement[0];
        setSelectedCard(firstCard);
        setOriginalData({
          accessCardType: firstCard.accessCardType || "",
          accessCardUse: firstCard.accessCardUse || "",
        });
        setFormData({
          accessCardNo: firstCard.accessCardNo || "",
          accessCardType: firstCard.accessCardType || "",
          accessCardUse: firstCard.accessCardUse || "",
        });
        setIsNewCard(false);
      } else {
        setIsNewCard(false);
        setFormData({
          accessCardNo: "",
          accessCardType: "",
          accessCardUse: "",
        });
      }
    } else if (selectedCard && originalData) {
      // 수정 모드 취소 시 원본 데이터로 복구
      setFormData({
        accessCardNo: selectedCard.accessCardNo || "",
        accessCardType: originalData.accessCardType || "",
        accessCardUse: originalData.accessCardUse || "",
      });
    }
    // 모바일 팝업 닫기
    setIsMobileModalOpen(false);
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      if (isNewCard) {
        // 새 카드 생성
        if (!formData.accessCardNo || !formData.accessCardType || !formData.accessCardUse) {
          alert("모든 필수 항목을 입력해주세요.");
          return;
        }

        const response = await axios.post('http://localhost:3001/api/cardManagement', {
          ...formData,
          status: "0",
        });
        
        if (response.status === 201) {
          alert("카드가 성공적으로 등록되었습니다.");
          // 목록 새로고침
          const refreshResponse = await axios.get('http://localhost:3001/api/cardManagement');
          const refreshData = Array.isArray(refreshResponse.data) ? refreshResponse.data : [];
          setCardManagement(refreshData);
          setIsNewCard(false);
          setIsMobileModalOpen(false);
          
          // 첫 번째 카드 선택
          if (refreshData.length > 0) {
            const firstCard = refreshData[0];
            setSelectedCard(firstCard);
            setOriginalData({
              accessCardType: firstCard.accessCardType || "",
              accessCardUse: firstCard.accessCardUse || "",
            });
            setFormData({
              accessCardNo: firstCard.accessCardNo || "",
              accessCardType: firstCard.accessCardType || "",
              accessCardUse: firstCard.accessCardUse || "",
            });
          } else {
            setSelectedCard(null);
            setOriginalData(null);
            setFormData({
              accessCardNo: "",
              accessCardType: "",
              accessCardUse: "",
            });
          }
        }
      } else if (selectedCard) {
        // 카드 수정
        if (!formData.accessCardType || !formData.accessCardUse) {
          alert("모든 필수 항목을 입력해주세요.");
          return;
        }

        const response = await axios.put(`http://localhost:3001/api/cardManagement/${selectedCard.accessCardNo}`, {
          accessCardType: formData.accessCardType,
          accessCardUse: formData.accessCardUse,
          updatedAt: new Date().toISOString(),
        });
        
        if (response.data.success || response.status === 200) {
          alert("카드가 성공적으로 수정되었습니다.");
          // 목록 새로고침
          const refreshResponse = await axios.get('http://localhost:3001/api/cardManagement');
          setCardManagement(refreshResponse.data);
          // 선택된 카드 정보 업데이트
          const updatedCard = refreshResponse.data.find(card => card.accessCardNo === selectedCard.accessCardNo);
          if (updatedCard) {
            setSelectedCard(updatedCard);
            setOriginalData({
              accessCardType: updatedCard.accessCardType || "",
              accessCardUse: updatedCard.accessCardUse || "",
            });
            setFormData({
              accessCardNo: updatedCard.accessCardNo || "",
              accessCardType: updatedCard.accessCardType || "",
              accessCardUse: updatedCard.accessCardUse || "",
            });
          }
          setIsMobileModalOpen(false);
        }
      }
    } catch (error) {
      console.error("카드 저장 실패:", error);
      alert(error.response?.data?.message || "카드 저장 중 오류가 발생했습니다.");
    }
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto py-16 md:py-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-center">
        출입카드 관리
      </h1>

      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex w-full md:w-auto gap-2">
          <select
            className="border rounded px-3 py-2 text-base"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="0">미발급</option>
            <option value="1">발급</option>
          </select>
          <div className="flex-1 md:w-80">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="w-full border rounded px-3 py-2 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded px-3 py-2 text-base"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">카드구분</option>
            <option value="normal">일반</option>
            <option value="longTerm">장기</option>
          </select>
        </div>

        <button
          onClick={handleAddNew}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-center"
        >
          추가하기
        </button>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg font-bold text-gray-600"> 총 {paginatedCards.length}개의 게시물 </div>

        <div className="flex items-center space-x-2">
          <label className="text-base font-bold text-gray-600">
            페이지당 표시:{" "}
          </label>
          <select className="border rounded px-3 py-2" value={pageSize} onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}>
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{`${size}개`}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2 hidden md:block overflow-x-auto">
          {/* <table className="min-w-full bg-white border rounded-lg"> */}
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden text-sm lg:text-lg font-bold">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-auto">
                  No.
                </th>
                <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[27%]">
                  카드구분
                </th>
                <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[27%]">
                  미사용처리
                </th>
                <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[27%]">
                  발급상태
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCards.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500"> 검색 결과가 없습니다. </td>
                </tr>
              ) : (
                paginatedCards.map((card, index) => (
                  <tr 
                    key={card.accessCardNo || index} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedCard?.accessCardNo === card.accessCardNo ? 'bg-blue-50' : ''}`}
                    onClick={() => handleCardSelect(card)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{card.accessCardNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{card.accessCardType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{card.accessCardUse}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{card.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="w-1/2 hidden md:block">
          <div className="bg-white shadow-md rounded-lg p-6">
            {!selectedCard && !isNewCard ? (
              <div className="text-center text-gray-500 py-12">
                카드를 선택해주세요
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {isNewCard ? "새 카드 등록" : "카드 정보 수정"}
                </h2>
                
                {!isNewCard && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      카드번호
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                      value={formData.accessCardNo}
                      disabled
                    />
                  </div>
                )}

                {isNewCard && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      카드번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accessCardNo"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={formData.accessCardNo}
                      onChange={handleFormChange}
                      placeholder="카드번호를 입력하세요"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    카드구분 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accessCardType"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={formData.accessCardType}
                    onChange={handleFormChange}
                  >
                    <option value="">선택하세요</option>
                    <option value="normal">일반</option>
                    <option value="longTerm">장기</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    미사용처리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accessCardUse"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={formData.accessCardUse}
                    onChange={handleFormChange}
                  >
                    <option value="">선택하세요</option>
                    <option value="Y">사용</option>
                    <option value="N">미사용</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges()}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
                      hasChanges()
                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={!hasChanges()}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
                      hasChanges()
                        ? "bg-gray-600 hover:bg-gray-700 text-white cursor-pointer"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedCards.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow">
            검색 결과가 없습니다.
          </div>
        ) : (
          paginatedCards.map((card) => (
            <div 
              key={card.accessCardNo} 
              className="p-4 rounded-lg bg-white shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() => handleMobileCardSelect(card)}
            >
              <div className="text-gray-600">카드번호: {card.accessCardNo}</div>
              <div className="text-gray-600">카드구분: {card.accessCardType}</div>
              <div className="text-gray-600">미사용처리: {card.accessCardUse}</div>
              <div className="text-gray-600">발급상태: {card.status}</div>
            </div>
          ))
        )}
      </div>

      {/* 모바일 팝업 모달 */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isNewCard ? "새 카드 등록" : "카드 정보 수정"}
                </h2>
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {!isNewCard && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      카드번호
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                      value={formData.accessCardNo}
                      disabled
                    />
                  </div>
                )}

                {isNewCard && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      카드번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accessCardNo"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={formData.accessCardNo}
                      onChange={handleFormChange}
                      placeholder="카드번호를 입력하세요"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    카드구분 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accessCardType"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={formData.accessCardType}
                    onChange={handleFormChange}
                  >
                    <option value="">선택하세요</option>
                    <option value="normal">일반</option>
                    <option value="longTerm">장기</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    미사용처리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accessCardUse"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={formData.accessCardUse}
                    onChange={handleFormChange}
                  >
                    <option value="">선택하세요</option>
                    <option value="Y">사용</option>
                    <option value="N">미사용</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges()}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
                      hasChanges()
                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={!hasChanges()}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
                      hasChanges()
                        ? "bg-gray-600 hover:bg-gray-700 text-white cursor-pointer"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="mt-4 flex justify-center space-x-2 text-lg font-bold">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1  || totalPages === 0}
        >
          이전
        </button>
        <span className="px-3 py-1">
          {currentPage} / {totalPages}{" "}
        </span>
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default AdminCardManagement;
