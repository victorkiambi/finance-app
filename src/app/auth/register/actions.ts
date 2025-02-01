'use server'
import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";

export async function registerUser(fullName: string, email: string, password: string) {
    const supabase = await createClient()

    const data  = {
        email,
        password,
        options: {
            // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            data: {
                full_name: fullName,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/auth/confirm-email')
}