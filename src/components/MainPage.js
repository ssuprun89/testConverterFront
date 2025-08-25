import React, {useRef, useState} from "react";
import {init_ws} from "../Networking/ws";
import {handleUpload} from "../Networking/api";

const MainPage = () => {
  const [files, setFiles] = useState([]);
  const [downloaded, setDownloaded] = useState(false);
  const wsRef = useRef(null)

  const handleFileChange = (e) => {
    setDownloaded(false)
    const selectedFiles = Array.from(e.target.files);
    const allowedExtensions = ["doc", "docx", "zip"];
    const tempFiles = []
    selectedFiles.forEach((file, id) => {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      tempFiles.push({
        id, file, error: !allowedExtensions.includes(fileExtension) || file.name.includes("|"), status: "Waiting", progress: 0
      })

    });
    setFiles(tempFiles);
    e.target.value = ""
  };

  const deleteFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleSendProcess = async () => {
    let room_code = Date.now()
    if (wsRef.current) {
      wsRef.current.close()
    }
    wsRef.current = init_ws(room_code, updateStatusFile)
    setTimeout(async ()=>{
      await handleUpload(files, room_code, ()=>{setFiles([]); setDownloaded(true)})
    }, 500)
  }

  const updateStatusFile = (data) => {
    setFiles(
      prev => prev.map((item) => {
        let [name, ext] = item.file.name.split(".")
        let key = Object.keys(data).filter(i => i.startsWith(`${name}|`))
        if (String(item.file.name) in data){
          item.status = data[item.file.name].status
          item.progress = data[item.file.name].progress > item.progress ? data[item.file.name].progress : item.progress
        }
        else if (key.length > 0) {
          item.status = data[key[0]].status
          item.progress = data[key[0]].progress > item.progress ? data[key[0]].progress : item.progress
        }
        return item
      })
    )
  }

  return (
    <div className="container pt-4">
      <div className="w-100 text-center">
        <h1 className="fw-bold">Convert WORD to PDF</h1>
        <p>Make DOC and DOCX files easy to read by converting them to PDF.</p>
        <label htmlFor="filesUpload" onClick={()=>{setFiles([])}} className="btn btn-danger btn">Upload DOC, DOCX, ZIP</label>
        <input type="file" multiple id="filesUpload" className="d-none" onChange={handleFileChange}/>
      </div>
      {files.length > 0 && (
        <div className="mt-3">
          <table className="table table-bordered w-100">
            <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Status</th>
              <th>Progress</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {files.map((f, i) => (
              <tr key={i} className={f.error ? "table-danger" : "table-light"}>
                <td>{i + 1}</td>
                <td>{f.file.name}</td>
                <td>{f.status}</td>
                <td>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{width: `${f.progress}%`}}
                      role="progressbar"
                      aria-valuenow="0" aria-valuemin="0"
                      aria-valuemax="100"></div>
                  </div>
                </td>
                <td>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red"
                       className="bi bi-trash" viewBox="0 0 16 16" onClick={() => {
                    deleteFile(f.id)
                  }}>
                    <path
                      d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                    <path
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                  </svg>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-end">
            {files.some(f => f.error) ? (
              <span title="We cant process wrong format or name contain '|'" style={{cursor: "not-allowed"}}>
                <button className="btn btn-secondary" disabled>
                  Process File
                </button>
              </span>
            ) : (
              <button className="btn btn-primary" onClick={handleSendProcess}>Process File</button>
            )}
          </div>
        </div>
      )}
      {downloaded && (
        <div className="mt-3 text-center">
          <h3 className="text-success">Please check downloads. We sent you archive with files</h3>
        </div>
      )}
    </div>
  );
}

export default MainPage;
