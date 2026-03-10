import { oidcConfig } from '@/auth/config';

export const setSessionItem = (key: string, value: any) => {
  const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
  sessionStorage.setItem(key, valueToStore);
};


export const findEmployeeDetails = (employees: any, empCode: string) => {
  const employee = employees.find((emp) => emp?.empCode === empCode);
  if (employee) {
    return {
      employee,
    };
  } else {
    return null;
  }
};
export const extractUniqueUnits = (employees) => {
  // Create a Map to track unique units by unitId
  const uniqueUnitsMap = new Map();

  // Process each employee
  employees.forEach((employee) => {
    // Only add if both unitId and unitName exist
    if (employee.unitId && employee.unitName) {
      uniqueUnitsMap.set(employee.unitId, {
        unitId: employee.unitId,
        unitName: employee.unitName?.trim(),
      });
    }
  });

  // Convert Map values to array
  return Array.from(uniqueUnitsMap.values());
};

export function getObjectFromSessionStorage(key) {
  const item = sessionStorage.getItem(key);
  if (item) {
    try {
      return JSON.parse(item);
    } catch (e) {
      console.error('Error parsing JSON from sessionStorage:', e);
      return null;
    }
  }
  return null;
}

export function clearAllStorage(): void {
  localStorage.clear();
  sessionStorage.clear();
  const cookies: string[] = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name] = cookie.split('=');
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

export const formatRupees = (amount: number | null | undefined): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '-';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};
export const getNextDate = (dateString: string) => {
  if (!dateString) return;
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

 export const formatWords = (value?: string) => {
  if (!value) return "-";

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
    .replace(/UNIT/g, " UNIT")           // OUTSIDEUNIT → OUTSIDE UNIT
    .replace(/REQUEST/g, " REQUEST")     // ONREQUEST → ON REQUEST
    .trim();
};



/**
 * Decodes a JWT token and returns the payload
 * @param token - The JWT token string to decode
 * @returns The decoded token payload or null if decoding fails
 */
export function decodeJwtToken(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Invalid token format: missing payload');
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Gets the access token from session storage using OIDC configuration
 * @returns The access token string or null if not found
 */
export function getAccessTokenFromOidcSession(): string | null {
  try {
    const tokenData = getObjectFromSessionStorage(`oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`);
    return tokenData?.access_token || null;
  } catch (error) {
    console.error('Error getting access token from session:', error);
    return null;
  }
}

/**
 * Gets and decodes the access token from session storage
 * @returns The decoded token payload or null if token is not found or decoding fails
 */
export function getDecodedAccessToken(): any | null {
  const accessToken = getAccessTokenFromOidcSession();
  if (!accessToken) {
    return null;
  }
  return decodeJwtToken(accessToken);
}

/**
 * Extracts delegation information from the decoded token
 * @param decodedToken - The decoded JWT token payload
 * @returns An object containing delegation information
 */
export function extractDelegationInfo(decodedToken: any): {
  isDelegatedUser: boolean;
  delegateeEmpCode: string | null;
  delegatedApplications: string | null;
  delegatedApplicationNames: string | null;
} {
  if (!decodedToken) {
    return {
      isDelegatedUser: false,
      delegateeEmpCode: null,
      delegatedApplications: null,
      delegatedApplicationNames: null,
    };
  }

  return {
    isDelegatedUser: decodedToken.IsD === 'True',
    delegateeEmpCode: decodedToken.Duser || null,
    delegatedApplications: decodedToken.DApplications || null,
    delegatedApplicationNames: decodedToken.DApplicationNames || null,
  };
}

/**
 * Gets delegation information from the current session's access token
 * This is a convenience function that combines getting and decoding the token
 * @returns An object containing delegation information
 */
export function getDelegationInfoFromSession(): {
  isDelegatedUser: boolean;
  delegateeEmpCode: string | null;
  delegatedApplications: string | null;
  delegatedApplicationNames: string | null;
} {
  const decodedToken = getDecodedAccessToken();
  return extractDelegationInfo(decodedToken);
}

