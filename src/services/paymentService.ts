import { FirebaseService } from "./firebaseService";
import type { PaymentMethod, PaymentRecord, PaymentStatus } from "../types/payment";
import { OrderService } from "./orderService";
import type { Order } from "../types/order";

/**
 * Payment Service
 * Manages payment methods and payment verification lifecycle
 */
export const PaymentService = {
    /**
     * Payment Methods Management
     */
    async getPaymentMethods(): Promise<PaymentMethod[]> {
        return new Promise((resolve) => {
            FirebaseService.listen("paymentMethods", (data) => {
                const methods = Object.entries(data || {}).map(([id, val]) => ({
                    id,
                    ...(val as any)
                }));
                resolve(methods);
            });
        });
    },

    listenToPaymentMethods(callback: (methods: PaymentMethod[]) => void) {
        return FirebaseService.listen("paymentMethods", (data) => {
            const methods = Object.entries(data || {}).map(([id, val]) => ({
                id,
                ...(val as any)
            }));
            callback(methods);
        });
    },

    subscribeToPaymentMethods(callback: (methods: PaymentMethod[]) => void) {
        return this.listenToPaymentMethods(callback);
    },

    async savePaymentMethod(method: Partial<PaymentMethod>) {
        const id = method.id || `pm_${Date.now()}`;
        const data = {
            ...method,
            id,
            createdAt: method.createdAt || Date.now(),
            isEnabled: method.isEnabled !== undefined ? method.isEnabled : true
        };
        return FirebaseService.update(`paymentMethods/${id}`, data);
    },

    async deletePaymentMethod(id: string) {
        return FirebaseService.remove(`paymentMethods/${id}`);
    },

    /**
     * Payments Management
     */
    async submitPayment(payment: Omit<PaymentRecord, "id" | "status" | "createdAt" | "updatedAt">): Promise<PaymentRecord> {
        const id = `pay_${Date.now()}`;
        const data: PaymentRecord = {
            ...payment,
            id,
            status: "pending",
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        await FirebaseService.update(`payments/${id}`, data);
        return data;
    },

    listenToPayments(limit: number, callback: (payments: PaymentRecord[]) => void) {
        return FirebaseService.listenQuery("payments", limit, (data) => {
            const paymentsArray = Object.entries(data || {}).map(([id, val]) => ({
                id,
                ...(val as any)
            })).sort((a, b) => b.createdAt - a.createdAt);
            callback(paymentsArray);
        });
    },

    async updatePaymentStatus(paymentId: string, orderId: string, status: PaymentStatus) {
        const now = Date.now();
        await FirebaseService.update(`payments/${paymentId}`, {
            status,
            updatedAt: now
        });

        // If approved, mark the linked order as paid
        if (status === "approved") {
            await OrderService.updatePaymentStatus(orderId, "paid");
        }

        return true;
    },

    /**
     * Confirm an electronic payment (Initial Check):
     * - Marks the payment as approved and confirmed
     * - Marks the order as paid
     * - Sets matchStatus to pending_match
     * - DOES NOT move to reports or delete the order yet
     */
    async confirmPayment(payment: PaymentRecord, order: Order, _confirmedBy?: string) {
        const now = Date.now();

        // 1. Update Payment Record
        await FirebaseService.update(`payments/${payment.id}`, {
            status: "approved",
            isPaymentConfirmed: true,
            confirmedAt: now,
            matchStatus: "pending_match",
            updatedAt: now
        });

        // 2. Mark the order as paid
        await OrderService.updatePaymentStatus(order.id, "paid");

        return true;
    },

    /**
     * Delete All Payments (Daily Closing)
     */
    async deleteAllPayments() {
        try {
            await FirebaseService.remove("payments");
        } catch (error) {
            console.error("Error deleting payments:", error);
            throw error;
        }
    }
};
