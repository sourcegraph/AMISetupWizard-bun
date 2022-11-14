import { file, serve, spawn } from 'bun';
import { copyFileSync } from 'fs';
serve({
  port: 30080,
  hostname: 'localhost',
  async fetch(req) {
    // Variables and helper functions
    const uri = new URL(req.url);
    const pathname = uri.pathname.substring(1);
    const fileName = uri.searchParams.get('file');
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

    // If the URL is empty, display homepage (the index file).
    if (pathname === '') {
      return new Response(file('build/index.html'));
    }

    // Serve assets files
    if (pathname.startsWith('src')) {
      return new Response(file(pathname));
    }

    // API routes
    // Upload files
    if (pathname === '.api/upload') {
      if (req.method === 'GET') {
        return new Response(`Not a valid request method.`);
      }
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
        return new Response(`message: FAILED`);
      }
    }

    // Run launch scripts to start instance
    if (pathname === '.api/new') {
      const size = uri.searchParams.get('size') || 'XS';
      copyOverrideFile(size);
      console.log('Running launch script');
      const { stdout } = spawn([
        'bash',
        '/home/sourcegraph/SetupWizard/scripts/launch.sh',
      ]);
      const response = await new Response(stdout).text();
      return Response.json({ statusText: response });
    }

    // Check if frontend is ready
    if (pathname === '.api/check') {
      if (req.method === 'GET') {
        console.log('Checking if frontend is ready');
        try {
          const { stdout } = spawn(
            ['bash', '/home/sourcegraph/SetupWizard/scripts/frontend.sh'],
            { stdout: 'pipe' }
          );
          const text = await new Response(stdout).text();
          if (text === 'Ready\n') {
            return Response.json('Ready', { status: 200 });
          }
          return Response.json('Not-Ready', { status: 200 });
        } catch (error) {
          return new Response('Failed', { status: 404 });
        }
      }
    }

    // Remove Setup Wizard server
    if (pathname === '.api/remove') {
      if (req.method === 'GET') {
        console.log('Deleting Setup Wizard');
        try {
          const { stdout } = spawn(
            ['bash', '/home/sourcegraph/SetupWizard/scripts/remove.sh'],
            { stdout: 'pipe' }
          );
          const text = await new Response(stdout).text();
          if (text === 'Ready\n') {
            return Response.json('Ready', { status: 200 });
          }
          return Response.json('Not-Ready', { status: 200 });
        } catch (error) {
          return new Response('Failed', { status: 404 });
        }
      }
    }

    // Else, treat as files from the build route
    return new Response(file('build/' + pathname));
  },
});
