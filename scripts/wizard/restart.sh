#!/usr/bin/bash
k3s kubectl delete ing sourcegraph-ingress
k3s kubectl apply -f "$HOME/SetupWizard/redirect-page.yaml"
exit 0
