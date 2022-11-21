#!/usr/bin/bash
###############################################################################
# Start Sourcegraph
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
/usr/local/bin/helm --kubeconfig /etc/rancher/k3s/k3s.yaml upgrade -i -f /home/sourcegraph/deploy/install/override.yaml sourcegraph sourcegraph/sourcegraph
sleep 10
sudo cp /home/sourcegraph/.sourcegraph-size /mnt/data/.sourcegraph-size
echo "Done"
exit 0
