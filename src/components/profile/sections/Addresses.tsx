"use client";

import { useState } from "react";
import { Edit3, MapPin, Phone, Plus, Trash2, Loader2 } from "lucide-react";
import {
    useGetAddressesQuery,
    useDeleteAddressMutation,
    useSetDefaultAddressMutation
} from "@/redux/api/addressApi";
import { Button } from "@/components/ui/button";
import AddressForm from "./AddressForm";
import { toast } from "react-hot-toast";
import { Address } from "@/types";


export default function AddressesSection() {
    const { data: addresses, isLoading, isError } = useGetAddressesQuery();
    const [deleteAddress] = useDeleteAddressMutation();
    const [setDefaultAddress] = useSetDefaultAddressMutation();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);

    const handleAdd = () => {
        setEditingAddress(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this address?")) {
            try {
                const res = await deleteAddress(id).unwrap();
                toast.success(res?.message || "Address deleted successfully");
            } catch (error: any) {
                toast.error(error?.data?.message || "Failed to delete address");
            }
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const res = await setDefaultAddress(id).unwrap();
            toast.success(res?.message || "Default address updated");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update default address");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Saved Addresses</h2>
                    <p className="text-gray-600 dark:text-slate-400 text-sm">Manage your delivery addresses</p>
                </div>
                <Button onClick={handleAdd} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Address
                </Button>
            </div>

            <div className="grid gap-4">
                {addresses?.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                        <p className="text-gray-500 dark:text-slate-400">No saved addresses found</p>
                    </div>
                ) : (
                    addresses?.map((address: Address) => (
                        <div
                            key={address._id}
                            className={`border-2 rounded-lg p-5 transition-all duration-200 hover:shadow-md ${address.isDefault
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    {address.isDefault && (
                                        <span className="px-2 py-1 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full font-medium">
                                            Default
                                        </span>
                                    )}
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(address._id)}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Set as default
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address._id)}
                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="font-semibold text-gray-800 dark:text-slate-100">{address.name}</div>
                                <div className="text-gray-600 dark:text-slate-400">{address.address}</div>
                                <div className="text-gray-600 dark:text-slate-400">{address.city}, {address.state} - {address.pinCode}</div>
                                <div className="text-gray-600 dark:text-slate-400">{address.country}</div>
                                <div className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {address.phoneNo}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddressForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                address={editingAddress}
            />
        </div>
    );
}
