#!/usr/bin/bash
###############################################################################
# Install and serve Sourcegraph Setup Wizard server
# Ubuntu 22.04+ LTS required
###############################################################################
cd || exit
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash -
sudo apt-get install -y nodejs nodejs
# Install bun.js
sudo apt-get install -y unzip
curl -sSL https://bun.sh/install | bash
export BUN_INSTALL=/home/sourcegraph/.bun
export PATH=/home/sourcegraph/.bun/bin:/home/sourcegraph/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
echo "export BUN_INSTALL=$HOME/.bun" | tee -a "$HOME/.bashrc"
echo "export PATH=$BUN_INSTALL/bin:$PATH" | tee -a "$HOME/.bashrc"
cd /home/sourcegraph/SetupWizard || exit
# Build wizard
bun install
bun run build --silent
sleep 5
exit
