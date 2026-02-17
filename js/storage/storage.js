/* ===========================
   PrimeMar - Storage Module
   File Upload & Management
   =========================== */

import { supabase } from '../config/supabase.js';
import { CONFIG } from '../config/constants.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';
import { VALIDATION } from '../utils/validation.js';

export const STORAGE = {
    // Upload file to bucket
    async uploadFile(file, folder = 'media') {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // Create unique filename
            const timestamp = Date.now();
            const userId = HELPERS.getCurrentUserId();
            const extension = this.getFileExtension(file.name);
            const filename = `${userId}/${folder}/${timestamp}-${HELPERS.generateRandomString(8)}.${extension}`;
            
            // Upload to Supabase
            const { data, error } = await supabase.storage
                .from('media')
                .upload(filename, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) throw error;
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(filename);
            
            return {
                filename: filename,
                url: publicUrl,
                size: file.size,
                type: file.type
            };
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Upload profile avatar
    async uploadAvatar(file) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            // Validate image
            if (!this.isValidImage(file)) {
                throw new Error('Invalid image format');
            }
            
            if (file.size > CONFIG.FILE_LIMITS.PROFILE_PICTURE) {
                throw new Error(`Profile picture must be less than ${CONFIG.FILE_LIMITS.PROFILE_PICTURE / 1024 / 1024}MB`);
            }
            
            const userId = HELPERS.getCurrentUserId();
            const filename = `${userId}/avatar/${Date.now()}.jpg`;
            
            const { data, error } = await supabase.storage
                .from('media')
                .upload(filename, file, {
                    cacheControl: '86400',
                    upsert: true
                });
            
            if (error) throw error;
            
            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(filename);
            
            // Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('user_id', userId);
            
            if (updateError) throw updateError;
            
            ERROR_HANDLER.showSuccess('Avatar updated');
            return publicUrl;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Delete file
    async deleteFile(filename) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { error } = await supabase.storage
                .from('media')
                .remove([filename]);
            
            if (error) throw error;
            return true;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Validate file
    validateFile(file) {
        // Check file type
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'application/pdf',
            'application/msword'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'File type not supported'
            };
        }
        
        // Check file size based on type
        if (file.type.startsWith('image/')) {
            if (file.size > CONFIG.FILE_LIMITS.IMAGE) {
                return {
                    valid: false,
                    error: `Image must be less than ${CONFIG.FILE_LIMITS.IMAGE / 1024 / 1024}MB`
                };
            }
        } else if (file.type.startsWith('video/')) {
            if (file.size > CONFIG.FILE_LIMITS.VIDEO) {
                return {
                    valid: false,
                    error: `Video must be less than ${CONFIG.FILE_LIMITS.VIDEO / 1024 / 1024}MB`
                };
            }
        } else {
            if (file.size > CONFIG.FILE_LIMITS.DOCUMENT) {
                return {
                    valid: false,
                    error: `Document must be less than ${CONFIG.FILE_LIMITS.DOCUMENT / 1024 / 1024}MB`
                };
            }
        }
        
        return { valid: true };
    },

    // Check if file is valid image
    isValidImage(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return validTypes.includes(file.type);
    },

    // Get file extension
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    },

    // Get file size in human-readable format
    getFileSizeReadable(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    // Get signed URL for private files
    async getSignedUrl(filename, expiresIn = 3600) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase.storage
                .from('media')
                .createSignedUrl(filename, expiresIn);
            
            if (error) throw error;
            return data.signedUrl;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    }
};
