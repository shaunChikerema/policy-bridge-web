// lib/validation/clients.ts
import { ClientFormData, ClientFormErrors } from "../types";

// Email validation regex (matches your database constraint)
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Phone validation - Botswana format
const PHONE_REGEX = /^(\+267|267)?[0-9]{8}$/;

// Postal code validation for Botswana
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]{3,20}$/;

export function validateClientForm(data: ClientFormData): ClientFormErrors {
  const errors: ClientFormErrors = {};

  // Required fields validation
  if (!data.first_name?.trim()) {
    errors.first_name = "First name is required";
  } else if (data.first_name.trim().length < 2) {
    errors.first_name = "First name must be at least 2 characters";
  } else if (data.first_name.trim().length > 50) {
    errors.first_name = "First name must be less than 50 characters";
  }

  if (!data.last_name?.trim()) {
    errors.last_name = "Last name is required";
  } else if (data.last_name.trim().length < 2) {
    errors.last_name = "Last name must be at least 2 characters";
  } else if (data.last_name.trim().length > 50) {
    errors.last_name = "Last name must be less than 50 characters";
  }

  if (!data.email?.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  // Optional fields validation
  if (data.phone && data.phone.trim()) {
    // Clean phone number for validation
    const cleanPhone = data.phone.replace(/\s+/g, "").replace(/[()-]/g, "");
    if (cleanPhone.length < 10) {
      errors.phone = "Phone number must be at least 10 digits";
    } else if (!PHONE_REGEX.test(cleanPhone)) {
      errors.phone =
        "Please enter a valid Botswana phone number (e.g., +267 7123 4567)";
    }
  }

  if (data.date_of_birth && data.date_of_birth.trim()) {
    const birthDate = new Date(data.date_of_birth);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 120); // Maximum age of 120 years

    if (isNaN(birthDate.getTime())) {
      errors.date_of_birth = "Please enter a valid date";
    } else if (birthDate > today) {
      errors.date_of_birth = "Birth date cannot be in the future";
    } else if (birthDate < maxDate) {
      errors.date_of_birth = "Please enter a valid birth date";
    }
  }

  if (
    data.gender &&
    !["male", "female", "other", "prefer_not_to_say"].includes(data.gender)
  ) {
    errors.gender = "Please select a valid gender option";
  }

  if (data.address_line1 && data.address_line1.length > 100) {
    errors.address_line1 = "Address line 1 must be less than 100 characters";
  }

  if (data.city && data.city.trim()) {
    if (data.city.trim().length < 2) {
      errors.city = "City must be at least 2 characters";
    } else if (data.city.trim().length > 50) {
      errors.city = "City must be less than 50 characters";
    }
  }

  if (data.state && data.state.trim()) {
    if (data.state.trim().length < 2) {
      errors.state = "State/Region must be at least 2 characters";
    } else if (data.state.trim().length > 50) {
      errors.state = "State/Region must be less than 50 characters";
    }
  }

  if (data.postal_code && data.postal_code.trim()) {
    if (!POSTAL_CODE_REGEX.test(data.postal_code.trim())) {
      errors.postal_code = "Please enter a valid postal code";
    }
  }

  if (data.country && data.country.trim()) {
    if (data.country.trim().length !== 2) {
      errors.country = "Country must be a 2-letter code (e.g., BW)";
    }
  }

  if (data.occupation && data.occupation.length > 100) {
    errors.occupation = "Occupation must be less than 100 characters";
  }

  if (data.employer && data.employer.length > 100) {
    errors.employer = "Employer must be less than 100 characters";
  }

  if (data.annual_income && data.annual_income.trim()) {
    const income = parseFloat(data.annual_income);
    if (isNaN(income)) {
      errors.annual_income = "Please enter a valid income amount";
    } else if (income < 0) {
      errors.annual_income = "Income cannot be negative";
    } else if (income > 99999999.99) {
      errors.annual_income = "Income amount is too large";
    }
  }

  if (data.emergency_contact_name && data.emergency_contact_name.length > 100) {
    errors.emergency_contact_name =
      "Emergency contact name must be less than 100 characters";
  }

  if (data.emergency_contact_phone && data.emergency_contact_phone.trim()) {
    const cleanPhone = data.emergency_contact_phone
      .replace(/\s+/g, "")
      .replace(/[()-]/g, "");
    if (cleanPhone.length < 10) {
      errors.emergency_contact_phone =
        "Emergency contact phone must be at least 10 digits";
    } else if (!PHONE_REGEX.test(cleanPhone)) {
      errors.emergency_contact_phone =
        "Please enter a valid phone number for emergency contact";
    }
  }

  if (
    data.emergency_contact_relationship &&
    data.emergency_contact_relationship.length > 50
  ) {
    errors.emergency_contact_relationship =
      "Emergency contact relationship must be less than 50 characters";
  }

  if (data.notes && data.notes.length > 1000) {
    errors.notes = "Notes must be less than 1000 characters";
  }

  return errors;
}

// Utility function to check if form has any errors
export function hasValidationErrors(errors: ClientFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

// Utility function to get first error message
export function getFirstError(errors: ClientFormErrors): string | null {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length === 0) return null;
  return errors[errorKeys[0]] || null;
}

// Utility function to clean form data before submission
export function cleanClientFormData(data: ClientFormData): ClientFormData {
  return {
    ...data,
    first_name: data.first_name?.trim() || "",
    last_name: data.last_name?.trim() || "",
    email: data.email?.trim().toLowerCase() || "",
    phone: data.phone?.trim() || "",
    address_line1: data.address_line1?.trim() || "",
    address_line2: data.address_line2?.trim() || "",
    city: data.city?.trim() || "",
    state: data.state?.trim() || "",
    postal_code: data.postal_code?.trim() || "",
    country: data.country?.trim().toUpperCase() || "BW",
    occupation: data.occupation?.trim() || "",
    employer: data.employer?.trim() || "",
    emergency_contact_name: data.emergency_contact_name?.trim() || "",
    emergency_contact_phone: data.emergency_contact_phone?.trim() || "",
    emergency_contact_relationship:
      data.emergency_contact_relationship?.trim() || "",
    notes: data.notes?.trim() || "",
  };
}

// Utility function to format phone number for display
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle Botswana numbers
  if (digits.startsWith("267")) {
    // Format as +267 7XXX XXXX
    const countryCode = digits.substring(0, 3);
    const rest = digits.substring(3);
    if (rest.length === 8) {
      return `+${countryCode} ${rest.substring(0, 4)} ${rest.substring(4)}`;
    }
  } else if (digits.length === 8) {
    // Assume it's a Botswana local number
    return `+267 ${digits.substring(0, 4)} ${digits.substring(4)}`;
  }

  // Return original if we can't format it
  return phone;
}

// Utility function to validate individual fields (for real-time validation)
export function validateField(
  fieldName: keyof ClientFormData,
  value: string,
  formData: ClientFormData
): string | null {
  const tempData = { ...formData, [fieldName]: value };
  const errors = validateClientForm(tempData);
  return errors[fieldName] || null;
}
