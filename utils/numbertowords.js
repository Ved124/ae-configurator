// utils/numberToWords.js

export function numberToWords(num) {
  if (num === 0) return "Zero Rupees Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function twoDigits(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }

  function threeDigits(n) {
    let str = "";
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + " Hundred";
      if (n % 100) str += " and " + twoDigits(n % 100);
    } else {
      str = twoDigits(n);
    }
    return str.trim();
  }

  let result = "";

  const crore = Math.floor(num / 10000000);
  if (crore) {
    result += threeDigits(crore) + " Crore ";
    num %= 10000000;
  }

  const lakh = Math.floor(num / 100000);
  if (lakh) {
    result += threeDigits(lakh) + " Lakh ";
    num %= 100000;
  }

  const thousand = Math.floor(num / 1000);
  if (thousand) {
    result += threeDigits(thousand) + " Thousand ";
    num %= 1000;
  }

  const hundred = num;
  if (hundred) {
    result += threeDigits(hundred) + " ";
  }

  return result.trim() + " Rupees Only";
}
