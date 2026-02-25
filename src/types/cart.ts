export interface CartItem {
  _id?: string;
  product: string; // Product ID
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  stock: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CartSummary {
  products: CartItem[];
  address: any;
  priceDetails: {
    totalMRP: number;
    totalDiscount: number;
    couponCode?: string | null;
    couponDiscount: number;
    coinsDiscount: number;
    isCoinsRedeemed: boolean;
    shippingFees: number;
    platformFees: number;
    totalAmount: number;
    items: number;
  };
}


export interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
  phoneNo: string;
  email?: string;
}
export interface CartState {
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  cartSummary: CartSummary | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}