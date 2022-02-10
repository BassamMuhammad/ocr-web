import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const CropImage = () => {
  const [src, setSrc] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 30,
    aspect: 1,
  });
  const imageRef = useRef();

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
      setCroppedImageUrl(croppedImageUrl);
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
        <img alt="Crop" style={{ maxWidth: "100%" }} src={croppedImageUrl} />
      )}
    </div>
  );
};
