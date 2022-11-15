import { useCallback, useState, useEffect, useMemo } from 'react';
import './App.css';
import logo from './logo.svg';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

function App() {
  const [hostname, setHostname] = useState(null);
  const [size, setSize] = useState('XS');
  const [mode, setMode] = useState('new');
  const [version, setVersion] = useState('');
  const [fileName, setFileName] = useState(null);
  const [blob, setBlob] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [showErrors, setShowErrors] = useState(null);
  const reader = useMemo(() => new FileReader(), []);
  reader.onloadstart = () => setUploadStatus('LOADING');
  reader.onload = (event) => setBlob(event.target.result);
  useEffect(() => {
    if (!hostname) {
      const uri = new URL(window.location.origin);
      setHostname(uri.hostname);
    }
    if (blob && fileName) {
      setUploadStatus('UPLOADING');
      const postRequest = {
        method: 'POST',
        header: headers,
        body: blob,
      };
      try {
        fetch(
          `http://${hostname}:30080/.api/upload?file=${fileName}`,
          postRequest
        )
          .then((res) => res.json())
          .then((res) => setUploadStatus(res))
          .catch((error) => {
            throw error;
          });
      } catch (error) {
        setShowErrors(error);
        setUploadStatus('FAILED');
      }
    }
  }, [blob, fileName, hostname]);

  const onFileChange = useCallback(
    async (file, uploadName) => {
      const getFileName = await file.name;
      if (uploadName !== getFileName) {
        setUploadStatus({
          [uploadName]: `Failed: file name must be ${uploadName}`,
        });
      } else {
        setFileName(uploadName || getFileName);
        reader.readAsText(file, 'UTF-8');
      }
    },
    [reader]
  );

  const onLaunchClick = useCallback(() => {
    const requestBody = {
      size: size,
      version: version,
    };
    const postRequest = {
      method: 'POST',
      header: headers,
      body: JSON.stringify(requestBody),
    };
    function checkFrontend(tries) {
      if (tries > 0) {
        fetch(`http://${hostname}:30080/.api/check`)
          .then((res) => res.json())
          .then((res) => {
            if (res === 'Ready') {
              fetch(`http://${hostname}:30080/.api/remove`)
                .then((res) => res.json())
                .catch((error) => console.log(error));
              setTimeout(() => {
                window.location.replace(`http://${hostname}/site-admin/init`);
              }, '5000');
            } else {
              setTimeout(() => {
                tries--;
                checkFrontend(tries);
              }, '10000');
            }
          })
          .catch((error) => console.log(error));
      }
    }
    // Launch as new instance or upgrade
    try {
      fetch(
        `http://${hostname}:30080/.api/${mode}?size=${size}&version=${version}`,
        postRequest
      )
        .then((res) => res.json())
        .then((res) => {
          if (res === 'Passed' && !showErrors) {
            checkFrontend(20);
            setSubmitted(true);
          } else {
            setShowErrors(res);
            setSubmitted(false);
          }
        })
        .catch((error) => setShowErrors(error));
    } catch (error) {
      setShowErrors(error);
      setSubmitted(false);
    }
  }, [hostname, mode, showErrors, size, version]);

  return (
    <div className="homepage" role="main">
      <img
        alt="sourcegraph logo"
        src="https://sourcegraph.com/.assets/img/sourcegraph-logo-dark.svg"
        className="logo-big"
      />
      <h1>Sourcegraph Image Instance Setup Wizard</h1>
      {submitted ? (
        <div className="loading">
          <img src={logo} className="logo-small" alt="sourcegraph logo" />
          <h4>Almost there... Spinning up a Sourcegraph Image Instance...</h4>
        </div>
      ) : (
        <div className="settings">
          <label>
            <h4 className="subtitle">Select your instance size*</h4>
            <select onChange={(e) => setSize(e.target.value)} className="input">
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </label>
          <label>
            <h4 className="subtitle">Select instance launch mode*</h4>
            <select onChange={(e) => setMode(e.target.value)} className="input">
              <option value="new">New - Launch a new instance</option>
              <option value="upgrade">
                Upgrade - Upgrade existing instance
              </option>
            </select>
          </label>
          {mode === 'upgrade' ? (
            <label>
              <h4 className="subtitle">Enter the version number for upgrade</h4>
              <input
                type="text"
                onChange={(e) => setVersion(e.target.value)}
                className="input"
                placeholder="eg: 4.1.2"
              />
            </label>
          ) : (
            <label className="file">
              <h4 className="subtitle">
                [OPTIONAL] Code host SSH file - id_rsa
              </h4>
              <h5 className="error">
                {uploadStatus &&
                  uploadStatus.id_rsa &&
                  'Upload ' + uploadStatus.id_rsa}
              </h5>
              <input
                className=""
                name="id_rsa"
                type="file"
                onChange={(e) => onFileChange(e.target.files[0], e.target.name)}
              />
              <h4 className="subtitle">
                [OPTIONAL] Code host SSH file - known_hosts
              </h4>
              <h5 className="error">
                {uploadStatus &&
                  uploadStatus.known_hosts &&
                  'Upload ' + uploadStatus.known_hosts}
              </h5>
              <input
                className=""
                name="known_hosts"
                type="file"
                onChange={(e) => onFileChange(e.target.files[0], e.target.name)}
              />
            </label>
          )}
          {showErrors && <h5 className="error">ERROR: {showErrors}</h5>}
          <div className="m-5">
            <input
              className="btn-next"
              type="button"
              value="LAUNCH"
              onClick={() => onLaunchClick()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
