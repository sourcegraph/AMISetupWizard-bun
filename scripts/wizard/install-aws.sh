#!/usr/bin/bash
###############################################################################
# Install and serve Sourcegraph Setup Wizard server
# Ubuntu 22.04+ LTS required
###############################################################################
sudo yum update -y
sudo yum install git -y
cd || exit
git clone https://github.com/sourcegraph/SetupWizard.git
# Install Node.js
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
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
