'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const CreateUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    mobile: z.string().optional(),
    subscriptionTier: z.enum(['free', 'premium']),
});

export async function createUser(formData: FormData) {
    const session = await auth();
    // In a real app, use strict role checking here
    const adminEmail = "admin@example.com";
    if (session?.user?.email !== adminEmail) {
        return { error: 'Unauthorized' };
    }

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        mobile: formData.get('mobile'),
        subscriptionTier: formData.get('subscriptionTier'),
    };

    const validated = CreateUserSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: 'Invalid input data' };
    }

    const { name, email, password, mobile, subscriptionTier } = validated.data;

    try {
        const hashedPassword = await hash(password, 12);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                mobile,
                subscriptionTier,
                subscriptionStatus: 'active', // Default to active
                // If premium, give 30 days by default for manual creation
                subscriptionEndDate: subscriptionTier === 'premium'
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    : null,
            },
        });

        revalidatePath('/admin/users');
        return { success: 'User created successfully' };
    } catch (error) {
        console.error('Create user error:', error);
        return { error: 'Failed to create user. Email might already exist.' };
    }
}

export async function resetUserPassword(userId: string, newPassword: string) {
    const session = await auth();
    const adminEmail = "admin@example.com";
    if (session?.user?.email !== adminEmail) {
        return { error: 'Unauthorized' };
    }

    if (!newPassword || newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    try {
        const hashedPassword = await hash(newPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        revalidatePath('/admin/users');
        revalidatePath('/dashboard/admin');
        return { success: 'Password reset successfully' };
    } catch (error) {
        console.error('Reset password error:', error);
        return { error: 'Failed to reset password' };
    }
}

type UpdateUserData = {
    name: string;
    email: string;
    mobile: string;
    subscriptionTier: 'free' | 'premium';
    password?: string;
};

export async function updateUser(userId: string, data: UpdateUserData) {
    const session = await auth();
    const adminEmail = "admin@example.com";
    if (session?.user?.email !== adminEmail) {
        return { error: 'Unauthorized' };
    }

    try {
        const updateData: any = {
            name: data.name,
            email: data.email,
            mobile: data.mobile || null,
            subscriptionTier: data.subscriptionTier,
        };

        // Handle tier change
        if (data.subscriptionTier === 'premium') {
            updateData.subscriptionStatus = 'active';
            updateData.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else {
            updateData.subscriptionStatus = 'inactive';
            updateData.subscriptionEndDate = null;
        }

        // Handle password change
        if (data.password && data.password.length >= 6) {
            updateData.password = await hash(data.password, 12);
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        revalidatePath('/admin/users');
        revalidatePath('/dashboard/admin');
        return { success: 'User updated successfully' };
    } catch (error) {
        console.error('Update user error:', error);
        return { error: 'Failed to update user. Email might already exist.' };
    }
}

