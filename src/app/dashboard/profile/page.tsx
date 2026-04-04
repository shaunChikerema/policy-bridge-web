// src/app/dashboard/profile/page.tsx
"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  AlertCircle,
  Building,
  Camera,
  Check,
  Crop,
  Edit3,
  Loader2,
  Mail,
  Phone,
  RotateCw,
  Save,
  User,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useProfile } from "../../../components/layout/profile-context";

// Use proper Next.js Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotate: number;
}

// Image Cropper Component
const ImageCropper: React.FC<{
  src: string;
  onCrop: (croppedImage: Blob) => void;
  onCancel: () => void;
}> = ({ src, onCrop, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [cropData, setCropData] = useState<CropData>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    scale: 1,
    rotate: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded && canvasRef.current && imageRef.current) {
      drawImage();
    }
  }, [cropData, imageLoaded]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    canvas.width = 400;
    canvas.height = 400;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Move to center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((cropData.rotate * Math.PI) / 180);
    ctx.scale(cropData.scale, cropData.scale);

    // Draw image centered
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const aspectRatio = imgWidth / imgHeight;

    let drawWidth = 300;
    let drawHeight = 300;

    if (aspectRatio > 1) {
      drawHeight = drawWidth / aspectRatio;
    } else {
      drawWidth = drawHeight * aspectRatio;
    }

    ctx.drawImage(
      img,
      -drawWidth / 2 + cropData.x,
      -drawHeight / 2 + cropData.y,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    // Draw crop overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const cropSize = Math.min(cropData.width, cropData.height);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(centerX, centerY, cropSize / 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";

    // Draw crop circle border
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, cropSize / 2, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropData.x,
      y: e.clientY - cropData.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      setCropData((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleScale = (delta: number) => {
    setCropData((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale + delta)),
    }));
  };

  const handleRotate = () => {
    setCropData((prev) => ({
      ...prev,
      rotate: (prev.rotate + 90) % 360,
    }));
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Create final crop canvas
    const cropCanvas = document.createElement("canvas");
    const cropCtx = cropCanvas.getContext("2d");

    if (!cropCtx) return;

    const cropSize = 200; // Final avatar size
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;

    // Save context
    cropCtx.save();

    // Create circular clipping path
    cropCtx.beginPath();
    cropCtx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, 2 * Math.PI);
    cropCtx.clip();

    // Move to center for rotation
    cropCtx.translate(cropSize / 2, cropSize / 2);
    cropCtx.rotate((cropData.rotate * Math.PI) / 180);
    cropCtx.scale(cropData.scale, cropData.scale);

    // Draw image
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const aspectRatio = imgWidth / imgHeight;

    let drawWidth = cropSize * 1.5;
    let drawHeight = cropSize * 1.5;

    if (aspectRatio > 1) {
      drawHeight = drawWidth / aspectRatio;
    } else {
      drawWidth = drawHeight * aspectRatio;
    }

    cropCtx.drawImage(
      img,
      -drawWidth / 2 + cropData.x * 0.5,
      -drawHeight / 2 + cropData.y * 0.5,
      drawWidth,
      drawHeight
    );

    cropCtx.restore();

    // Convert to blob
    cropCanvas.toBlob(
      (blob) => {
        if (blob) {
          onCrop(blob);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Crop Avatar</h3>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Canvas for cropping */}
            <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                className="w-full h-auto cursor-move"
                style={{ maxHeight: "400px" }}
              />

              {/* Hidden image for reference */}
              <img
                ref={imageRef}
                src={src}
                alt="Crop preview"
                className="hidden"
                onLoad={() => setImageLoaded(true)}
                crossOrigin="anonymous"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleScale(-0.1)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(cropData.scale * 100)}%
              </span>

              <button
                onClick={() => handleScale(0.1)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-300" />

              <button
                onClick={handleRotate}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm text-gray-600 text-center">
              Drag to reposition • Use controls to zoom and rotate
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Crop className="w-4 h-4" />
                <span>Apply Crop</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  // Use profile context instead of local state
  const {
    user,
    profile,
    loading: contextLoading,
    updateProfile,
  } = useProfile();

  // Local state for form and UI
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    company: "",
  });

  // Avatar handling
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        company: profile.company || "",
      });
    } else {
      // Reset form if no profile
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        company: "",
      });
    }
  }, [profile]);

  // NEW: Function to crop existing image
  const handleCropExisting = () => {
    const currentImageUrl = avatarPreview || profile?.avatar_url;
    if (currentImageUrl) {
      setRawImageSrc(currentImageUrl);
      setShowCropper(true);
    }
  };

  const saveProfile = async () => {
    if (!user) {
      showMessage("error", "No user authenticated");
      return;
    }

    try {
      setSaving(true);
      console.log("=== PROFILE SAVE DEBUG START ===");

      // Validation
      if (!formData.first_name.trim()) {
        throw new Error("First name is required");
      }

      console.log("1. Starting profile save for user:", user.id);

      let avatarUrl = profile?.avatar_url || null;

      // Upload avatar if new file selected
      if (avatarFile) {
        console.log("2. Uploading avatar...");
        const fileExt = "jpg"; // Always use jpg for cropped images
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        // Use the correct path structure for RLS policies: public/[user-id]/[filename]
        const uploadPath = `public/${user.id}/${fileName}`;
        console.log(`Uploading to path: ${uploadPath}`);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(uploadPath, avatarFile, {
            cacheControl: "3600",
            upsert: true,
          });

        console.log("3. Avatar upload result:", {
          uploadData,
          uploadError: uploadError?.message,
        });

        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
          throw new Error(`Avatar upload failed: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);

        avatarUrl = publicUrl;
        console.log("4. Avatar uploaded successfully, URL:", publicUrl);
      }

      const updateData = {
        id: user.id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim() || null,
        phone: formData.phone.trim() || null,
        company: formData.company.trim() || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      console.log("5. Saving profile data:", updateData);

      const { data, error } = await supabase
        .from("profiles")
        .upsert(updateData, {
          onConflict: "id",
        })
        .select()
        .single();

      console.log("6. Profile save result:", {
        data,
        error: error?.message,
      });

      if (error) {
        console.error("Profile save error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Save failed: ${error.message}`);
      }

      console.log("7. Profile saved successfully:", data);
      console.log("=== PROFILE SAVE DEBUG END ===");

      // Update the context with new profile data
      updateProfile(data);

      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setRawImageSrc(null);
      showMessage("success", "Profile updated successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save profile";
      console.error("Save profile error:", error);
      showMessage("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("error", "Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setRawImageSrc(result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convert blob to file
    const croppedFile = new File([croppedBlob], "avatar.jpg", {
      type: "image/jpeg",
    });

    setAvatarFile(croppedFile);

    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedBlob);
    setAvatarPreview(previewUrl);

    setShowCropper(false);
    setRawImageSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImageSrc(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelEditing = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        company: profile.company || "",
      });
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setRawImageSrc(null);
    setEditing(false);
    setMessage(null);
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getDisplayName = () => {
    if (profile?.first_name?.trim() || profile?.last_name?.trim()) {
      return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    }
    return user?.email?.split("@")[0] || "User";
  };

  const getInitials = () => {
    if (profile?.first_name?.trim()) {
      return profile.first_name[0].toUpperCase();
    }
    const emailName = user?.email?.split("@")[0] || "U";
    return emailName[0].toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Show loading while getting user or profile from context
  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">
            {!user ? "Checking authentication..." : "Loading profile..."}
          </p>
        </div>
      </div>
    );
  }

  // Handle case where no user is found
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please log in to view your profile.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Image Cropper Modal */}
      {showCropper && rawImageSrc && (
        <ImageCropper
          src={rawImageSrc}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center space-x-3 ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Profile Header - FIXED VERSION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                  {avatarPreview || (profile && profile.avatar_url) ? (
                    <Image
                      src={avatarPreview || profile!.avatar_url!}
                      alt="Profile avatar"
                      width={96}
                      height={96}
                      className="object-cover rounded-full"
                      unoptimized
                    />
                  ) : (
                    <span>{getInitials()}</span>
                  )}
                </div>
                {editing && (
                  <div className="absolute -bottom-2 -right-2 flex space-x-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      title="Upload new image"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                    {(avatarPreview || profile?.avatar_url) && (
                      <button
                        onClick={handleCropExisting}
                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        title="Crop current image"
                      >
                        <Crop className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  {getDisplayName()}
                </h1>
                {/* FIXED: Only show company if it exists, no hardcoded role */}
                {profile?.company && (
                  <p className="text-blue-100 text-lg">at {profile.company}</p>
                )}
                {/* Optional: Show loading state while profile is loading */}
                {contextLoading && !profile && (
                  <p className="text-blue-200 text-sm">Loading profile...</p>
                )}
              </div>
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={cancelEditing}
                  className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
                disabled={!editing}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter your first name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
                disabled={!editing}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={user.email}
                disabled={true}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed here
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                disabled={!editing}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    company: e.target.value,
                  }))
                }
                disabled={!editing}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter your company name"
              />
            </div>
          </div>
        </div>

        {/* Profile Metadata */}
        {profile && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-medium text-gray-700">Member since:</span>
                <p className="text-gray-600 mt-1">
                  {formatDate(profile.created_at)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last updated:</span>
                <p className="text-gray-600 mt-1">
                  {formatDate(profile.updated_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button for Mobile */}
        {editing && (
          <div className="mt-8 flex space-x-3 md:hidden">
            <button
              onClick={cancelEditing}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
