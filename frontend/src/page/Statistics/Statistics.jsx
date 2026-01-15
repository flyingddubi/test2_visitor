import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Statistics() {
  const [visitStats, setVisitStats] = useState([]);
  const [badgeStats, setBadgeStats] = useState([]);
  const [period, setPeriod] = useState("month");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, period === "month" ? 7 : 10)
  );
  const [loading, setLoading] = useState(false);

  const fetchVisitStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3001/api/statistics/visits?period=${period}&date=${date}`
      );
      if (response.data.success) {
        setVisitStats(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data].filter(Boolean)
        );
      }
    } catch (error) {
      console.error("출입 통계 조회 실패:", error);
      Swal.fire({
        icon: "error",
        title: "오류",
        text: "출입 통계를 불러오는데 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBadgeStats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/statistics/badges?period=${period}&date=${date}`
      );
      if (response.data.success) {
        setBadgeStats(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data].filter(Boolean)
        );
      }
    } catch (error) {
      console.error("출입증 통계 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchVisitStats();
    fetchBadgeStats();
  }, [period, date]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 모바일 버전 */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">통계 조회</h1>

          {/* 기간 선택 */}
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기간
              </label>
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  const newDate =
                    e.target.value === "month"
                      ? new Date().toISOString().slice(0, 7)
                      : new Date().toISOString().slice(0, 10);
                  setDate(newDate);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="month">월별</option>
                <option value="day">일별</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 선택
              </label>
              <input
                type={period === "month" ? "month" : "date"}
                value={date}
                onChange={handleDateChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                fetchVisitStats();
                fetchBadgeStats();
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              조회
            </button>
          </div>

          {/* 출입 통계 */}
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-3">출입 통계</h2>
            {loading ? (
              <p className="text-gray-500">로딩 중...</p>
            ) : visitStats.length === 0 ? (
              <p className="text-gray-500">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {visitStats.map((stat, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-semibold">날짜:</span> {stat.date}
                      </p>
                      <p>
                        <span className="font-semibold">전체 요청:</span>{" "}
                        {stat.totalVisits}
                      </p>
                      <p>
                        <span className="font-semibold">승인 완료:</span>{" "}
                        <span className="text-green-600">
                          {stat.approvedVisits}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">반려:</span>{" "}
                        <span className="text-red-600">
                          {stat.rejectedVisits}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 출입증 통계 */}
          <div>
            <h2 className="text-lg font-bold mb-3">출입증 통계</h2>
            {loading ? (
              <p className="text-gray-500">로딩 중...</p>
            ) : badgeStats.length === 0 ? (
              <p className="text-gray-500">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {badgeStats.map((stat, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-semibold">날짜:</span> {stat.date}
                      </p>
                      <p>
                        <span className="font-semibold">발급 수:</span>{" "}
                        {stat.totalIssued}
                      </p>
                      <p>
                        <span className="font-semibold">반납 수:</span>{" "}
                        <span className="text-green-600">
                          {stat.returnedCount}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">미반납 수:</span>{" "}
                        <span className="text-yellow-600">
                          {stat.notReturnedCount}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">반납률:</span>{" "}
                        <span className="text-blue-600">
                          {stat.returnRate ? `${stat.returnRate}%` : "-"}
                        </span>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">통계 조회</h1>

          <div className="mb-6 flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기간
              </label>
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  const newDate =
                    e.target.value === "month"
                      ? new Date().toISOString().slice(0, 7)
                      : new Date().toISOString().slice(0, 10);
                  setDate(newDate);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="month">월별</option>
                <option value="day">일별</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 선택
              </label>
              <input
                type={period === "month" ? "month" : "date"}
                value={date}
                onChange={handleDateChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                fetchVisitStats();
                fetchBadgeStats();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              조회
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">출입 통계</h2>
          {loading ? (
            <p className="text-gray-500">로딩 중...</p>
          ) : visitStats.length === 0 ? (
            <p className="text-gray-500">데이터가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전체 요청
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      승인 완료
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      반려
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visitStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.totalVisits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {stat.approvedVisits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {stat.rejectedVisits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">출입증 통계</h2>
          {loading ? (
            <p className="text-gray-500">로딩 중...</p>
          ) : badgeStats.length === 0 ? (
            <p className="text-gray-500">데이터가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      발급 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      반납 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      미반납 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      반납률
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {badgeStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.totalIssued}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {stat.returnedCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {stat.notReturnedCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {stat.returnRate ? `${stat.returnRate}%` : "-"}
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

export default Statistics;
