export type Size = '6 inch' | '8 inch' | '12 inch';
export type Crust = 'Thin' | 'Regular' | 'Thick' | 'Cheese-Stuffed';

export interface Topping {
    id: string;
    name: string;
    price: number;
}

export interface Pizza {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string;
    isVegetarian?: boolean;
    isSpicy?: boolean;
}

export interface CartItem {
    id: string; // Unique ID for the cart item
    pizza: Pizza;
    size: Size;
    crust: Crust;
    extraToppings: Topping[];
    quantity: number;
    itemTotal: number;
}

export interface Order {
    id: string;
    userId?: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
    statusHistory?: { 
        status: string; 
        date: string; 
        note?: string; 
    }[];
    status: 'Pending Payment' | 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
    createdAt: string;
    customerDetails: {
        name: string;
        email: string;
        address: string;
        phone: string;
        lat?: number;
        lng?: number;
    };
}
