export const APP_NAME = 'PolicyBridge';
export const APP_VERSION = '1.0.0';

export const POLICY_TYPES = [
  'Life Insurance',
  'Health Insurance', 
  'Auto Insurance',
  'Home Insurance',
  'Business Insurance'
] as const;

export const CLAIM_STATUS = [
  'Open',
  'Processing', 
  'Approved',
  'Rejected',
  'Paid'
] as const;

export const CLIENT_STATUS = [
  'Active',
  'Inactive',
  'Prospect'
] as const;
