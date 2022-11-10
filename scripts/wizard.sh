#!/usr/bin/env bash
###############################################################################
# Set up Bun for Sourcegraph Setup Wizard
###############################################################################
cd || exit
git clone https://github.com/sourcegraph/SetupWizard.git
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - &&
    sudo apt-get install -y nodejs
# Install bun.js
sudo apt-get install -y unzip
curl -sSL https://bun.sh/install | bash
export BUN_INSTALL=$HOME/.bun
export PATH=$BUN_INSTALL/bin:$PATH
echo "export BUN_INSTALL=$HOME/.bun" | tee -a "$HOME"/.bashrc
echo "export PATH=$BUN_INSTALL/bin:$PATH" | tee -a "$HOME"/.bashrc
cd SetupWizard || exit
# Build and serve wizard
bun install && bun run build
bun run server.js &
