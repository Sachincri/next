import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Assuming you have shadcn dialog or similar
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface StripePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientSecret: string;
    publishableKey: string;
    onSuccess: (paymentIntentId: string) => void;
}

const CheckoutForm = ({ onSuccess }: { onSuccess: (id: string) => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/order/success', // We handle success manually usually, but this is required
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm font-medium">{errorMessage}</div>}
            <Button type="submit" disabled={!stripe || isLoading} className="w-full bg-[#0d0e26] dark:bg-slate-100 dark:text-gray-900 font-bold h-11 transition-all hover:opacity-90">
                {isLoading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
                Pay Now
            </Button>
        </form>
    );
};

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
    isOpen,
    onClose,
    clientSecret,
    publishableKey,
    onSuccess
}) => {
    // Only load if key is present. 
    // Note: optimization would be to load this outside or memoize it.
    const stripePromise = React.useMemo(() => loadStripe(publishableKey), [publishableKey]);
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-slate-100">Secure Payment via Stripe</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {clientSecret && (
                        <Elements stripe={stripePromise} options={{
                            clientSecret,
                            appearance: {
                                theme: isDark ? 'night' : 'stripe',
                                variables: {
                                    colorPrimary: '#2563eb',
                                }
                            }
                        }}>
                            <CheckoutForm onSuccess={onSuccess} />
                        </Elements>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
