#!/usr/bin/bash

/usr/local/bin/helm --kubeconfig /etc/rancher/k3s/k3s.yaml upgrade -i -f /home/sourcegraph/deploy/install/override.yaml sourcegraph sourcegraph/sourcegraph
sleep 30
sudo pkill bun
sudo kill -9 "$(lsof -t -i:30080)"
sleep 5
kubectl create -f /home/sourcegraph/deploy/install/ingress.yaml
