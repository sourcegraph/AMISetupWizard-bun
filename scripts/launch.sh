#!/usr/bin/bash
###############################################################################
# Start Sourcegraph
###############################################################################
/usr/local/bin/helm --kubeconfig /etc/rancher/k3s/k3s.yaml upgrade -i -f /home/sourcegraph/deploy/install/override.yaml sourcegraph sourcegraph/sourcegraph
sleep 10
echo "Done"
exit 0
