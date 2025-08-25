export const handleUpload = async (files, room_code, restFunc) => {
  const formData = new FormData();

  for (const item of files) {
    const file = item.file;
    formData.append("files", file);
  }

  try {
    const response = await fetch(`${window.location.origin}/api/convert/${room_code}/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let err_res = await response.json()
      throw new Error(err_res["error"])
    }

    const blob = await response.blob(); // application/zip
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${room_code}_files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTimeout(()=>{restFunc()}, 700)
  } catch (error) {
    console.log(error)
    alert(error);
  }
};

