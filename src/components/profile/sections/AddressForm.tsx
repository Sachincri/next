"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Address } from "@/types";


import { useAddAddressMutation, useUpdateAddressMutation } from "@/redux/api/addressApi";
import { toast } from "react-hot-toast";


interface AddressFormProps {
    open: boolean;
    onClose: () => void;
    address?: Address;
}

export default function AddressForm({ open, onClose, address }: AddressFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        pinCode: "",
        phoneNo: "",
        isDefault: false,
    });

    const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
    const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

    useEffect(() => {
        if (address) {
            setFormData({
                name: address.name,
                address: address.address,
                city: address.city,
                state: address.state,
                country: address.country,
                pinCode: address.pinCode.toString(),
                phoneNo: address.phoneNo,
                isDefault: address.isDefault,
            });
        } else {
            setFormData({
                name: "",
                address: "",
                city: "",
                state: "",
                country: "",
                pinCode: "",
                phoneNo: "",
                isDefault: false,
            });
        }
    }, [address, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                pinCode: Number(formData.pinCode),
            };

            if (address) {
                const res = await updateAddress({ id: address._id, body: payload }).unwrap();
                toast.success(res?.message || "Address updated successfully");
            } else {
                const res = await addAddress(payload).unwrap();
                toast.success(res?.message || "Address added successfully");
            }
            onClose();
        } catch (error: any) {
            toast.error(error.data?.message || "Failed to save address");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-slate-100">{address ? "Edit Address" : "Add New Address"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-slate-300">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNo" className="text-gray-700 dark:text-slate-300">Phone Number</Label>
                        <Input
                            id="phoneNo"
                            placeholder="10-digit mobile number"
                            value={formData.phoneNo}
                            onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-gray-700 dark:text-slate-300">Address</Label>
                        <Input
                            id="address"
                            placeholder="Flat, House no., Building, Company, Apartment"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-gray-700 dark:text-slate-300">City</Label>
                            <Input
                                id="city"
                                placeholder="Mumbai"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state" className="text-gray-700 dark:text-slate-300">State</Label>
                            <Input
                                id="state"
                                placeholder="Maharashtra"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pinCode" className="text-gray-700 dark:text-slate-300">Pincode</Label>
                            <Input
                                id="pinCode"
                                placeholder="400001"
                                value={formData.pinCode}
                                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country" className="text-gray-700 dark:text-slate-300">Country</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isDefault: checked === true })
                            }
                            className="dark:border-slate-700"
                        />
                        <Label htmlFor="isDefault" className="text-sm font-medium leading-none text-gray-700 dark:text-slate-300">
                            Make this my default address
                        </Label>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isAdding || isUpdating} className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                            {isAdding || isUpdating ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </span>
                            ) : "Save Address"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
