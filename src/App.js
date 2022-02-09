import { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { preprocessImage } from "./utils/preprocess";
function App() {
  const cameraRef = useRef();
  const imgRef = useRef();
  const [cameraDirection, setCameraDirection] = useState("user");
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const takePic = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    const b64Img = cameraRef.current.getScreenshot();
    const img = await preprocessImage(b64Img);
    const res = await fetch(img);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    imgRef.current.src = blobUrl;
    console.log(blobUrl);
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
          <Webcam
            videoConstraints={{ facingMode: cameraDirection }}
            ref={cameraRef}
            screenshotFormat="image/jpeg"
          />

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
        <button
          onClick={() => {
            if (cameraDirection === "user") setCameraDirection("environment");
            else setCameraDirection("user");
          }}
        >
          Change Camera Direction
        </button>
        {text.length > 0 && <p style={{ margin: "5%" }}>{text}</p>}
        <img src="" ref={imgRef} alt="ocr" />
      </div>
    </div>
  );
}

export default App;
