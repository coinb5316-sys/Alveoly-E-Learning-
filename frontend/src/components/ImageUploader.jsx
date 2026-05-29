// src/components/ImageUploader.jsx
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt, FaTrash, FaSpinner, FaImage } from "react-icons/fa";
import API from "../api/axios";
import toast from "react-hot-toast";

const ImageUploader = ({ onUploadComplete, onRemove, existingImage, label = "Featured Image" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingImage?.url || null);
  const [uploadedImage, setUploadedImage] = useState(existingImage || null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await API.post("/blogs/upload/featured", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadedImage(res.data);
      onUploadComplete(res.data);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image");
      setPreview(existingImage?.url || null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  }, [onUploadComplete, existingImage]);

  const handleRemove = async () => {
    if (uploadedImage?.publicId) {
      try {
        await API.delete(`/blogs/image/${uploadedImage.publicId}`);
        setUploadedImage(null);
        setPreview(null);
        onRemove();
        toast.success("Image removed");
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to remove image");
      }
    } else {
      setPreview(null);
      setUploadedImage(null);
      onRemove();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {!preview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-3" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the image here...</p>
          ) : (
            <>
              <p className="text-gray-600">Drag & drop an image here, or click to select</p>
              <p className="text-sm text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
            </>
          )}
        </div>
      ) : (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
            {uploading ? (
              <FaSpinner className="text-white text-2xl animate-spin" />
            ) : (
              <>
                <a
                  href={preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaImage className="text-gray-700" />
                </a>
                <button
                  onClick={handleRemove}
                  className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaTrash className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;