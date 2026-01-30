import { v2 as cloudinary } from 'cloudinary';

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "null",
        api_key: process.env.CLOUDINARY_API_KEY || "null",
        api_secret: process.env.CLOUDINARY_API_SECRET || "null",
    });
};

export default configureCloudinary;
