// MariaDB용 Statistics 모델
class Statistics {
  // 출입 통계 조회 (월별/년별)
  static async getVisitStatistics(db, period, date, dateFrom, dateTo) {
    if (!db) {
      throw new Error("데이터베이스 연결이 없습니다.");
    }

    let query;
    if (period === "month" && date) {
      // 월별 통계 - 선택한 년도의 12개 월별 통계 (1월~12월 모두 표시)
      query = `
        SELECT 
          CONCAT(?, '-', LPAD(months.month_num, 2, '0')) as date,
          COALESCE(SUM(totalVisits), 0) as totalVisits,
          COALESCE(SUM(approvedVisits), 0) as approvedVisits,
          COALESCE(SUM(rejectedVisits), 0) as rejectedVisits
        FROM (
          SELECT 1 as month_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 
          UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
        ) months
        LEFT JOIN (
          SELECT 
            MONTH(visitDateFrom) as month_num,
            COUNT(*) as totalVisits,
            COUNT(CASE WHEN status = 'approver_lv2_approved' THEN 1 END) as approvedVisits,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejectedVisits
          FROM visit_visitor_requests
          WHERE DATE_FORMAT(visitDateFrom, '%Y') = ?
          GROUP BY MONTH(visitDateFrom)
        ) stats ON months.month_num = stats.month_num
        GROUP BY months.month_num
        ORDER BY months.month_num ASC
      `;
      const [rows] = await db.execute(query, [date, date]);
      return rows;
    } else if (period === "year" && dateFrom && dateTo) {
      // 년별 통계 - dateFrom ~ dateTo 범위의 모든 년도별 통계 (데이터 없는 년도도 0으로 표시)
      const yearFrom = parseInt(dateFrom);
      const yearTo = parseInt(dateTo);
      
      // 년도 리스트 생성
      let yearsList = '';
      for (let year = yearFrom; year <= yearTo; year++) {
        if (yearsList) yearsList += ' UNION ';
        yearsList += `SELECT ${year} as year_num`;
      }
      
      query = `
        SELECT 
          CAST(years.year_num AS CHAR) as date,
          COALESCE(SUM(stats.totalVisits), 0) as totalVisits,
          COALESCE(SUM(stats.approvedVisits), 0) as approvedVisits,
          COALESCE(SUM(stats.rejectedVisits), 0) as rejectedVisits
        FROM (
          ${yearsList}
        ) years
        LEFT JOIN (
          SELECT 
            CAST(DATE_FORMAT(visitDateFrom, '%Y') AS UNSIGNED) as year_num,
            COUNT(*) as totalVisits,
            COUNT(CASE WHEN status = 'approver_lv2_approved' THEN 1 END) as approvedVisits,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejectedVisits
          FROM visit_visitor_requests
          WHERE DATE_FORMAT(visitDateFrom, '%Y') >= ? AND DATE_FORMAT(visitDateFrom, '%Y') <= ?
          GROUP BY DATE_FORMAT(visitDateFrom, '%Y')
        ) stats ON years.year_num = stats.year_num
        GROUP BY years.year_num
        ORDER BY years.year_num DESC
      `;
      const [rows] = await db.execute(query, [dateFrom, dateTo]);
      return rows;
    } else {
      throw new Error("period (month/year)와 적절한 date 파라미터가 필요합니다.");
    }
  }

}

module.exports = Statistics;

