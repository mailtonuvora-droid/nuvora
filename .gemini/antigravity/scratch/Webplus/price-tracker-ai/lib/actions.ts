'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
});

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        console.log("Attempting sign in for:", formData.get('email'));
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: '/dashboard',
        });
        console.log("Sign in returned (unexpected for redirect)");
    } catch (error) {
        console.log("Sign in error/redirect:", error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function signup(prevState: string | undefined, formData: FormData) {
    const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return 'Invalid fields. Failed to Create User.';
    }

    const { email, password, name } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return 'User already exists.';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        // Automatically sign in after signup? Or redirect to login?
        // For simplicity, let's redirect to login or just return success
        return 'User created successfully. Please log in.';
    } catch (error) {
        console.error('Signup error:', error);
        return 'Failed to create user.';
    }
}
