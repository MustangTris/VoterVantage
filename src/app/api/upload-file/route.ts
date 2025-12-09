import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user with NextAuth
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            )
        }

        // 2. Parse the uploaded file
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // 3. Validate file size (50MB limit)
        const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum size is 50MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` },
                { status: 400 }
            )
        }

        // 4. Validate file type
        const allowedExtensions = ['.xlsx', '.xls', '.csv', '.pdf']
        const fileName = file.name.toLowerCase()
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

        if (!hasValidExtension) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}` },
                { status: 400 }
            )
        }

        // 5. Upload to Supabase Storage using service role (bypasses RLS)
        const supabase = createServiceRoleClient()

        // Generate safe file name
        const sanitizedFileName = file.name.replace(/[^a-z0-9.]/gi, '_')
        const filePath = `raw_uploads/${Date.now()}_${sanitizedFileName}`

        // Convert File to ArrayBuffer for upload
        const fileBuffer = await file.arrayBuffer()

        const { data, error } = await supabase.storage
            .from('filings')
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                upsert: false
            })

        if (error) {
            console.error('Storage upload error:', error)
            return NextResponse.json(
                { error: `Storage upload failed: ${error.message}` },
                { status: 500 }
            )
        }

        // 6. Return success with file path
        return NextResponse.json({
            success: true,
            filePath: data.path,
            fileName: file.name,
            fileSize: file.size
        })

    } catch (error: any) {
        console.error('Upload API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// Increase payload size limit for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
}
