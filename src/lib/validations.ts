import { z } from 'zod';

export const customerDetailsSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

export const pizzaSchema = z.object({
    id: z.string(),
    name: z.string(),
    basePrice: z.number(),
    imageUrl: z.string(),
});

export const toppingSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
});

export const cartItemSchema = z.object({
    pizza: pizzaSchema,
    size: z.enum(['6 inch', '8 inch', '12 inch']),
    crust: z.enum(['Thin', 'Regular', 'Thick', 'Cheese-Stuffed']),
    extraToppings: z.array(toppingSchema),
    quantity: z.number().int().positive(),
    itemTotal: z.number().positive(),
});

export const orderSchema = z.object({
    items: z.array(cartItemSchema).min(1, 'Order must have at least one item'),
    customerDetails: customerDetailsSchema,
    subtotal: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    deliveryFee: z.number().nonnegative(),
    total: z.number().positive(),
});

export type OrderInput = z.infer<typeof orderSchema>;
