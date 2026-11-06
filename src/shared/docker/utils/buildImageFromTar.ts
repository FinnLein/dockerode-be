import Docker from 'dockerode';
import * as tar from 'tar-stream';

interface BuildResult {
  success: boolean;
  error?: string;
  logs?: string[];
}

interface BuildProgressItem {
  stream?: string;
  error?: string;
  errorDetail?: { message?: string };
  aux?: unknown;
}

const buildImageFromTar = async (
  name: string,
  files: Record<string, string>,
): Promise<BuildResult> => {
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

  return new Promise<BuildResult>((res, rej) => {
    docker.modem.followProgress(stream, (err, output) => {
      if (err) return rej(err);

      const items = output as BuildProgressItem[];
      const logs: string[] = [];
      let buildError: string | undefined;

      for (const item of items) {
        if (item.stream) logs.push(item.stream);
        if (item.error) buildError = item.error;
      }

      if (buildError) {
        return res({ success: false, error: buildError, logs });
      }

      res({ success: true, logs });
    });
  });
};

export { buildImageFromTar };

