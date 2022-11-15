#!/usr/bin/bash
###############################################################################
# Remove everything related to the Sourcegraph Setup Wizard server
# Including the custom 404 page
###############################################################################
/usr/local/bin/k3s kubectl create -f /home/sourcegraph/deploy/install/ingress.yaml
if /usr/local/bin/k3s kubectl get deploy/sourcegraph-frontend | grep -q 2/2; then
    sudo pkill bun #sudo kill -9 "$(lsof -t -i:30080)"
    /usr/local/bin/k3s kubectl delete ing frontend-errors
    /usr/local/bin/k3s kubectl delete deploy/nginx-errors
    /usr/local/bin/k3s kubectl delete service/nginx-errors
    /usr/local/bin/k3s kubectl delete configmap/custom-error-pages
    echo "Removed"
    exit 0
fi
echo "Failed to remove Sourcegraph Setup Wizard server"
exit 1
