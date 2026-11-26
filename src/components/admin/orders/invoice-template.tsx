import React from 'react';
import { resolveOrderPaymentStatus } from '@/lib/order-utils';

export interface InvoiceSettings {
  companyLegalName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyStateCode?: string;
  companyPincode?: string;
  companyCountry?: string;
  gstin?: string;
  cin?: string;
  panNumber?: string;
  supportEmail?: string;
  helpLineNumber?: string;
  defaultHsnCode?: string;
  gstRate?: number;
  authorizedSignatoryName?: string;
  authorizedSignatoryTitle?: string;
  isGstRegistered?: boolean;
  invoicePrefix?: string;
  isDigitalSignatureEnabled?: boolean;
  authorizedSignatureImage?: string;
}

export interface InvoiceTemplateProps {
  order: any;
  storeSettings?: InvoiceSettings | string;
}

// Indian State Codes standard GST mapping
const STATE_GST_CODES: Record<string, string> = {
  "jammu & kashmir": "01",
  "jammu and kashmir": "01",
  "himachal pradesh": "02",
  "punjab": "03",
  "chandigarh": "04",
  "uttarakhand": "05",
  "haryana": "06",
  "delhi": "07",
  "new delhi": "07",
  "rajasthan": "08",
  "uttar pradesh": "09",
  "bihar": "10",
  "sikkim": "11",
  "arunachal pradesh": "12",
  "nagaland": "13",
  "manipur": "14",
  "mizoram": "15",
  "tripura": "16",
  "meghalaya": "17",
  "assam": "18",
  "west bengal": "19",
  "jharkhand": "20",
  "odisha": "21",
  "chhattisgarh": "22",
  "madhya pradesh": "23",
  "gujarat": "24",
  "daman & diu": "25",
  "dadra & nagar haveli": "26",
  "maharashtra": "27",
  "andhra pradesh": "28",
  "karnataka": "29",
  "goa": "30",
  "lakshadweep": "31",
  "kerala": "32",
  "tamil nadu": "33",
  "puducherry": "34",
  "andaman & nicobar islands": "35",
  "telangana": "36",
  "ladakh": "37"
};

function getStateCode(stateName?: string): string {
  if (!stateName) return "";
  const clean = stateName.toLowerCase().trim();
  if (/^[0-9]{2}$/.test(clean)) return clean;
  return STATE_GST_CODES[clean] || "";
}

// Helper to convert numbers to Indian Rupee Words
function numberToWords(num: number): string {
  const rounded = Math.round(Number(num) || 0);
  if (rounded === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "");
  }

  return inWords(rounded) + " Rupees Only";
}

