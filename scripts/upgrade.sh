#!/usr/bin/bash
###############################################################################
# Upgrade Sourcegraph
###############################################################################
if [ -f /mnt/data/.sourcegraph-version ] && [ -f /home/sourcegraph/.sourcegraph-version-new ]; then
    UPGRADE_VERSION=$(cat /home/sourcegraph/.sourcegraph-version-new)
    /usr/local/bin/helm --kubeconfig /etc/rancher/k3s/k3s.yaml upgrade -i -f /home/sourcegraph/deploy/install/override.yaml --version "$UPGRADE_VERSION" sourcegraph sourcegraph/sourcegraph
    sudo mv /home/sourcegraph/.sourcegraph-version-new /home/sourcegraph/.sourcegraph-version
    sudo cp /home/sourcegraph/.sourcegraph-version /mnt/data/.sourcegraph-version
    echo "Done"
    exit 0
else
    echo "FAILED"
    exit 1
fi
