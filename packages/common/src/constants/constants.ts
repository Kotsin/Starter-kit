export const DEFAULT_LIMIT = 10;

export const DEFAULT_OFFSET = 0;

/** Postgres smallint max value */
export const SMALLINT_MAX_VALUE = 32767;

/** Pagination default page size */
export const PAGE_SIZE = 10;

export const SENSITIVE_FIELDS = [
  // Стандартные
  'password',
  'pwd',
  'passphrase',
  'access_token',
  'refresh_token',
  'id_token',
  'oauth_token',
  'session_token',
  'api_key',
  'secret_key',
  'encryption_key',
  'private_key',

  // Платежные
  'card_number',
  'ccv',
  'expiry_date',
  'card_holder',
  'iban',
  'swift_code',
  'account_number',

  // PII
  'ssn',
  'social_security_number',
  'passport_number',
  'driver_license',
  'phone_number',
  'address',
  'face_id',
  'iris_scan',

  // Системные
  'session_id',
  'cookie',
  'auth_cookie',
  'authorization_code',
  'client_secret',

  // Временные коды
  'otp',
  'sms_code',
  'verification_code',
  '2fa_code',

  // Специфичные
  'reset_password_link',
  'activation_link',
  'security_question',
  'security_answer',
];
