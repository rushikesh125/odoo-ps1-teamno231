// lib/imgbb.js
import axios from 'axios';

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export const uploadImageToImgBB = async (imageFile) => {
  try {
    if (!IMGBB_API_KEY) {
      throw new Error('ImgBB API key is missing');
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      formData
    );

    if (response.data.success) {
      return {
        success: true,
        url: response.data.data.url,
        deleteUrl: response.data.data.delete_url
      };
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};