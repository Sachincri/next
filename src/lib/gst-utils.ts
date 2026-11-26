/**
 * Official Indian Goods and Services Tax (GST) Utilities
 * Implements Mod-36 Checksum, Indian States & UTs Codes, and Tax Extraction Logic
 */

export interface IndianStateGST {
  code: string;
  name: string;
}

/**
 * Official Indian States & Union Territories with 2-digit GST State Codes
 */
export const INDIAN_STATES_GST: IndianStateGST[] = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh (New)" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
];

export const GSTIN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export interface GSTINValidationResult {
  isValid: boolean;
  error?: string;
  expectedChecksum?: string;
  stateCode?: string;
  pan?: string;
}

/**
 * Validates a 15-character Indian GSTIN using official Regex and Mod-36 Checksum
 */
export function validateGSTIN(gstin?: string): GSTINValidationResult {
  if (!gstin) {
    return { isValid: false, error: "GSTIN is required" };
  }

  const val = gstin.trim().toUpperCase();

  if (val.length !== 15) {
    return {
      isValid: false,
      error: `GSTIN must be exactly 15 characters (currently ${val.length})`,
      stateCode: val.length >= 2 ? val.slice(0, 2) : undefined,
      pan: val.length >= 12 ? val.slice(2, 12) : undefined,
    };
  }

  // Regex format: 2 digits (State) + 5 letters + 4 digits + 1 letter (PAN) + 1 entity num + 'Z' + 1 checksum
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(val)) {
    return {
      isValid: false,
      error: "Invalid GSTIN format (Format: 2-digit State + 10-char PAN + 1 Entity + 'Z' + Checksum)",
      stateCode: val.slice(0, 2),
      pan: val.slice(2, 12),
    };
  }

  // Mod-36 Checksum calculation
  let total = 0;
  for (let i = 0; i < 14; i++) {
    const char = val[i];
    const index = GSTIN_CHARS.indexOf(char);
    if (index === -1) {
      return { isValid: false, error: `Invalid character '${char}' in GSTIN` };
    }
    const multiplier = i % 2 === 0 ? 1 : 2;
    const product = index * multiplier;
    total += Math.floor(product / 36) + (product % 36);
  }

  const remainder = total % 36;
  const checkCodeIndex = (36 - remainder) % 36;
  const expectedChecksum = GSTIN_CHARS[checkCodeIndex];

  if (val[14] !== expectedChecksum) {
    return {
      isValid: false,
      error: "Invalid GSTIN checksum — please re-verify all 15 characters",
      expectedChecksum,
      stateCode: val.slice(0, 2),
      pan: val.slice(2, 12),
    };
  }

  return {
    isValid: true,
    expectedChecksum,
    stateCode: val.slice(0, 2),
    pan: val.slice(2, 12),
  };
}

/**
 * Extracts the 2-digit State Code from GSTIN and looks up corresponding Indian State
 */
export function extractStateFromGSTIN(gstin?: string): IndianStateGST | undefined {
  if (!gstin || gstin.trim().length < 2) return undefined;
  const code = gstin.trim().slice(0, 2);
  return INDIAN_STATES_GST.find((s) => s.code === code);
}

/**
 * Extracts 10-character PAN from GSTIN (characters 3 through 12)
 */
export function extractPanFromGSTIN(gstin?: string): string {
  if (!gstin || gstin.trim().length < 12) return "";
  return gstin.trim().slice(2, 12).toUpperCase();
}
