export interface PaymentField {
    id: string;
    label: string;
    value: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    type: "cash" | "bank" | "wallet";
    image?: string; // Kept as image to match existing logic, but UI will refer to it as image
    imageUrl?: string; // Added as requested

    paymentFields: PaymentField[];

    isEnabled: boolean;
    showPaymentDetails: boolean;

    // Deprecated
    details?: string;
    fields?: PaymentField[]; // Compatibility with old 'fields' name
    order?: number;
    createdAt?: number;
}

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface PaymentRecord {
    id: string;
    orderId: string;
    methodId: string;
    methodName: string;
    customerName: string;
    senderAccountName?: string | null;
    senderAccountNumber?: string | null;
    receiverAccountName?: string | null;
    receiverAccountNumber?: string | null;
    senderBankOrWallet?: string | null;
    notes?: string;
    amount: number;
    status: PaymentStatus;
    createdAt: number;
    updatedAt: number;
    receiptUrl?: string;
    
    /** Approval */
    approvedAt?: number;
}
