import { Product } from "@/types";

/**
 * Escapes values safely for CSV RFC 4180 compliance.
 */
const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Exports products directly to a clean, excel-compatible CSV file in the browser.
 */
export const exportProductsToCSV = (
  products: Product[],
  filename = `products_catalog_${new Date().toISOString().slice(0, 10)}.csv`
) => {
  if (!products || products.length === 0) return false;

  const headers = [
    "ID",
    "Product Name",
    "Category",
    "Brand",
    "Selling Price (₹)",
    "MRP (₹)",
    "Discount (%)",
    "Stock",
    "Status",
    "HSN Code",
    "Warranty",
    "Created Date",
  ];

  const rows = products.map((p) => [
    escapeCSV(p._id),
    escapeCSV(p.name),
    escapeCSV((p.category as any)?.name || p.category || ""),
    escapeCSV((p.brand as any)?.name || p.brand || ""),
    escapeCSV(p.sellingPrice),
    escapeCSV(p.maximumRetailPrice || p.sellingPrice),
    escapeCSV(p.discount || 0),
    escapeCSV(p.stock || 0),
    escapeCSV(p.isActive ? "Active" : "Inactive"),
    escapeCSV((p as any).hsnCode || ""),
    escapeCSV(p.warranty || ""),
    escapeCSV(p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""),
  ]);

  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Downloads a ready-to-fill sample CSV template for importing products.
 */
export const downloadSampleCSVTemplate = () => {
  const sampleHeaders = [
    "Product Name",
    "Selling Price",
    "MRP",
    "Discount",
    "Stock",
    "Category",
    "Brand",
    "Description",
    "HSN Code",
    "Warranty",
    "Status",
  ];

  const sampleRows = [
    [
      '"Pro Running Shoes"',
      "2499",
      "3999",
      "37",
      "100",
      '"Footwear"',
      '"Nike"',
      '"High performance breathable running shoes"',
      '"6404"',
      '"6 Months"',
      '"Active"',
    ],
    [
      '"Casual Cotton T-Shirt"',
      "499",
      "999",
      "50",
      "250",
      '"Clothing"',
      '"Puma"',
      '"100% bio-washed cotton crew neck t-shirt"',
      '"6109"',
      '""',
      '"Active"',
    ],
  ];

  const csvContent =
    "\uFEFF" + [sampleHeaders.join(","), ...sampleRows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "products_sample_import_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Lightweight, fast, RFC 4180 compliant CSV parser.
 */
export const parseCSVToProducts = (csvText: string): any[] => {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = "";
      if (char === "\r" && csvText[i + 1] === "\n") i++;
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  if (lines.length < 2) return [];

  const parseRow = (rowStr: string): string[] => {
    const cells: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let j = 0; j < rowStr.length; j++) {
      const c = rowStr[j];
      if (c === '"') {
        if (inQuotes && rowStr[j + 1] === '"') {
          cell += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += c;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  const headerRow = parseRow(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  const products: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const rowObj: any = {};
    headerRow.forEach((header, idx) => {
      rowObj[header] = row[idx] || "";
    });

    const name = rowObj.productname || rowObj.name || rowObj.title || "";
    const sellingPrice = Number(rowObj.sellingprice || rowObj.price || 0);
    const mrp = Number(rowObj.mrp || rowObj.maximumretailprice || sellingPrice);
    const stock = Number(rowObj.stock || rowObj.quantity || 0);
    const discount = Number(rowObj.discount || 0);
    const category = rowObj.category || rowObj.categoryname || "";
    const brand = rowObj.brand || rowObj.brandname || "";
    const description = rowObj.description || "";
    const hsnCode = rowObj.hsncode || rowObj.hsn || "";
    const warranty = rowObj.warranty || "";
    const isActive = rowObj.status
      ? rowObj.status.toLowerCase() !== "inactive"
      : true;

    if (name && sellingPrice > 0) {
      products.push({
        name,
        sellingPrice,
        maximumRetailPrice: mrp >= sellingPrice ? mrp : sellingPrice,
        stock: Math.max(0, stock),
        discount: discount >= 0 && discount <= 100 ? discount : 0,
        categoryName: category,
        brandName: brand,
        description,
        hsnCode,
        warranty,
        isActive,
      });
    }
  }

  return products;
};

/**
 * Exports orders directly to an Excel-compatible CSV file.
 */
export const exportOrdersToCSV = (
  orders: any[],
  filename = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`
) => {
  if (!orders || orders.length === 0) return false;

  const headers = [
    "Order ID",
    "Order Date",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Order Status",
    "Payment Method",
    "Payment Status",
    "Total Amount (₹)",
    "Items Count",
    "Items Summary",
    "Delivery City",
    "Delivery State",
    "Pincode",
    "Delivery Address",
  ];

  const rows = orders.map((o) => {
    const isPaid =
      o.isPaid ||
      ["paid", "completed", "success", "captured"].includes(
        (o.paymentInfo?.status || "").toLowerCase()
      );
    const paymentStatus = isPaid ? "PAID" : (o.paymentInfo?.status || "PENDING").toUpperCase();
    const itemsSummary = (o.orderItems || [])
      .map((i: any) => `${i.name || "Item"} (x${i.quantity || 1})`)
      .join("; ");

    return [
      escapeCSV(o._id),
      escapeCSV(o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""),
      escapeCSV(o.user?.name || o.shippingAddress?.fullName || ""),
      escapeCSV(o.user?.email || ""),
      escapeCSV(o.shippingAddress?.phone || o.user?.phone || ""),
      escapeCSV(o.orderStatus || "Ordered"),
      escapeCSV(o.paymentInfo?.paymentMethod || o.paymentMethod || "Online"),
      escapeCSV(paymentStatus),
      escapeCSV(o.totalPrice || 0),
      escapeCSV(o.orderItems?.length || 0),
      escapeCSV(itemsSummary),
      escapeCSV(o.shippingAddress?.city || ""),
      escapeCSV(o.shippingAddress?.state || ""),
      escapeCSV(o.shippingAddress?.postalCode || o.shippingAddress?.pincode || ""),
      escapeCSV(o.shippingAddress?.address || ""),
    ];
  });

  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Exports customers directly to an Excel-compatible CSV file.
 */
export const exportCustomersToCSV = (
  customers: any[],
  filename = `customers_export_${new Date().toISOString().slice(0, 10)}.csv`
) => {
  if (!customers || customers.length === 0) return false;

  const headers = [
    "Customer ID",
    "Name",
    "Email",
    "Phone",
    "Role",
    "Reward Coins",
    "All-Time Purchases (₹)",
    "Total Orders",
    "Registration Date",
    "Email Verified",
  ];

  const rows = customers.map((c) => [
    escapeCSV(c._id),
    escapeCSV(c.name || ""),
    escapeCSV(c.email || ""),
    escapeCSV(c.phone || ""),
    escapeCSV(c.role || "user"),
    escapeCSV(c.rewardPoints ?? c.coins ?? 0),
    escapeCSV(c.purchasedAmount || 0),
    escapeCSV(c.ordersCount || 0),
    escapeCSV(c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""),
    escapeCSV(c.isEmailVerified ? "Yes" : "No"),
  ]);

  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};
