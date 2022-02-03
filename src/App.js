import { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

function App() {
  const cameraRef = useRef();
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
    const byteCharacters = Buffer.from(b64Data, "base64");
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  const takePic = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    const b64Img = cameraRef.current.getScreenshot();
    const res = await fetch(b64Img);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    Tesseract.recognize(blobUrl, "eng", {
      logger: (m) => {
        setProgress(Math.floor(m.progress * 100));
      },
    }).then(({ data }) => {
      setLoading(false);
      if (data.text.length === 0) alert("No text found");
      setText(data.text);
    });
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative" }}>
          <Webcam ref={cameraRef} screenshotFormat="image/jpeg" />

          {loading ? (
            <progress
              style={{
                position: "absolute",
                bottom: "10%",
                left: "50%",
              }}
              value={progress}
              max="100"
            />
          ) : (
            <button
              onClick={takePic}
              style={{
                position: "absolute",
                bottom: "10%",
                left: "50%",
                backgroundColor: "gray",
                cursor: "pointer",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                borderColor: "gray",
              }}
            ></button>
          )}
        </div>

        {text.length > 0 && <p style={{ margin: "5%" }}>{text}</p>}
      </div>
    </div>
  );
}

export default App;
