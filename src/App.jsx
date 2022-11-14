import { useCallback, useState, useEffect } from 'react';
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
  const reader = new FileReader();
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
          .then(async (res) => await res.json())
          .then((res) => setUploadStatus(res.message))
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
    async (file) => {
      const getFileName = await file.name;
      setFileName(getFileName);
      reader.readAsText(file, 'UTF-8');
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
        tries--;
        setTimeout(() => {
          fetch(`http://${hostname}:30080/.api/check`)
            .then((res) => res.json())
            .then((res) => {
              if (res === 'Ready') {
                fetch(`http://${hostname}:30080/.api/remove`)
                  .then((res) => res.json())
                  .catch((error) => console.log(error));
                window.location.replace(`http://${hostname}:80`);
              } else {
                checkFrontend(tries);
              }
            })
            .catch((error) => console.log(error));
        }, '10000');
      }
    }

    try {
      fetch(`http://${hostname}:30080/.api/${mode}?size=${size}`, postRequest)
        .then(async (res) => await res)
        .then((res) => {
          if (res.status && !showErrors) {
            checkFrontend(20);
          }
        })
        .catch((error) => console.log(error));
      setSubmitted(!showErrors);
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
            <h4 className="subtitle">What is your instance size?</h4>
            <select onChange={(e) => setSize(e.target.value)} className="input">
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </label>
          <label>
            <h4 className="subtitle">Select a launch mode</h4>
            <select onChange={(e) => setMode(e.target.value)} className="input">
              <option value="new">New instance</option>
              <option value="upgrade">Perform upgrade</option>
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
                Code host SSH file {uploadStatus && 'Status: ' + uploadStatus}
              </h4>
              <input
                className=""
                name="upload"
                type="file"
                onChange={(e) => onFileChange(e.target.files[0])}
              />
            </label>
          )}
          {showErrors && <h5>Error: {showErrors}</h5>}
          <div className="m-5">
            <input
              className="btn"
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
