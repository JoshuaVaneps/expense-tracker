const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Every figure in the app goes through here, so float noise like
// 1234.5600000000001 never reaches the screen.
export const formatCurrency = (value) => currency.format(value);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Split the ISO string rather than going through Date: `new Date("2025-01-01")`
// parses as UTC midnight and renders as Dec 31 in any negative-offset timezone.
export const formatDate = (iso) => {
  const [year, month, day] = iso.split("-");
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
};

// "2025-01" -> "January 2025"
export const formatMonth = (yearMonth) => {
  const [year, month] = yearMonth.split("-");
  return `${MONTHS_LONG[Number(month) - 1]} ${year}`;
};
