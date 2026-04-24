import { v2 as cloudinary } from 'cloudinary'
import { Env } from './env.config';
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer';

cloudinary.config({ // it will give permission to upload files
    cloud_name: Env.CLOUDINARY_CLOUD_NAME,
    api_key: Env.CLOUDINARY_API_KEY,
    api_secret: Env.CLOUDINARY_API_SECRET,
});

//  This defines how files are stored on Cloudinary:
const STORAGE_PARAMS = {
    folder: "images",
    allowed_formats: ['jpg', 'jpeg' , 'png', 'pdf'],
    resource_type: "image" as const,
    quality: "auto:good" as const
}

// Connects Multer with Cloudinary So uploaded files go directly to Cloudinary (not local disk)
const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
        ...STORAGE_PARAMS
    })
})

export const uploadOnCloudinary = multer({  // used in routes
    storage,    // Files go directly to Cloudinary
    limits: {   
        fileSize: 2 * 1024 * 1024,   //Max size = 2MB 
        files: 1                   // Only 1 file allowed
    },
    fileFilter: (_, file, cb) => {
        const isValid = /^image\/(jpeg|jpg|png)$/.test(file.mimetype)   // allows only jpg , jpeg , png file

        if(!isValid){
            return;
        }
        cb(null, true)
    }
})