import { Injectable, Logger } from '@nestjs/common';
import Docker from 'dockerode';
import * as tar from 'tar-fs';
import { buildImageFromTar } from './shared/docker/utils/buildImageFromTar';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)
  private readonly docker: Docker;

  constructor() {
    this.docker = new Docker()
  }

  async run(body: { image: string, name: string }, internalPort = 5000) {
    const { image, name } = body

    const container = await this.docker.createContainer({
      Image: image,
      name,
      Tty: false,
      HostConfig: {
        PortBindings: {
          [`${internalPort}/tcp`]: [{ HostPort: '' }]
        },
        AutoRemove: true,
        Mounts: [
          {
            Type: 'bind',
            Source: '/var/run/docker.sock',
            Target: '/var/run/docker.sock'
          }
        ]
      }
    })

    await container.start()

    const info = await container.inspect()
    const hostPort = info.NetworkSettings.Ports[`${internalPort}/tcp`][0].HostPort

    return {
      id: container.id,
      hostPort,
      url: `http://localhost:${hostPort}`,
      name
    }
  }

  async buildImage(tag: string) {

    const tarStream = tar.pack('.', {
      ignore: (name) => {
        return name.includes('node_modules') || name.includes('.git') || name.includes('dist')
      },
    })
    const stream = await this.docker.buildImage(
      tarStream,
      { t: tag },
    );

    await new Promise<void>((resolve, reject) => {
      this.docker.modem.followProgress(
        stream,
        (err: Error | null, output: Array<{ error?: string; stream?: string }>) => {
          console.log('=== BUILD OUTPUT ===');
          console.log(JSON.stringify(output, null, 2));
          if (err) return reject(err);
          const failed = output?.find((i) => i?.error);
          if (failed?.error) return reject(new Error(failed.error));
          resolve();
        },
        event => {
          if (event.stream) process.stdout.write(event.stream)
          if (event.error) console.error('BUILD ERROR:', event.error);

        }
      );
    });


    return tag
  }

  async buildImageFromTar(tag: string) {
    await buildImageFromTar(tag, {
      'Dockerfile': 'FROM node:24-alpine\nWORKDIR /app\nCOPY index.js .\nCMD ["node", "index.js"]',
      'index.js': 'console.log("Hello world from tar archive?")'
    })

    return tag
  }

  async stopContainer(id: string): Promise<void> {
    const container = this.docker.getContainer(id);
    await container.stop().catch(() => undefined);
  }


}

