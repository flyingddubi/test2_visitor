import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function ApprovalList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userType, setUserType] = useState("user");
  const [userId, setUserId] = useState(1);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/visitor-request");
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error("방문 요청 목록 조회 실패:", error);
      Swal.fire({
        icon: "error",
        title: "오류",
        text: "방문 요청 목록을 불러오는데 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId, level) => {
    try {
      let endpoint = "";
      if (level === "user") {
        endpoint = `/api/approval/user/${requestId}`;
      } else if (level === "approver_lv1") {
        endpoint = `/api/approval/approver-lv1/${requestId}`;
      } else if (level === "approver_lv2") {
        endpoint = `/api/approval/approver-lv2/${requestId}`;
      }

      const response = await axios.post(
        `http://localhost:3001${endpoint}`,
        { userId, comment: "" }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "승인 완료",
          text: response.data.message,
        });
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("승인 처리 실패:", error);
      Swal.fire({
        icon: "error",
        title: "오류",
        text: error.response?.data?.message || "승인 처리에 실패했습니다.",
      });
    }
  };

  const handleReject = async (requestId) => {
    const { value: rejectionReason } = await Swal.fire({
      title: "반려 사유 입력",
      input: "textarea",
      inputLabel: "반려 사유",
      inputPlaceholder: "반려 사유를 입력하세요...",
      inputAttributes: {
        "aria-label": "반려 사유를 입력하세요",
      },
      showCancelButton: true,
      confirmButtonText: "반려",
      cancelButtonText: "취소",
      inputValidator: (value) => {
        if (!value) {
          return "반려 사유를 입력해주세요.";
        }
      },
    });

    if (rejectionReason) {
      try {
        const response = await axios.post(
          `http://localhost:3001/api/approval/reject/${requestId}`,
          {
            userId,
            rejectionReason,
            approvalLevel: userType,
          }
        );

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "반려 완료",
            text: response.data.message,
          });
          fetchRequests();
          setSelectedRequest(null);
        }
      } catch (error) {
        console.error("반려 처리 실패:", error);
        Swal.fire({
          icon: "error",
          title: "오류",
          text: "반려 처리에 실패했습니다.",
        });
      }
    }
  };

  const canApprove = (request, level) => {
    if (level === "user") {
      return request.status === "pending";
    } else if (level === "approver_lv1") {
      return request.status === "user_approved";
    } else if (level === "approver_lv2") {
      return request.status === "approver_lv1_approved";
    }
    return false;
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: "대기중", color: "bg-yellow-100 text-yellow-800" },
      user_approved: { text: "내부자 승인", color: "bg-blue-100 text-blue-800" },
      approver_lv1_approved: {
        text: "1차 승인",
        color: "bg-purple-100 text-purple-800",
      },
      approver_lv2_approved: {
        text: "2차 승인 완료",
        color: "bg-green-100 text-green-800",
      },
      rejected: { text: "반려", color: "bg-red-100 text-red-800" },
      expired: { text: "만료", color: "bg-gray-100 text-gray-800" },
      completed: { text: "완료", color: "bg-green-100 text-green-800" },
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">승인 관리</h1>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {request.visitorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.visitorPhone}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.visitDate}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm"
                      >
                        상세보기
                      </button>
                      {canApprove(request, userType) && (
                        <>
                          <button
                            onClick={() => handleApproval(request.id, userType)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
                          >
                            반려
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 웹 버전 */}
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">승인 관리</h1>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      방문자명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전화번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      방문일자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.visitorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.visitorPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.visitDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          상세보기
                        </button>
                        {canApprove(request, userType) && (
                          <>
                            <button
                              onClick={() => handleApproval(request.id, userType)}
                              className="text-green-600 hover:text-green-900 mr-2"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              반려
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">방문 요청 상세</h2>
            <div className="space-y-4">
              <div>
                <label className="font-semibold">방문자명:</label>
                <p>{selectedRequest.visitorName}</p>
              </div>
              <div>
                <label className="font-semibold">전화번호:</label>
                <p>{selectedRequest.visitorPhone}</p>
              </div>
              <div>
                <label className="font-semibold">회사명:</label>
                <p>{selectedRequest.visitorCompany || "-"}</p>
              </div>
              <div>
                <label className="font-semibold">이메일:</label>
                <p>{selectedRequest.visitorEmail || "-"}</p>
              </div>
              <div>
                <label className="font-semibold">방문일자:</label>
                <p>{selectedRequest.visitDate}</p>
              </div>
              <div>
                <label className="font-semibold">방문 목적:</label>
                <p>{selectedRequest.visitPurpose}</p>
              </div>
              <div>
                <label className="font-semibold">내부 담당자:</label>
                <p>{selectedRequest.internalContact || "-"}</p>
              </div>
              <div>
                <label className="font-semibold">방문 장소:</label>
                <p>{selectedRequest.location || "-"}</p>
              </div>
              <div>
                <label className="font-semibold">상태:</label>
                <p>{getStatusBadge(selectedRequest.status)}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalList;
