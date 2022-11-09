import { file, serve, spawnSync } from 'bun';
import { copyFileSync } from 'fs';
serve({
  port: 30080,
  hostname: 'localhost',
  async fetch(req) {
    // Variables and helper functions
    const uri = new URL(req.url);
    const pathname = uri.pathname.substring(1);
    const fileName = uri.searchParams.get('file');
    const install = (mode) => {
      console.log('Running launch script');
      return spawnSync(['bash', `$HOME/deploy/scripts/${mode}.sh`]);
    };
    const copyOverrideFile = (size) => {
      console.log('Copying override file');
      if (size !== 'XS') {
        copyFileSync(
          `$HOME/deploy/install/override.${size}.yaml`,
          '$HOME/deploy/install/override.yaml'
        );
      }
      return;
    };

    // If the URL is empty, display this file.
    if (pathname === '') {
      return new Response(file('build/index.html'));
    }
    if (pathname.startsWith('src')) {
      return new Response(file(pathname));
    }

    if (pathname === '.api/upload') {
      try {
        // body is a ReadableStream
        const body = req.body;
        const writer = file(fileName).writer();
        for await (const chunk of body) {
          writer.write(chunk);
        }
        const wrote = await writer.end();
        return Response.json({ wrote, type: req.headers.get('Content-Type') });
      } catch (error) {
        console.error(error);
        return new Response(`Echo: FAILED`);
      }
    }

    if (pathname === '.api/new') {
      const size = uri.searchParams.get('size');
      copyOverrideFile(size);
      install('new');
      return new Response(`Echo: DONE`);
    }

    return new Response(file('build/' + pathname));
  },
});
