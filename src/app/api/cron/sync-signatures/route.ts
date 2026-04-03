import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { esignProvider } from '@/lib/integrations/esignature'

// This endpoint runs automatically via Vercel Cron
export async function GET(request: Request) {
  try {
    // 1. Verify Authorization (Vercel Cron automatically sends Bearer CRON_SECRET)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow execution without token only if we are in local development and explicit
      if (process.env.NODE_ENV !== 'development') {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    }

    const supabase = createServiceRoleClient()

    // 2. Fetch pending documents globally
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('status', 'pending')
      .eq('provider', 'boldsign')
      .not('provider_id', 'is', null)

    if (fetchError) {
      console.error('Cron: Failed to fetch pending documents:', fetchError)
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({ success: true, processed: 0 })
    }

    const statusMap: Record<string, string> = {
      'SIGNED': 'signed',
      'REJECTED': 'rejected',
      'PENDING': 'pending'
    }

    let updatedCount = 0

    // 3. Iterate and sync status with BoldSign
    for (const doc of documents) {
      try {
        const newStatusRaw = await esignProvider.checkStatus(doc.provider_id)
        const mappedStatus = statusMap[newStatusRaw]

        if (mappedStatus && mappedStatus !== doc.status && mappedStatus !== 'pending') {
          const updateData: any = { status: mappedStatus }
          
          if (mappedStatus === 'signed') {
            updateData.signed_at = new Date().toISOString()
          }

          const { error: updateError } = await supabase
            .from('documents')
            .update(updateData)
            .eq('id', doc.id)

          if (!updateError) {
            updatedCount++
          } else {
            console.error(`Cron: Failed to update DB for doc ${doc.id}:`, updateError)
          }
        }
      } catch (err: any) {
        console.error(`Cron: Failed to sync document ${doc.id}:`, err.message)
        // continue processing others
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: documents.length, 
      updated: updatedCount,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Cron job critical error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
