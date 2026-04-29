import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { student_id, school_id, due_date, fee_ids } = await req.json()

    // 1. Fetch fees
    const { data: fees, error: feesError } = await supabaseClient
      .from('fee_categories')
      .select('*')
      .in('id', fee_ids)

    if (feesError) throw feesError

    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0)

    // 2. Create Invoice
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .insert({
        student_id,
        school_id,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        due_date: due_date || new Array(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'unpaid'
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // 3. Create Invoice Items
    const invoiceItems = fees.map(fee => ({
      invoice_id: invoice.id,
      fee_category_id: fee.id,
      description: fee.name,
      amount: fee.amount
    }))

    const { error: itemsError } = await supabaseClient
      .from('invoice_items')
      .insert(invoiceItems)

    if (itemsError) throw itemsError

    return new Response(
      JSON.stringify({ message: 'Invoice generated successfully', invoice }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})