import { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
// import { preprocessImage } from "./utils/preprocess";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
function App() {
  const cameraRef = useRef();
  const [src, setSrc] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 30,
    aspect: 1,
  });
  const imageRef = useRef();
  const [cameraDirection, setCameraDirection] = useState("user");
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const takePic = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    const b64Img = cameraRef.current.getScreenshot();
    setSrc(b64Img);
    // const img = await preprocessImage(b64Img);
    // const res = await fetch(img);
    // const blob = await res.blob();
    // const blobUrl = URL.createObjectURL(blob);
    // imgRef.current.src = blobUrl;
    // console.log(blobUrl);
    // Tesseract.recognize(blobUrl, "eng", {
    //   logger: (m) => {
    //     setProgress(Math.floor(m.progress * 100));
    //   },
    // }).then(({ data }) => {
    //   setLoading(false);
    //   if (data.text.length === 0) alert("No text found");
    //   setText(data.text);
    // });
  };

  const onImageLoaded = (image) => {
    imageRef.current = image;
  };

  const onCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const onCropChange = (crop, percentCrop) => {
    setCrop(crop);
  };

  const makeClientCrop = async (crop) => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(
        imageRef.current,
        crop,
        "newFile.jpeg"
      );
      // const img = await preprocessImage(croppedImageUrl);
      // const res = await fetch(img);
      // const blob = await res.blob();
      // const blobUrl = URL.createObjectURL(blob);
      // setCroppedImageUrl(blobUrl);
      Tesseract.recognize(croppedImageUrl, "eng", {
        logger: (m) => {
          setProgress(Math.floor(m.progress * 100));
        },
      }).then(({ data }) => {
        setLoading(false);
        if (data.text.length === 0) alert("No text found");
        setText(data.text);
      });
    }
  };

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const pixelRatio = window.devicePixelRatio;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            //reject(new Error('Canvas is empty'));
            console.error("Canvas is empty");
            return;
          }
          blob.name = fileName;
          const fileUrl = window.URL.createObjectURL(blob);
          resolve(fileUrl);
        },
        "image/jpeg",
        1
      );
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
        <div>
          {src && (
            <ReactCrop
              src={src}
              crop={crop}
              ruleOfThirds
              onImageLoaded={onImageLoaded}
              onComplete={onCropComplete}
              onChange={onCropChange}
            />
          )}
          {croppedImageUrl && (
            <img
              alt="Crop"
              style={{ maxWidth: "100%" }}
              src={croppedImageUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
