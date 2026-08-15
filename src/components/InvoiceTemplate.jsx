// ✅ cleanQuantity() is already defined at the top
const cleanQuantity = (rawQty) => {
  const str = String(rawQty).trim();
  const multiplicationPattern = /^(.*?)\s*[×x*]\s*.+$/;
  const match = str.match(multiplicationPattern);
  if (match) return match[1].trim();
  return str;
};

// ✅ It's being used in the Quantity column
const displayQty = type === 'expense' ? '-' : cleanQuantity(rawQty);
