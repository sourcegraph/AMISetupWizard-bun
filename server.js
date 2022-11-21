import { file, serve, spawn, write } from 'bun';
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
      copyFileSync(
        `/home/sourcegraph/deploy/install/override.${size}.yaml`,
        '/home/sourcegraph/deploy/install/override.yaml'
      );
      return;
    };

    // If the URL is empty, display homepage (the index file).
    if (pathname === '' || pathname === 'setup' || pathname === 'wizard') {
      return new Response(file('build/index.html'));
    }

    // Serve assets files
    if (pathname.startsWith('src')) {
      return new Response(file(pathname));
    }

    // Upload files
    if (pathname === '.api/upload') {
      if (req.method === 'GET') {
        return new Response(`Not a valid request method.`, { status: 404 });
      }
      try {
        // body is a ReadableStream
        const body = req.body;
        let filePath;
        switch (fileName) {
          case 'id_rsa':
            filePath = '/home/sourcegraph/.ssh/id_rsa';
            break;
          case 'known_hosts':
            filePath = '/home/sourcegraph/.ssh/known_hosts';
            break;
          default:
            throw new Error('Invalid');
        }
        const writer = file(filePath).writer();
        for await (const chunk of body) {
          writer.write(chunk);
        }
        const wrote = await writer.end();
        return Response.json({
          wrote,
          type: req.headers.get('Content-Type'),
          body: 'Uploaded successfully',
        });
      } catch (error) {
        console.error(error);
        return Response.json(`Failed to upload: ${error}`, { status: 404 });
      }
    }

    // Run launch scripts to start instance
    if (pathname === '.api/new') {
      const size = uri.searchParams.get('size') || 'XS';
      copyOverrideFile(size);
      await write('/home/sourcegraph/.sourcegraph-size', size);
      console.log('Running launch script');
      const { stdout } = spawn([
        'bash',
        '/home/sourcegraph/SetupWizard/scripts/launch.sh',
      ]);
      const response = await new Response(stdout).text();
      if (response) {
        return Response.json('Passed', { status: 200 });
      }
      return Response.json('Failed', { status: 404 });
    }

    // Upgrade instance
    if (pathname === '.api/upgrade') {
      const size = uri.searchParams.get('size') || 'XS';
      const version = uri.searchParams.get('version') || '';
      await write('/home/sourcegraph/.sourcegraph-size', size);
      await write('/home/sourcegraph/.sourcegraph-version-new', version);
      copyOverrideFile(size);
      console.log('Running upgrade script for size ', size);
      const { stdout } = spawn([
        'bash',
        '/home/sourcegraph/SetupWizard/scripts/upgrade.sh',
      ]);
      const response = await new Response(stdout).text();
      if (response.startsWith('Done')) {
        return Response.json('Passed', { status: 200 });
      }
      return Response.json('Upgrade Failed: No upgrade for new instance', {
        status: 404,
      });
    }

    // Check if frontend is ready
    if (pathname === '.api/check') {
      if (req.method === 'GET') {
        console.log('Checking if frontend is ready');
        const { stdout } = spawn(
          ['bash', '/home/sourcegraph/SetupWizard/scripts/frontend.sh'],
          { stdout: 'pipe' }
        );
        const response = await new Response(stdout).text();
        if (response.startsWith('Ready')) {
          return Response.json('Ready', { status: 200 });
        }
        return Response.json('Retrying');
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
          const response = await new Response(stdout).text();
          if (response) {
            return Response.json('Removed', { status: 200 });
          }
        } catch (error) {
          return new Response('Failed to remove', { status: 404 });
        }
      }
    }

    // Else, treat as files from the build route
    return new Response(file('build/' + pathname));
  },
});
