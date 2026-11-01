import { Body, Controller, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly app: AppService) { }

  @Post('health')
  healthCheck() {
    return 'health'
  }

  @Post('build')
  async build(@Body('tag') tag: string) {
    await this.app.buildImage(tag);
    return { tag, status: 'built' };
  }

  @Post('build-from-tar')
  async buildImageFromTar(@Body('tag') tag: string) {
    await this.app.buildImageFromTar(tag);
    return { tag, status: 'built' };
  }

  @Post('run')
  async run(@Body() body: { image: string, name: string }) {
    return this.app.run(body);
  }

  @Post('stop/:id')
  async stop(@Param('id') id: string) {
    await this.app.stopContainer(id);
    return { id, status: 'stopped' };
  }



}