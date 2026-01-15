import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminNotices = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/notice');
        setNotices(response.data);
      } catch (error) {
        console.log("공지사항 가져오기 실패: " + error);
      }
    };
    fetchNotices();
  }, []);

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const fieldValue = notice[searchType];
      const value = (fieldValue || "").toLowerCase();
      const matchesSearch = value.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "" || String(notice.purpose) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [notices, searchTerm, searchType, statusFilter]);

  const totalPages = pageSize > 0 ? Math.ceil(filteredNotices.length / pageSize) : 1;
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotices.slice(start, start + pageSize);
  }, [filteredNotices, currentPage, pageSize]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto py-16 md:py-32">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-center">
        공지사항 관리
      </h1>

      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex w-full md:w-auto gap-2">
          <select
            className="border rounded px-3 py-2 text-base"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="title">제목</option>
            <option value="authorId">작성자</option>
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
            <option value="">공지목적</option>
            <option value="1">안내</option>
            <option value="2">점검</option>
            <option value="3">공지</option>
          </select>
        </div>

        <button
          onClick={() => navigate("/admin/create-notice")}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-center"
        >
          추가하기
        </button>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg font-bold text-gray-600"> 총 {paginatedNotices.length}개의 게시물 </div>

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
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[8%]">
                번호
              </th>
              <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[8%]">
                구분
              </th>
              <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-auto">
                제목
              </th>
              <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[15%]">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[8%]">
                등록일시
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedNotices.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500"> 검색 결과가 없습니다. </td>
              </tr>
            ) : (
              paginatedNotices.map((notice, index) => (
                <tr 
                  key={notice.id} 
                  className="hover:bg-gray-50 cursor-pointer" 
                  onClick={() => navigate(`/admin/modify-notice/${notice.id}`)}
                >
                  <td className="px-4 py-3">
                    {notice.isPinned === 1 ? (
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M2 2v20h2V2H2zm4 0h12l-2 4 2 4H6V2z" />
                      </svg>
                    ) : (
                      <>#{(currentPage - 1) * pageSize + index + 1}</>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{notice.codeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{notice.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{notice.authorId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(notice.createdAt).toISOString().split('T')[0]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedNotices.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow">
            검색 결과가 없습니다.
          </div>
        ) : (
          paginatedNotices.map((notice, index) => (
            <div 
              key={notice.id} 
              className="p-4 rounded-lg bg-white shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/admin/modify-notice/${notice.id}`)}
            >
              <div className="text-lg font-bold">
              {notice.isPinned === 1 ? (
                <svg
                  className="w-7 h-7 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 2v20h2V2H2zm4 0h12l-2 4 2 4H6V2z" />
                </svg>
              ) : (
                <>#{(currentPage - 1) * pageSize + index + 1}</>
              )}
              </div>
              <div className="text-gray-600">[{notice.codeName}] {notice.title}</div>
              <div className="text-gray-600">작성자: {notice.authorId}</div>
              <div className="text-gray-600">등록일: {new Date(notice.createdAt).toISOString().split('T')[0]}</div>
            </div>
          ))
        )}
      </div>


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

export default AdminNotices;
