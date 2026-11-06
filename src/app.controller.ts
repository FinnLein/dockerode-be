import { Controller, Post } from '@nestjs/common';

@Controller()
export class AppController {
  @Post('health')
  healthCheck() {
    return 'health';
  }
}
