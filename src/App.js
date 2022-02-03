import { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

function App() {
  const cameraRef = useRef();
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const takePic = () => {
    if (!cameraRef.current) return;
    setLoading(true);
    const img = new Image();
    img.src = cameraRef.current.getScreenshot();
    Tesseract.recognize(img, "eng", {
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
