#!/usr/bin/bash
###############################################################################
# Upgrade Sourcegraph
###############################################################################
# Using SSH to clone repositories
if [ -f /home/sourcegraph/.ssh/id_rsa ] && [ -f /home/sourcegraph/.ssh/known_hosts ]; then
    # create the secret with the uploaded files
    /usr/local/bin/k3s kubectl create secret generic gitserver-ssh \
        --from-file id_rsa=/home/sourcegraph/.ssh/id_rsa \
        --from-file known_hosts=/home/sourcegraph/.ssh/known_hosts
    # remove comment for sshSecret to reference the secrets in our override file
    sed -i -e 's/\#sshSecret/sshSecret/' /home/sourcegraph/deploy/install/override.yaml
fi
if [ -f /mnt/data/.sourcegraph-version ] && [ -f /home/sourcegraph/.sourcegraph-version-new ]; then
    UPGRADE_VERSION=$(cat /home/sourcegraph/.sourcegraph-version-new)
    /usr/local/bin/helm --kubeconfig /etc/rancher/k3s/k3s.yaml upgrade -i -f /home/sourcegraph/deploy/install/override.yaml --version "$UPGRADE_VERSION" sourcegraph sourcegraph/sourcegraph
    sudo mv /home/sourcegraph/.sourcegraph-version-new /home/sourcegraph/.sourcegraph-version
    sudo cp /home/sourcegraph/.sourcegraph-version /mnt/data/.sourcegraph-version
    echo "Done"
    exit 0
else
    echo "Failed"
    exit 1
fi
