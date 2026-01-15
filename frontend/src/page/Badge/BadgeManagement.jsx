import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function BadgeManagement() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchBadgeNumber, setSearchBadgeNumber] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [userId, setUserId] = useState(1);
  const [approvedRequests, setApprovedRequests] = useState([]);

  const fetchApprovedRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/visitor-request?status=approver_lv2_approved"
      );
      if (response.data.success) {
        setApprovedRequests(response.data.data);
      }
    } catch (error) {
      console.error("승인 완료 요청 조회 실패:", error);
    }
  };

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/badge");
      if (response.data.success) {
        setBadges(response.data.data);
      }
    } catch (error) {
      console.error("출입증 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchBadgeNumber) {
      Swal.fire({
        icon: "warning",
        title: "입력 필요",
        text: "출입증 번호를 입력해주세요.",
      });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3001/api/badge/number/${searchBadgeNumber}`
      );
      if (response.data.success) {
        setSearchResult(response.data.data);
      }
    } catch (error) {
      console.error("출입증 검색 실패:", error);
      Swal.fire({
        icon: "error",
        title: "오류",
        text: error.response?.data?.message || "출입증을 찾을 수 없습니다.",
      });
      setSearchResult(null);
    }
  };

  const handleIssue = async (requestId) => {
    const { value: badgeNumber } = await Swal.fire({
      title: "출입증 발급",
      input: "text",
      inputLabel: "출입증 번호",
      inputPlaceholder: "출입증 번호를 입력하세요",
      showCancelButton: true,
      confirmButtonText: "발급",
      cancelButtonText: "취소",
      inputValidator: (value) => {
        if (!value) {
          return "출입증 번호를 입력해주세요.";
        }
      },
    });

    if (badgeNumber) {
      try {
        const response = await axios.post(
          "http://localhost:3001/api/badge/issue",
          {
            requestId,
            badgeNumber,
            issuedBy: userId,
            notes: "",
          }
        );

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "발급 완료",
            text: response.data.message,
          });
          fetchBadges();
          if (searchResult) {
            handleSearch();
          }
        }
      } catch (error) {
        console.error("출입증 발급 실패:", error);
        Swal.fire({
          icon: "error",
          title: "오류",
          text: error.response?.data?.message || "출입증 발급에 실패했습니다.",
        });
      }
    }
  };

  const handleReturn = async (badgeId) => {
    const result = await Swal.fire({
      title: "반납하시겠습니까?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "반납",
      cancelButtonText: "취소",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `http://localhost:3001/api/badge/return/${badgeId}`,
          { returnedBy: userId }
        );

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "반납 완료",
            text: response.data.message,
          });
          fetchBadges();
          if (searchResult) {
            handleSearch();
          }
        }
      } catch (error) {
        console.error("출입증 반납 실패:", error);
        Swal.fire({
          icon: "error",
          title: "오류",
          text: "출입증 반납에 실패했습니다.",
        });
      }
    }
  };

  useEffect(() => {
    fetchBadges();
    fetchApprovedRequests();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      issued: { text: "발급됨", color: "bg-blue-100 text-blue-800" },
      returned: { text: "반납됨", color: "bg-green-100 text-green-800" },
      lost: { text: "분실", color: "bg-red-100 text-red-800" },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 모바일 버전 */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">출입증 관리</h1>

          {/* 검색 */}
          <div className="mb-4">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={searchBadgeNumber}
                onChange={(e) => setSearchBadgeNumber(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="출입증 번호로 검색"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                검색
              </button>
            </div>
          </div>

          {/* 검색 결과 */}
          {searchResult && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-bold mb-2">검색 결과</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">출입증 번호:</span>{" "}
                  {searchResult.badge.badgeNumber}
                </p>
                <p>
                  <span className="font-semibold">방문자명:</span>{" "}
                  {searchResult.request.visitorName}
                </p>
                <p>
                  <span className="font-semibold">방문일자:</span>{" "}
                  {searchResult.request.visitDate}
                </p>
                <p>
                  <span className="font-semibold">상태:</span>{" "}
                  {getStatusBadge(searchResult.badge.status)}
                </p>
                {searchResult.badge.status === "issued" && (
                  <button
                    onClick={() => handleReturn(searchResult.badge.id)}
                    className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  >
                    반납 처리
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 발급 대기 목록 */}
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-3">출입증 발급 대기</h2>
            {loading ? (
              <p className="text-gray-500">로딩 중...</p>
            ) : (
              <div className="space-y-3">
                {approvedRequests
                  .filter((request) => {
                    const existingBadge = badges.find(
                      (b) => b.requestId === request.id && b.status === "issued"
                    );
                    return !existingBadge;
                  })
                  .map((request) => (
                    <div
                      key={request.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <p className="font-semibold text-sm">{request.visitorName}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {request.visitDate}
                      </p>
                      <button
                        onClick={() => handleIssue(request.id)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm"
                      >
                        출입증 발급
                      </button>
                    </div>
                  ))}
                {badges
                  .filter((badge) => badge.status === "issued")
                  .map((badge) => (
                    <div
                      key={badge.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <p className="font-semibold text-sm">
                        출입증: {badge.badgeNumber}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {badge.issuedAt
                          ? new Date(badge.issuedAt).toLocaleString("ko-KR")
                          : "-"}
                      </p>
                      <button
                        onClick={() => handleReturn(badge.id)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
                      >
                        반납
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 전체 목록 */}
          <div>
            <h2 className="text-lg font-bold mb-3">전체 출입증</h2>
            {loading ? (
              <p className="text-gray-500">로딩 중...</p>
            ) : (
              <div className="space-y-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-semibold">번호:</span>{" "}
                        {badge.badgeNumber}
                      </p>
                      <p>
                        <span className="font-semibold">발급일:</span>{" "}
                        {badge.issuedAt
                          ? new Date(badge.issuedAt).toLocaleString("ko-KR")
                          : "-"}
                      </p>
                      <p>
                        <span className="font-semibold">반납일:</span>{" "}
                        {badge.returnedAt
                          ? new Date(badge.returnedAt).toLocaleString("ko-KR")
                          : "-"}
                      </p>
                      <p>
                        <span className="font-semibold">상태:</span>{" "}
                        {getStatusBadge(badge.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 웹 버전 */}
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">출입증 관리</h1>

          <div className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchBadgeNumber}
                onChange={(e) => setSearchBadgeNumber(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="출입증 번호로 검색"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                검색
              </button>
            </div>
          </div>

          {searchResult && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">검색 결과</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">출입증 번호:</span>{" "}
                  {searchResult.badge.badgeNumber}
                </p>
                <p>
                  <span className="font-semibold">방문자명:</span>{" "}
                  {searchResult.request.visitorName}
                </p>
                <p>
                  <span className="font-semibold">방문일자:</span>{" "}
                  {searchResult.request.visitDate}
                </p>
                <p>
                  <span className="font-semibold">상태:</span>{" "}
                  {getStatusBadge(searchResult.badge.status)}
                </p>
                {searchResult.badge.status === "issued" && (
                  <button
                    onClick={() => handleReturn(searchResult.badge.id)}
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  >
                    반납 처리
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">출입증 발급 대기 목록</h2>
          {loading ? (
            <p className="text-gray-500">로딩 중...</p>
          ) : (
            <div className="space-y-4">
              {approvedRequests
                .filter((request) => {
                  const existingBadge = badges.find(
                    (b) => b.requestId === request.id && b.status === "issued"
                  );
                  return !existingBadge;
                })
                .map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{request.visitorName}</p>
                        <p className="text-sm text-gray-500">
                          {request.visitDate} - {request.visitPurpose}
                        </p>
                      </div>
                      <button
                        onClick={() => handleIssue(request.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                      >
                        출입증 발급
                      </button>
                    </div>
                  </div>
                ))}
              {badges
                .filter((badge) => badge.status === "issued")
                .map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          출입증 번호: {badge.badgeNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          발급일:{" "}
                          {badge.issuedAt
                            ? new Date(badge.issuedAt).toLocaleString("ko-KR")
                            : "-"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleReturn(badge.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                      >
                        반납
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">전체 출입증 목록</h2>
          {loading ? (
            <p className="text-gray-500">로딩 중...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      출입증 번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      방문자명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      발급일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      반납일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {badges.map((badge) => (
                    <tr key={badge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {badge.badgeNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {badge.issuedAt
                          ? new Date(badge.issuedAt).toLocaleString("ko-KR")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {badge.returnedAt
                          ? new Date(badge.returnedAt).toLocaleString("ko-KR")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(badge.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BadgeManagement;