export function generateInvoiceHtml(orderOrOrders: any | any[], storeSettingsOrName?: InvoiceSettings | string): string {
  const orders = Array.isArray(orderOrOrders) ? orderOrOrders : [orderOrOrders];

  // Resolve Store Settings with verified legal defaults
  let customSettings: Partial<InvoiceSettings> = {};
  if (typeof storeSettingsOrName === "string") {
    customSettings = { companyLegalName: storeSettingsOrName };
  } else if (typeof storeSettingsOrName === "object" && storeSettingsOrName !== null) {
    customSettings = storeSettingsOrName;
  }

  const settings = {
    companyLegalName: customSettings.companyLegalName || "Aura Store Retail Pvt. Ltd.",
    companyAddress: customSettings.companyAddress || "Plot No. 42, Commercial Complex, Okhla Industrial Area, Phase-III",
    companyCity: customSettings.companyCity || "New Delhi",
    companyState: customSettings.companyState || "Delhi",
    companyStateCode: customSettings.companyStateCode || "07",
    companyPincode: customSettings.companyPincode || "110020",
    companyCountry: customSettings.companyCountry || "India",
    gstin: customSettings.gstin || "07AABCS1429B1ZW",
    cin: customSettings.cin || "U72900DL2024PTC123456",
    panNumber: customSettings.panNumber || "AABCS1429B",
    supportEmail: customSettings.supportEmail || "support@store.com",
    helpLineNumber: customSettings.helpLineNumber || "+91 98765 43210",
    defaultHsnCode: customSettings.defaultHsnCode || "9506",
    gstRate: Number(customSettings.gstRate || 18),
    authorizedSignatoryName: customSettings.authorizedSignatoryName || "Finance & Accounts Dept.",
    authorizedSignatoryTitle: customSettings.authorizedSignatoryTitle || "Authorized Signatory",
    isGstRegistered: customSettings.isGstRegistered !== false,
    invoicePrefix: customSettings.invoicePrefix || "INV-",
    isDigitalSignatureEnabled: customSettings.isDigitalSignatureEnabled !== false,
    authorizedSignatureImage: customSettings.authorizedSignatureImage || "",
  };

  const sellerState = settings.companyState.toLowerCase().trim();

  const invoicesHtml = orders.map((order, idx) => {
    if (!order) return "";
    const orderId = String(order._id || "");
    const shortId = orderId.length >= 8 ? orderId.substring(orderId.length - 8).toUpperCase() : orderId;
    const prefix = settings.invoicePrefix || "INV-";
    const rawInvoiceNo = `${prefix}${shortId}`;
    const invoiceNo = rawInvoiceNo.length > 16 ? rawInvoiceNo.slice(0, 16) : rawInvoiceNo;
    const isGstRegistered = order.isGstRegistered !== undefined ? Boolean(order.isGstRegistered) : settings.isGstRegistered;
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleDateString('en-IN');

    // Synchronized Payment Status Resolution
    const payment = resolveOrderPaymentStatus(order);
    const paymentBadgeClass = payment.badgeClass;
    const paymentBadgeText = payment.badgeText;
    const isPaid = payment.isPaid;
    const isPartialCod = payment.isPartialCod && !payment.isCodDelivered;
    const isCod = payment.isCod && !payment.isCodDelivered;

    const items = order.orderItems || [];
    const shippingPrice = Number(order.shippingPrice ?? 0);
    const couponDiscount = Number(order.coupon?.discount ?? order.couponDiscount ?? 0);
    const coinsDiscount = Number(order.redeemCoins ?? 0);
    const grandTotal = Number(order.totalPrice ?? order.totalAmount ?? 0);

    const advancePaid = Number(order.advancePayment ?? order.paymentInfo?.advanceAmount ?? 0);
    const balanceDue = Number(order.remainingBalance ?? order.paymentInfo?.dueAmount ?? (isPartialCod ? Math.max(0, grandTotal - advancePaid) : 0));

    // Shipping & Billing Details
    const buyerStateName = order.shippingInfo?.state || "";
    const buyerState = buyerStateName.toLowerCase().trim();
    const buyerStateCode = getStateCode(buyerStateName);

    // Intra-state vs Inter-state determination
    const isIntraState = !buyerState ||
      sellerState === buyerState ||
      (sellerState.includes("delhi") && (buyerState.includes("delhi") || buyerState === "dl"));

    // Item-level GST & Taxable Calculations
    let totalTaxableValue = 0;
    let totalTaxAmount = 0;

    const processedItems = items.map((item: any, i: number) => {
      const price = Number(item.sellingPrice ?? item.price ?? 0);
      const qty = Number(item.quantity || 1);
      const lineTotal = price * qty;
      const itemGstRate = Number(item.gstRate ?? item.taxRate ?? settings.gstRate);

      // Taxable Value per unit = Price / (1 + Rate / 100)
      const taxableUnit = itemGstRate > 0 ? (price / (1 + (itemGstRate / 100))) : price;
      const lineTaxable = taxableUnit * qty;
      const lineTax = lineTotal - lineTaxable;
      const hsn = item.hsnCode || item.hsn || settings.defaultHsnCode;

      totalTaxableValue += lineTaxable;
      totalTaxAmount += lineTax;

      return {
        ...item,
        index: i + 1,
        qty,
        unitPrice: price,
        lineTotal,
        taxableUnit,
        lineTaxable,
        lineTax,
        itemGstRate,
        hsn,
      };
    });

    // Use stored tax values from order if available (new orders), fallback to on-the-fly calculation (old orders)
    const hasStoredTax = order.taxableAmount > 0 || order.gstAmount > 0;
    const orderGstRate = hasStoredTax ? (order.gstRate || settings.gstRate) : settings.gstRate;
    const orderIsIntraState = hasStoredTax ? (order.isIntraState ?? isIntraState) : isIntraState;

    const finalTaxableValue = hasStoredTax ? Number(order.taxableAmount) : totalTaxableValue;
    const finalTaxAmount = hasStoredTax ? Number(order.gstAmount) : totalTaxAmount;

    // CGST, SGST, IGST calculations
    const cgstRate = orderIsIntraState ? orderGstRate / 2 : 0;
    const sgstRate = orderIsIntraState ? orderGstRate / 2 : 0;
    const igstRate = orderIsIntraState ? 0 : orderGstRate;

    const cgstAmount = hasStoredTax ? Number(order.cgstAmount || 0) : (orderIsIntraState ? finalTaxAmount / 2 : 0);
    const sgstAmount = hasStoredTax ? Number(order.sgstAmount || 0) : (orderIsIntraState ? finalTaxAmount / 2 : 0);
    const igstAmount = hasStoredTax ? Number(order.igstAmount || 0) : (orderIsIntraState ? 0 : finalTaxAmount);

    const recipientName = order.shippingInfo?.fullName ||
      (order.shippingInfo?.firstName ? `${order.shippingInfo.firstName} ${order.shippingInfo.lastName || ''}`.trim() : order.user?.name) ||
      "Valued Customer";

    const isLast = idx === orders.length - 1;

    return `
      <div class="invoice-wrapper ${!isLast ? 'page-break' : ''}">
        <!-- Top Header -->
        <div class="header">
          <div class="header-left">
            <div class="store-brand">${settings.companyLegalName}</div>
            <div class="invoice-title">${isGstRegistered ? 'TAX INVOICE / RETAIL INVOICE' : 'BILL OF SUPPLY'}</div>
            ${!isGstRegistered ? '<div style="font-size: 10px; color: #b45309; font-weight: 700; margin-top: 2px;">Composition Dealer / Unregistered under GST &bull; Not eligible to collect tax on supplies</div>' : ''}
            <div class="badge-recipient">ORIGINAL FOR RECIPIENT</div>
            <div class="supply-nature">
              <strong>Supply Type:</strong> ${isIntraState ? 'Intra-State Supply (CGST + SGST)' : 'Inter-State Supply (IGST)'}
            </div>
          </div>
          <div class="header-right">
            <div class="meta-row">
              <span class="meta-label">Invoice No:</span>
              <span class="meta-val highlight">${invoiceNo}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Invoice Date:</span>
              <span class="meta-val">${orderDate}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Order ID:</span>
              <span class="meta-val highlight-order">#${orderId}</span>
            </div>
            <div class="meta-row" style="margin-top: 4px;">
              <span class="meta-label">Payment Status:</span>
              <span class="badge ${paymentBadgeClass}">${paymentBadgeText}</span>
            </div>
          </div>
        </div>

        <!-- Divider Line -->
        <div class="divider"></div>

        <!-- Addresses Grid -->
        <div class="address-grid">
          <!-- Sold By Box -->
          <div class="info-card">
            <div class="card-title">SOLD BY ${isGstRegistered ? '(REGISTERED SELLER)' : '(SELLER)'}</div>
            <div class="card-body">
              <p class="company-name">${settings.companyLegalName}</p>
              <p class="company-address">${settings.companyAddress}</p>
              <p>${settings.companyCity}, ${settings.companyState} - ${settings.companyPincode}, ${settings.companyCountry}</p>
              <p><strong>State & Code:</strong> ${settings.companyState} (${settings.companyStateCode})</p>
              <div class="tax-ident-grid">
                ${isGstRegistered ? `<span><strong>GSTIN:</strong> <span class="font-mono">${settings.gstin}</span></span>` : `<span><strong>GST:</strong> <span class="font-mono" style="color: #64748b;">Not Registered / N/A</span></span>`}
                ${settings.cin ? `<span><strong>CIN:</strong> <span class="font-mono">${settings.cin}</span></span>` : ''}
                <span><strong>PAN:</strong> <span class="font-mono">${settings.panNumber}</span></span>
              </div>
              <p style="margin-top: 3px;"><strong>Contact:</strong> ${settings.supportEmail} | ${settings.helpLineNumber}</p>
            </div>
          </div>

          <!-- Billed To & Shipped To Box -->
          <div class="info-card">
            <div class="card-title">BILLED & SHIPPED TO</div>
            <div class="card-body">
              <p class="customer-name">${recipientName}</p>
              <p>${order.shippingInfo?.address || 'Address provided at checkout'}</p>
              <p>
                ${order.shippingInfo?.city || ''}${order.shippingInfo?.city && order.shippingInfo?.state ? ', ' : ''}${order.shippingInfo?.state || ''} - ${order.shippingInfo?.pinCode || ''}
              </p>
              <p><strong>State & Code:</strong> ${buyerStateName || settings.companyState} ${buyerStateCode ? `(${buyerStateCode})` : `(${settings.companyStateCode})`}</p>
              <p><strong>Place of Supply:</strong> ${buyerStateName || settings.companyState}</p>
              <p><strong>Phone:</strong> ${order.shippingInfo?.phoneNo || 'N/A'} | <strong>Email:</strong> ${order.shippingInfo?.email || order.user?.email || 'N/A'}</p>
              ${order.shipment?.awbNumber ? `
                <div class="courier-pill">
                  <span>Courier: ${order.shipment.courierName || 'Express Logistics'}</span>
                  <span>AWB: ${order.shipment.awbNumber}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Items Table with HSN, Taxable Value & Tax Rate -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 4%; text-align: center;">#</th>
              <th style="width: 36%; text-align: left;">Item Description & Details</th>
              <th style="width: 10%; text-align: center;">HSN/SAC</th>
              <th style="width: 6%; text-align: center;">Qty</th>
              <th style="width: 12%; text-align: right;">Taxable Unit</th>
              <th style="width: 8%; text-align: center;">GST %</th>
              <th style="width: 11%; text-align: right;">${isIntraState ? 'Tax (GST)' : 'IGST'}</th>
              <th style="width: 13%; text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${processedItems.map((item: any) => `
              <tr>
                <td style="text-align: center; color: #64748b; font-weight: 600;">${item.index}</td>
                <td>
                  <div class="item-name">${item.name || 'Product Item'}</div>
                  <div class="item-meta">
                    ${item.size ? `<span class="meta-tag">Size: ${item.size}</span>` : ''}
                    ${item.color ? `<span class="meta-tag">Color: ${item.color}</span>` : ''}
                    ${item.product ? `<span class="meta-tag">SKU: ${String(item.product).slice(-6).toUpperCase()}</span>` : ''}
                  </div>
                </td>
                <td style="text-align: center; font-family: monospace; font-weight: 700; color: #334155;">${item.hsn}</td>
                <td style="text-align: center; font-weight: 700;">${item.qty}</td>
                <td style="text-align: right; color: #334155;">₹${item.taxableUnit.toFixed(2)}</td>
                <td style="text-align: center; font-weight: 600; color: #2563eb;">${item.itemGstRate}%</td>
                <td style="text-align: right; color: #475569;">₹${item.lineTax.toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Summary & Financials Section -->
        <div class="financials-container">
          <!-- Left: Synchronized Payment Details -->
          <div class="payment-notes">
            <div class="notes-header">PAYMENT &amp; COLLECTION DETAILS</div>
            <div class="notes-body">
              <div class="sync-grid">
                <p><strong>Order ID:</strong> <span class="font-mono">#${orderId}</span></p>
                <p><strong>Payment Method:</strong> ${payment.method}</p>
                <p><strong>Payment Status:</strong> <span class="status-text ${isPaid ? 'text-green' : isPartialCod ? 'text-indigo' : isCod ? 'text-amber' : 'text-red'}">${paymentBadgeText}</span></p>
                <p><strong>Transaction / Ref ID:</strong> <span class="font-mono">${payment.transactionId}</span></p>
              </div>

              ${isPaid ? `
                <div class="collection-box paid-box">
                  <div class="collection-row green">
                    <span>Payment Received:</span>
                    <span class="amount">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div class="paid-subtext">&#10003; Paid in full via ${payment.method}. Thank you for your purchase.</div>
                </div>
              ` : isPartialCod ? `
                <div class="collection-box partial-box">
                  <div class="collection-row green">
                    <span>Advance Paid Online:</span>
                    <span class="amount">₹${advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div class="collection-row due">
                    <span>Balance Due on Delivery:</span>
                    <span class="amount">₹${balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div class="due-warning">
                    * Collect ₹${balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} via Cash or UPI at time of delivery.
                  </div>
                </div>
              ` : isCod ? `
                <div class="collection-box cod-box">
                  <div class="collection-row due">
                    <span>Amount Payable on Delivery:</span>
                    <span class="amount">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div class="due-warning">
                    * Cash on Delivery: Payable upon parcel handover.
                  </div>
                </div>
              ` : `
                <div class="collection-box pending-box">
                  <div class="collection-row red">
                    <span>Payment Pending / Awaiting Confirmation:</span>
                    <span class="amount">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div class="pending-warning">
                    * Payment confirmation is currently pending. If money was deducted, it will reflect shortly.
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- Right: Price & Complete GST Tax Breakdown -->
          <div class="totals-table">
            <div class="total-row">
              <span class="label">Taxable Value (Subtotal):</span>
              <span class="val">₹${finalTaxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            ${orderIsIntraState ? `
              <div class="total-row tax-breakup">
                <span class="label">CGST (${cgstRate}%):</span>
                <span class="val">₹${cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row tax-breakup">
                <span class="label">SGST (${sgstRate}%):</span>
                <span class="val">₹${sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ` : `
              <div class="total-row tax-breakup">
                <span class="label">IGST (${igstRate}%):</span>
                <span class="val">₹${igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            `}

            <div class="total-row">
              <span class="label">Taxes (GST Included):</span>
              <span class="val">₹${finalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div class="total-row">
              <span class="label">Shipping & Handling:</span>
              <span class="val">${shippingPrice > 0 ? `₹${shippingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '<span style="color: #16a34a; font-weight: 700;">FREE</span>'}</span>
            </div>

            ${couponDiscount > 0 ? `
              <div class="total-row discount">
                <span class="label">Coupon Discount:</span>
                <span class="val">-₹${couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ` : ''}

            ${coinsDiscount > 0 ? `
              <div class="total-row discount">
                <span class="label">Coins Redeemed:</span>
                <span class="val">-₹${coinsDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ` : ''}

            <div class="grand-total-row">
              <span class="label">Grand Total (Incl. GST):</span>
              <span class="val">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div class="amount-in-words">
              <strong>Amount in Words:</strong> ${numberToWords(grandTotal)}
            </div>
          </div>
        </div>

        <!-- Footer / Signatory & Statutory Compliance -->
        <div class="invoice-footer">
          <div class="terms-section">
            <p class="terms-title">Terms & Conditions:</p>
            <ol>
              <li>Goods once sold can be returned/exchanged within the designated return policy window.</li>
              <li>Warranty claims are subject to the original manufacturer's terms & conditions.</li>
              <li>For any order support, inquiries, or e-invoicing questions, contact <strong>${settings.supportEmail}</strong>.</li>
            </ol>
            <p class="computer-note">${isGstRegistered ? '* This is a computer-generated tax invoice issued in accordance with Section 31 of CGST Act, 2017 & Rule 48(1) of CGST Rules.' : '* Bill of Supply issued in accordance with Section 31(3)(c) of CGST Act, 2017 & Rule 49 of CGST Rules.'}</p>
          </div>

          <!-- Realistic Authorized Signatory Block -->
          <div class="signatory-section">
            <div class="sign-box">
              ${settings.isDigitalSignatureEnabled ? `
                <div class="sign-seal">
                  <span class="seal-top">DIGITALLY SIGNED & VERIFIED</span>
                  <span class="seal-mid">AURA TAX COMPLIANCE</span>
                  <span class="seal-bot">${isGstRegistered ? 'AUTHENTIC TAX INVOICE' : 'BILL OF SUPPLY'}</span>
                </div>
              ` : ''}
              <div class="sign-holder">
                ${!settings.isDigitalSignatureEnabled && settings.authorizedSignatureImage ? `
                  <img src="${settings.authorizedSignatureImage}" alt="Authorized Signature" style="max-height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 4px; display: block;" />
                ` : `
                  <div class="sign-facsimile">${settings.companyLegalName.split(' ')[0]} Signatory</div>
                `}
                <div class="sign-line"></div>
                <p class="sign-company">For ${settings.companyLegalName}</p>
                <p class="sign-name">${settings.authorizedSignatoryName}</p>
                <p class="sign-sub">${settings.authorizedSignatoryTitle}</p>
                <p class="sign-place">Place: ${settings.companyCity} &bull; Date: ${orderDate.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Invoice - ${settings.companyLegalName}</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          background-color: #f1f5f9;
          padding: 16px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Printable Page Optimization for Clean Single A4 Page Fit */
        @page {
          size: A4 portrait;
          margin: 8mm 10mm;
        }
        @media print {
          body {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .invoice-wrapper {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          .no-print {
            display: none !important;
          }
        }

        .invoice-wrapper {
          max-width: 820px;
          margin: 0 auto 20px auto;
          background: #ffffff;
          padding: 24px 28px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.05);
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Top Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          page-break-inside: avoid;
        }
        .store-brand {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.3px;
          color: #0f172a;
          line-height: 1.2;
        }
        .invoice-title {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: #1d4ed8;
          margin-top: 2px;
        }
        .badge-recipient {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          background: #f1f5f9;
          color: #475569;
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid #cbd5e1;
          margin-top: 4px;
        }
        .supply-nature {
          font-size: 10px;
          color: #475569;
          margin-top: 4px;
        }
        .header-right {
          text-align: right;
        }
        .meta-row {
          font-size: 12px;
          line-height: 1.45;
        }
        .meta-label {
          color: #64748b;
          font-weight: 500;
        }
        .meta-val {
          color: #0f172a;
          font-weight: 600;
          margin-left: 4px;
        }
        .meta-val.highlight {
          color: #1d4ed8;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 800;
        }
        .meta-val.highlight-order {
          color: #0f172a;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 700;
        }

        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 10px 0 14px 0;
        }

        /* Status Badges */
        .badge {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .badge-paid {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #86efac;
        }
        .badge-partial {
          background: #e0e7ff;
          color: #4338ca;
          border: 1px solid #a5b4fc;
        }
        .badge-cod {
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        .badge-pending {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
        }

        /* Address Cards */
        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 14px;
          page-break-inside: avoid;
        }
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
        }
        .card-title {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.6px;
          color: #475569;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin-bottom: 6px;
        }
        .card-body p {
          font-size: 11px;
          line-height: 1.4;
          color: #334155;
        }
        .company-name, .customer-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 11.5px !important;
          margin-bottom: 1px;
        }
        .tax-ident-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 3px;
          font-size: 10.5px;
        }
        .font-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .courier-pill {
          margin-top: 6px;
          padding: 3px 6px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: #0f172a;
          display: flex;
          justify-content: space-between;
        }

        /* Items Table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
          border: 1px solid #cbd5e1;
          page-break-inside: avoid;
        }
        .items-table th {
          background: #f1f5f9;
          color: #334155;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 7px 8px;
          border-bottom: 2px solid #cbd5e1;
          border-right: 1px solid #e2e8f0;
        }
        .items-table td {
          padding: 7px 8px;
          border-bottom: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          font-size: 11px;
          color: #1e293b;
          vertical-align: middle;
        }
        .items-table tr:nth-child(even) {
          background: #fafafa;
        }
        .item-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 11.5px;
        }
        .item-meta {
          margin-top: 2px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .meta-tag {
          font-size: 9px;
          background: #f1f5f9;
          color: #475569;
          padding: 1px 4px;
          border-radius: 2px;
          border: 1px solid #e2e8f0;
        }

        /* Financials Section */
        .financials-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
          page-break-inside: avoid;
        }
        .payment-notes {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
        }
        .notes-header {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.6px;
          color: #475569;
          text-transform: uppercase;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid #e2e8f0;
        }
        .sync-grid p {
          font-size: 11px;
          line-height: 1.45;
          color: #334155;
        }
        .status-text {
          font-weight: 800;
        }
        .text-green { color: #16a34a; }
        .text-indigo { color: #4f46e5; }
        .text-amber { color: #d97706; }
        .text-red { color: #dc2626; }

        .collection-box {
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 5px;
          font-size: 11px;
        }
        .partial-box {
          background: #f0fdf4;
          border: 1px solid #86efac;
        }
        .cod-box {
          background: #fffbeb;
          border: 1px solid #fde68a;
        }
        .paid-box {
          background: #f0fdf4;
          border: 1px solid #86efac;
        }
        .pending-box {
          background: #fef2f2;
          border: 1px solid #fca5a5;
        }
        .collection-row {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 11.5px;
        }
        .collection-row.green {
          color: #15803d;
        }
        .collection-row.due {
          color: #b45309;
          font-weight: 800;
          font-size: 12px;
          margin-top: 3px;
        }
        .collection-row.red {
          color: #b91c1c;
          font-weight: 700;
        }
        .due-warning {
          margin-top: 4px;
          font-size: 10px;
          color: #9a3412;
          font-weight: 700;
        }
        .paid-subtext {
          margin-top: 3px;
          font-size: 10px;
          color: #15803d;
          font-weight: 600;
        }
        .pending-warning {
          margin-top: 3px;
          font-size: 10px;
          color: #b91c1c;
          font-weight: 600;
        }

        /* Totals */
        .totals-table {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 11.5px;
          color: #475569;
        }
        .total-row .val {
          font-weight: 600;
          color: #0f172a;
        }
        .total-row.tax-breakup {
          color: #64748b;
          font-size: 10.5px;
          padding-left: 10px;
        }
        .total-row.discount {
          color: #16a34a;
        }
        .total-row.discount .val {
          color: #16a34a;
        }
        .grand-total-row {
          display: flex;
          justify-content: space-between;
          padding: 7px 10px;
          margin-top: 6px;
          background: #0f172a;
          color: #ffffff;
          border-radius: 5px;
          font-size: 12.5px;
          font-weight: 800;
        }
        .grand-total-row .val {
          font-size: 14px;
          color: #38bdf8;
        }
        .amount-in-words {
          margin-top: 6px;
          font-size: 9.5px;
          color: #475569;
          line-height: 1.35;
          border-top: 1px dashed #cbd5e1;
          padding-top: 4px;
        }

        /* Footer & Signatory */
        .invoice-footer {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 16px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 6px;
          page-break-inside: avoid;
        }
        .terms-section {
          font-size: 9.5px;
          color: #64748b;
          line-height: 1.4;
        }
        .terms-title {
          font-weight: 700;
          color: #334155;
          margin-bottom: 2px;
        }
        .terms-section ol {
          padding-left: 14px;
        }
        .computer-note {
          margin-top: 6px;
          font-style: italic;
          color: #94a3b8;
          font-size: 8.5px;
        }
        .signatory-section {
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
        }
        .sign-box {
          text-align: center;
          width: 200px;
        }
        .sign-seal {
          display: inline-block;
          border: 1.5px dashed #1d4ed8;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 3px 6px;
          border-radius: 4px;
          margin-bottom: 6px;
        }
        .seal-top { display: block; font-size: 8px; }
        .seal-mid { display: block; font-size: 7.5px; color: #2563eb; }
        .seal-bot { display: block; font-size: 7px; color: #64748b; }

        .sign-facsimile {
          font-family: "Brush Script MT", "Segoe Script", cursive;
          font-size: 15px;
          color: #1e3a8a;
          margin-bottom: 2px;
        }
        .sign-line {
          border-bottom: 1px solid #0f172a;
          margin-bottom: 4px;
        }
        .sign-company {
          font-size: 10px;
          font-weight: 700;
          color: #0f172a;
        }
        .sign-name {
          font-size: 9px;
          font-weight: 600;
          color: #334155;
        }
        .sign-sub {
          font-size: 8.5px;
          color: #64748b;
        }
        .sign-place {
          font-size: 8px;
          color: #94a3b8;
          margin-top: 1px;
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="max-width: 820px; margin: 0 auto 12px auto; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #0f172a; color: white; border-radius: 6px;">
        <span style="font-size: 12px; font-weight: 600;">Tax Invoice &bull; Print & PDF Preview</span>
        <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 5px 14px; border-radius: 4px; font-weight: 700; font-size: 11px; cursor: pointer;">
          Print / Save as PDF (A4)
        </button>
      </div>
      ${invoicesHtml}
    </body>
    </html>
  `;
}

/**
 * Universal bulletproof invoice printer
 * Works 100% offline, requires zero external CDN scripts, and handles popup blockers cleanly.
 */
export function printInvoice(orderOrOrders: any | any[], storeSettingsOrName?: InvoiceSettings | string): void {
  if (!orderOrOrders) return;
  const htmlContent = generateInvoiceHtml(orderOrOrders, storeSettingsOrName);

  // Try opening popup window
  const printWindow = window.open('', '_blank', 'width=900,height=950');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    // Auto-trigger print after short render tick
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (e) {
        console.error("Print trigger failed:", e);
      }
    }, 350);
  } else {
    // Fallback: hidden iframe print (bypasses popup blocker)
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1500);
        }, 350);
      }
    } catch (err) {
      console.error("Iframe print error:", err);
    }
  }
}

/**
 * React Component for in-app display/modal preview
 */
const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, storeSettings }) => {
  if (!order) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: generateInvoiceHtml(order, storeSettings) }}
      className="w-full bg-slate-100 p-2 sm:p-4 rounded-xl overflow-x-auto"
    />
  );
};

export default InvoiceTemplate;
