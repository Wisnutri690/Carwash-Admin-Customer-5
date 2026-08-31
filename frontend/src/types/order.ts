import type { Customer } from "./customer";
import type { Vehicle } from "./vehicle";
import type { Staff } from "./staff";
import type { Service } from "./service";

export type OrderStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID";
export type PaymentMethod = "CASH" | "QRIS" | "TRANSFER";

export interface OrderItem {
    id: string | number;
    orderId: string | number;
    serviceId: string | number;
    quantity: number;
    price: number;
    subtotal: number;
    service: Service;
}

export interface Order {
    id: string | number;
    customerId: string | number;
    customer: Customer;
    vehicleId: string | number;
    vehicle: Vehicle;
    adminId?: string | number;
    staffId: string | number;
    staff: Staff;
    orderItems: OrderItem[];
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    totalPrice: number;
    notes?: string;
    checkInTime: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderPayload {
    customerId: number | string;
    vehicleId: number | string;
    staffId: number | string;
    services: {
        serviceId: number;
        quantity?: number;
    }[];
    notes?: string;
}

export interface UpdateOrderStatusPayload {
    status: OrderStatus;
}

export interface UpdateOrderPaymentPayload {
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
}

export interface OrderResponse {
    success: boolean;
    message: string;
    data: Order[];
}

export interface SingleOrderResponse {
    success: boolean;
    message: string;
    data: Order;
}

export interface QueueInfo {
  orderId: number | string;
  status: OrderStatus;
  queuePosition: number;
  ahead: number;
  estimatedMinutes: number;
}

export interface CustomerCreateOrderPayload {
  vehicleId: number;
  services: {
    serviceId: number;
    quantity?: number;
  }[];
  notes?: string;
}

