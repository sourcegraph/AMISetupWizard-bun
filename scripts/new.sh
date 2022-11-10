#!/usr/bin/env bash

/usr/local/bin/helm --kubeconfig /etc/rancher/k3s/k3s.yaml upgrade -i -f /home/sourcegraph/deploy/install/override.yaml sourcegraph sourcegraph/sourcegraph

sleep 5

RETRY_COUNT_MP=0
echo "Connecting to instance..."
while [ $RETRY_COUNT_MP -le 20 ]; do
    if /usr/local/bin/k3s kubectl get deploy/sourcegraph-frontend | grep -q 2/2; then
        sudo kill -9 "$(lsof -t -i:30080)"
        /usr/local/bin/k3s kubectl create -f /home/sourcegraph/deploy/install/ingress.yaml
        exit 0
    fi
    ((RETRY_COUNT_MP++))
    echo "Sourcegraph is not ready yet, will try again in 5 seconds..." && sleep 10
done
exit 1
