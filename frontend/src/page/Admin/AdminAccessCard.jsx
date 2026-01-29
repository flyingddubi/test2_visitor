import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminAccessCard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('visitorName');
  const [statusFilter, setStatusFilter] = useState("");
  const [issueStatusFilter, setIssueStatusFilter] = useState(""); // 발급구분 필터
  const [issueStatusMap, setIssueStatusMap] = useState({}); // { reqId: "반납완료" | "발급중" }

  // 발급 상태 조회 함수
  const fetchIssueStatus = async (reqId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/request/visitors/${reqId}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const visitors = response.data.data;
        // 방문자가 없으면 "발급중"
        if (visitors.length === 0) {
          return "발급중";
        }
        // 모든 방문자의 accessCardIssueStat이 'R' 또는 'P'인지 확인
        const allReturnedOrNoIssue = visitors.every(visitor => 
          visitor.accessCardIssueStat === 'R' || visitor.accessCardIssueStat === 'P'
        );
        return allReturnedOrNoIssue ? "반납완료" : "발급중";
      }
      return "발급중";
    } catch (error) {
      console.error(`발급 상태 조회 실패 (reqId: ${reqId}):`, error);
      return "발급중";
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/request');
        // response.data가 배열인지 확인
        const data = Array.isArray(response.data) ? response.data : [];
        setRequests(data);
        
        // 각 request의 발급 상태 조회
        const statusPromises = data.map(async (request) => {
          if (request.reqId) {
            const status = await fetchIssueStatus(request.reqId);
            return { reqId: request.reqId, status };
          }
          return null;
        });
        
        const statusResults = await Promise.all(statusPromises);
        const statusMap = {};
        statusResults.forEach(result => {
          if (result) {
            statusMap[result.reqId] = result.status;
          }
        });
        setIssueStatusMap(statusMap);
      } catch (error) {
        console.error("방문요청 가져오기 실패: ", error);
        setRequests([]); // 에러 발생 시 빈 배열로 설정
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const fieldValue = request[searchType];
      const value = (fieldValue || "").toLowerCase();
      const matchesSearch = value.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "" || String(request.status) === statusFilter;
      const issueStatus = issueStatusMap[request.reqId] || "발급중";
      const matchesIssueStatus = 
        issueStatusFilter === "" || 
        (issueStatusFilter === "발급완료" && issueStatus === "반납완료") ||
        (issueStatusFilter === "발급중" && issueStatus === "발급중");
      return matchesSearch && matchesStatus && matchesIssueStatus;
    });
  }, [requests, searchTerm, searchType, statusFilter, issueStatusFilter, issueStatusMap]);

  const totalPages = pageSize > 0 ? Math.ceil(filteredRequests.length / pageSize) : 1;
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto py-16 md:py-32">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-center">
        입/출입 관리
      </h1>

      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex w-full md:w-auto gap-2">
          <select
            className="border rounded px-3 py-2 text-base"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="visitorName">방문자</option>
            <option value="visitorCompany">방문회사</option>
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
            value={issueStatusFilter}
            onChange={(e) => setIssueStatusFilter(e.target.value)}
          >
            <option value="">발급구분</option>
            <option value="발급중">발급중</option>
            <option value="발급완료">발급완료</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg font-bold text-gray-600"> 총 {paginatedRequests.length}개의 게시물 </div>

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

      <div className="hidden md:block overflow-x-auto">
        {/* <table className="min-w-full bg-white border rounded-lg"> */}
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden text-sm lg:text-lg font-bold">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[7%]">
                번호
              </th>
              <th className="px-4 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[10%]">
                발급구분
              </th>
              <th className="px-4 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[10%]">
                결재상태
              </th>
              <th className="px-4 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[10%]">
                방문자정보
              </th>
              <th className="px-4 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-auto">
                내부 담당자 / 방문장소
              </th>
              <th className="px-4 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[8%]">
                등록일자
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500"> 검색 결과가 없습니다. </td>
              </tr>
            ) : (
              paginatedRequests.map((request, index) => (
                <tr
                  key={request.reqId}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/detail-accessCard/${request.reqId}`)}
                >
                  <td className="px-4 py-3">
                    <>#{(currentPage - 1) * pageSize + index + 1}</>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`mx-3 px-2 py-1 rounded-full text-base ${
                        (issueStatusMap[request.reqId] || "발급중") === "반납완료"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {issueStatusMap[request.reqId] || "발급중"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.codeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.visitorName} / {request.visitorCompany}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.internalContact} / {request.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(request.createdAt).toISOString().split('T')[0]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedRequests.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow">
            검색 결과가 없습니다.
          </div>
        ) : (
          paginatedRequests.map((request, index) => (
            <div
              key={request.reqId}
              className="p-4 rounded-lg bg-white shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/admin/detail-accessCard/${request.reqId}`)}
            >
              <div className="text-lg font-bold">
                <>#{(currentPage - 1) * pageSize + index + 1}</>
                <span
                  className={`mx-3 px-2 py-1 rounded-full text-base ${
                    (issueStatusMap[request.reqId] || "발급중") === "반납완료"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  발급구분: [{issueStatusMap[request.reqId] || "발급중"}]
                </span>
              </div>
              <div className="text-gray-600">결재상태: {request.codeName}</div>
              <div className="text-gray-600">방문자정보: {request.visitorName} / {request.visitorCompany}</div>
              <div className="text-gray-600">내부 담당자 / 방문장소: {request.internalContact} / {request.location}</div>
              <div className="text-gray-600">등록일자: {new Date(request.createdAt).toISOString().split('T')[0]}</div>
            </div>
          ))
        )}
      </div>


      <div className="mt-4 flex justify-center space-x-2 text-lg font-bold">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1 || totalPages === 0}
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

export default AdminAccessCard;
