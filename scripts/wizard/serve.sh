#!/usr/bin/bash
###############################################################################
# Serve the Sourcegraph Setup Wizard server
###############################################################################
cd /home/sourcegraph/SetupWizard && /home/sourcegraph/.bun/bin/bun run server.js &
exit
