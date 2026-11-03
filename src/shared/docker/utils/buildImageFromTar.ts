import Docker from 'dockerode';
import * as tar from 'tar-stream';

const buildImageFromTar = async (
  name: string,
  files: Record<string, string>,
) => {
  const docker = new Docker();
  const pack = tar.pack();

  for (const [filename, content] of Object.entries(files)) {
    pack.entry({ name: filename }, content);
  }
  pack.finalize();

  const stream = await docker.buildImage(
    pack as unknown as NodeJS.ReadableStream,
    { t: name },
  );

  await new Promise<void>((res, rej) => {
    docker.modem.followProgress(stream, (err, output) => {
      if (err) return rej(err);
      const failed = output.find((i: any) => i.error);
      if (failed?.error) return rej(new Error(failed.error));

      res();
    });
  });

  return name;
};

export { buildImageFromTar };
