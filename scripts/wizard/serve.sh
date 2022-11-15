#!/usr/bin/bash
###############################################################################
# Serve the Sourcegraph Setup Wizard server
###############################################################################
cd /home/sourcegraph/SetupWizard && bun run server.js &
