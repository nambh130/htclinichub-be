import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYMENT_ENCRYPTION_KEY');
    if (!this.secretKey || this.secretKey.length !== 32) {
      throw new Error('PAYMENT_ENCRYPTION_KEY must be 32 characters long');
    }
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: any): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

      const jsonString = JSON.stringify(data);
      let encrypted = cipher.update(jsonString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return JSON.stringify({
        iv: iv.toString('hex'),
        encrypted,
        authTag: authTag.toString('hex'),
      });
    } catch (error) {
      throw new Error('Encryption failed: ' + error);
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt<T = any>(encryptedData: string): T {
    let decryptedData: T;

    try {
      const { iv, encrypted, authTag } = JSON.parse(encryptedData) as {
        iv: string;
        encrypted: string;
        authTag: string;
      };

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.secretKey,
        Buffer.from(iv, 'hex'),
      );
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      decryptedData = JSON.parse(decrypted) as T;

      return decryptedData;
    } catch (error) {
      throw new Error('Decryption failed: ' + error);
    } finally {
      // Clear sensitive data from memory (basic cleanup)
      if (decryptedData) {
        // Force garbage collection hints
        decryptedData = null;
      }
    }
  }

  /**
   * Secure cleanup of sensitive data from memory
   */
  secureCleanup(data: Record<string, unknown>): void {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'string') {
          // Overwrite string with random data
          data[key] = crypto.randomBytes(data[key].length).toString('hex');
        }
        data[key] = null;
      });
    }
  }
}
