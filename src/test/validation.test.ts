import { describe, it, expect } from 'vitest';
import { orderSchema } from '../lib/validations';

describe('Order Validation Schema', () => {
    it('should validate a correct order', () => {
        const validOrder = {
            items: [
                {
                    pizza: { id: 'p1', name: 'Margherita', basePrice: 12.99, imageUrl: '/img.png' },
                    size: '12 inch',
                    crust: 'Regular',
                    extraToppings: [],
                    quantity: 1,
                    itemTotal: 12.99,
                }
            ],
            customerDetails: {
                name: 'John Doe',
                email: 'john@example.com',
                address: '123 Pizza St',
                phone: '1234567890',
            },
            subtotal: 12.99,
            tax: 1.30,
            deliveryFee: 2.00,
            total: 16.29,
        };

        const result = orderSchema.safeParse(validOrder);
        expect(result.success).toBe(true);
    });

    it('should fail if email is invalid', () => {
        const invalidOrder = {
            items: [],
            customerDetails: {
                name: 'J',
                email: 'not-an-email',
                address: '',
                phone: '',
            },
            subtotal: 0,
            tax: 0,
            deliveryFee: 0,
            total: 0,
        };

        const result = orderSchema.safeParse(invalidOrder);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.customerDetails).toContain('Invalid email address');
        }
    });
});
