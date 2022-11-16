export function teardownWizard(hostname) {
  fetch(`http://${hostname}:30080/.api/remove`)
    .then((res) => res.json())
    .catch((error) => console.log(error));
  setTimeout(() => {
    window.location.replace(`http://${hostname}/site-admin/init`);
  }, '5000');
}

export function makeRequest(method, body) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  return {
    method: method,
    header: headers,
    body: body,
  };
}
