import * as XLSX from 'xlsx';
import { Order } from '../types';

export const exportOrdersToExcel = (orders: Order[], filenamePrefix = 'Akuruhi_Customer_Purchases'): string => {
  if (!orders || orders.length === 0) {
    throw new Error('No orders available to export.');
  }

  // Format order rows for spreadsheet
  const data = orders.map((order, index) => {
    const formattedDate = new Date(order.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsSummary = order.items
      .map(
        (item) =>
          `${item.quantity}x ${item.product.name} (${item.product.code}) [$${item.product.price.toFixed(2)}]`
      )
      .join('; ');

    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      'No.': index + 1,
      'Order ID': order.orderNumber,
      'Date & Time': formattedDate,
      'Customer Name': order.customerName,
      'Customer Email / Gmail': order.customerEmail || 'N/A',
      'Customer Phone': order.customerPhone,
      'Delivery Address': order.deliveryAddress,
      'Telegram Handle': order.telegramHandle || 'N/A',
      'Payment Method': order.paymentMethod === 'qr_code' ? 'KHQR Bakong QR' : 'Telegram Direct Pay',
      'PAYMENT STATUS': order.paymentStatus.toUpperCase(),
      'Order Status': order.orderStatus.replace('_', ' ').toUpperCase(),
      'Transaction Ref / Slip': order.transactionRef || (order.paymentSlipUrl ? 'Slip Uploaded' : 'Pending'),
      'Items Purchased': itemsSummary,
      'Total Items (Qty)': totalQuantity,
      'Subtotal ($)': order.subtotal.toFixed(2),
      'Delivery Fee ($)': order.deliveryFee.toFixed(2),
      'Total Amount ($)': order.total.toFixed(2),
      'Customer Instructions': order.deliveryNotes || '',
    };
  });

  // Calculate totals
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalPaidRevenue = orders
    .filter((order) => order.paymentStatus === 'paid')
    .reduce((acc, order) => acc + order.total, 0);
  const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'paid').length;
  const pendingOrdersCount = orders.filter((o) => o.paymentStatus === 'verification_pending').length;
  const unpaidOrdersCount = orders.filter((o) => o.paymentStatus === 'unpaid').length;

  const summaryData = [
    {
      'Metric / Breakdown': 'Total Orders Count',
      'Value': orders.length,
    },
    {
      'Metric / Breakdown': 'Paid Orders Count',
      'Value': `${paidOrdersCount} orders`,
    },
    {
      'Metric / Breakdown': 'Pending Verification Count',
      'Value': `${pendingOrdersCount} orders`,
    },
    {
      'Metric / Breakdown': 'Unpaid Orders Count',
      'Value': `${unpaidOrdersCount} orders`,
    },
    {
      'Metric / Breakdown': 'Total Paid Gross Revenue',
      'Value': `$${totalPaidRevenue.toFixed(2)} USD`,
    },
    {
      'Metric / Breakdown': 'Total Pipeline Gross (All Orders)',
      'Value': `$${totalRevenue.toFixed(2)} USD`,
    },
    {
      'Metric / Breakdown': 'Export Timestamp',
      'Value': new Date().toISOString(),
    },
  ];

  // Create workbook with two sheets: Orders and Summary
  const wb = XLSX.utils.book_new();

  const wsOrders = XLSX.utils.json_to_sheet(data);
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);

  // Set column widths for readable formatting
  wsOrders['!cols'] = [
    { wch: 6 },  // No.
    { wch: 16 }, // Order ID
    { wch: 20 }, // Date
    { wch: 22 }, // Customer Name
    { wch: 26 }, // Email
    { wch: 18 }, // Phone
    { wch: 35 }, // Address
    { wch: 18 }, // Telegram
    { wch: 18 }, // Payment Method
    { wch: 20 }, // PAYMENT STATUS
    { wch: 18 }, // Order Status
    { wch: 24 }, // Transaction Ref
    { wch: 45 }, // Items Purchased
    { wch: 16 }, // Qty
    { wch: 14 }, // Subtotal
    { wch: 15 }, // Delivery Fee
    { wch: 16 }, // Total Amount
    { wch: 30 }, // Customer Notes
  ];

  wsSummary['!cols'] = [
    { wch: 35 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, wsOrders, 'Customer Purchases');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Financial Summary');

  const todayStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${filenamePrefix}_${todayStr}.xlsx`;

  XLSX.writeFile(wb, fullFilename);
  return fullFilename;
};
