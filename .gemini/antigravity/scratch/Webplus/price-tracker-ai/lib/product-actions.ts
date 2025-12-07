'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const UpdateAlertSchema = z.object({
    productId: z.string(),
    alertThreshold: z.coerce.number().min(0).optional(),
    alertEnabled: z.boolean(),
    notifyAnyDrop: z.boolean(),
});

export async function updateProductAlert(formData: FormData) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    const rawData = {
        productId: formData.get('productId'),
        alertThreshold: formData.get('alertThreshold'),
        alertEnabled: formData.get('alertEnabled') === 'on',
        notifyAnyDrop: formData.get('notifyAnyDrop') === 'on',
    };

    const validatedFields = UpdateAlertSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: 'Invalid input' };
    }

    const { productId, alertThreshold, alertEnabled, notifyAnyDrop } = validatedFields.data;

    try {
        await prisma.product.update({
            where: {
                id: productId,
                userId: session.user.id // Ensure ownership
            },
            data: {
                alertThreshold: notifyAnyDrop ? null : alertThreshold, // If any drop, we might ignore threshold or keep it but logic ignores. User said disable input.
                alertEnabled,
                notifyAnyDrop,
            },
        });

        revalidatePath('/dashboard/products');
        return { success: 'Alert settings updated' };
    } catch (error) {
        console.error('Update product error:', error);
        return { error: 'Failed to update product' };
    }
}

export async function deleteProduct(productId: string) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    try {
        await prisma.product.delete({
            where: {
                id: productId,
                userId: session.user.id
            }
        });
        revalidatePath('/dashboard/products');
        return { success: 'Product deleted' };
    } catch (error) {
        return { error: 'Failed to delete product' };
    }
}
