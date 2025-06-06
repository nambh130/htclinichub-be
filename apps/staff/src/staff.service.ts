import { Injectable } from '@nestjs/common';

@Injectable()
export class StaffService {
  getHello(): string {
    return 'Hello World!';
  }
}
