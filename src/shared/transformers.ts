import { ValueTransformer } from 'typeorm';
import { decrypt, encrypt } from './crypto';

// For string columns (full_name, email, phone, address, date_of_birth)
export const encryptedString: ValueTransformer = {
  to(value: string | null | undefined): string | null {
    if (value == null) return null;
    return encrypt(String(value));
  },
  from(value: string | null | undefined): string | null {
    if (value == null) return null;
    try {
      return decrypt(value);
    } catch {
      // Graceful fallback for legacy plaintext data already in the DB
      return value;
    }
  },
};

// For JSONB columns (diagnoses_extracted, procedures_extracted, medications_extracted)
// Column type must be 'text' when using this transformer
export const encryptedJson: ValueTransformer = {
  to(value: any | null | undefined): string | null {
    if (value == null) return null;
    return encrypt(JSON.stringify(value));
  },
  from(value: string | null | undefined): any {
    if (value == null) return null;
    try {
      return JSON.parse(decrypt(value));
    } catch {
      // Graceful fallback: try to parse as raw JSON (legacy plaintext)
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
  },
};
