CREATE OR REPLACE VIEW "BranchDailySales" AS
SELECT 
  b.id AS "branchId",
  b.name AS "branchName",
  CAST(DATE(i."createdAt") AS timestamp) AS "date",
  COALESCE(SUM(i."finalAmount"), 0) AS "totalRevenue",
  CAST(COUNT(i.id) AS int) AS "totalInvoices"
FROM "Branch" b
LEFT JOIN "Invoice" i ON b.id = i."branchId" AND i."paymentStatus" = 'PAID'
GROUP BY b.id, b.name, DATE(i."createdAt");
