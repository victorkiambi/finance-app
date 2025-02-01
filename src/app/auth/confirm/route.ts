import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = '/dashboard'

    // Create redirect link without the secret token
    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = next
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')

    if (token_hash && type) {
        const supabase = await createClient()

        // Verify the email
        const { error: verificationError, data: { user } } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (verificationError) {
            redirectTo.pathname = '/error'
            return NextResponse.redirect(redirectTo)
        }

        if (user) {
            try {
                // Create user record in our users table
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: user.id,
                            email: user.email,
                            full_name: user.user_metadata.full_name,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }
                    ])
                    .select()
                    .single()

                if (insertError && insertError.code !== '23505') { // Ignore unique constraint violations
                    console.error('Error creating user record:', insertError)
                    // Continue with redirect even if user record creation fails
                }
            } catch (error) {
                console.error('Error in user creation:', error)
                // Continue with redirect even if user record creation fails
            }
        }

        redirectTo.searchParams.delete('next')
        return NextResponse.redirect(redirectTo)
    }

    // return the user to an error page with some instructions
    redirectTo.pathname = '/error'
    return NextResponse.redirect(redirectTo)
}