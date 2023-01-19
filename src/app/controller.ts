import { Controller, Get } from '@nestjs/common';

import { AllowAny } from '../modules/auth';

@Controller()
export class AppController {
  @Get()
  @AllowAny()
  async index() {
    return 'Girafa API';
  }
}
