#!/usr/bin/bash
###############################################################################
# Remove everything related to the Sourcegraph Setup Wizard server
# Including the custom 404 page
###############################################################################
if /usr/local/bin/k3s kubectl get deploy/sourcegraph-frontend | grep -q 2/2; then
    /usr/local/bin/k3s kubectl delete ing frontend-errors
    /usr/local/bin/k3s kubectl delete deploy/nginx-errors
    /usr/local/bin/k3s kubectl delete sevice/nginx-errors
    sudo kill -9 "$(lsof -t -i:30080)"
    /usr/local/bin/k3s kubectl create -f /home/sourcegraph/deploy/install/ingress.yaml
    echo "Removed"
    exit 0
fi
echo "Failed to remove Sourcegraph Setup Wizard server"
exit 1
