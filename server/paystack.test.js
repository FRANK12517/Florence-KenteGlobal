import { describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import { createPaymentRecord, processWebhookEvent, verifyPaystackSignature, verifyTransaction } from './paystack.js';

describe('Paystack payment integrity', () => {
  it('validates the HMAC-SHA512 webhook signature and rejects tampering', () => {
    const body = JSON.stringify({ event:'charge.success', data:{reference:'ref_1'} });
    const secret = 'test-secret';
    const signature = crypto.createHmac('sha512', secret).update(body).digest('hex');
    expect(verifyPaystackSignature(body, signature, secret)).toBe(true);
    expect(verifyPaystackSignature(`${body}x`, signature, secret)).toBe(false);
  });

  it('accepts a matching successful transaction and rejects wrong amount or currency', () => {
    const payment = {reference:'ref_2', amount:19000, currency:'USD'};
    const order = {id:'order_2'};
    expect(verifyTransaction({payment,order,transaction:{reference:'ref_2',amount:19000,currency:'USD',status:'success'}}).paid).toBe(true);
    expect(verifyTransaction({payment,order,transaction:{reference:'ref_2',amount:19001,currency:'USD',status:'success'}}).reason).toContain('amount');
    expect(verifyTransaction({payment,order,transaction:{reference:'ref_2',amount:19000,currency:'GHS',status:'success'}}).reason).toContain('currency');
  });

  it('deduplicates webhook events and applies inventory only once', () => {
    const payment = createPaymentRecord({orderId:'order_3',orderNumber:'KTG-2026-000003',amount:190,currency:'USD',email:'buyer@example.com'});
    const payments = new Map([[payment.reference,payment]]);
    const order = {id:'order_3',status:'Pending'};
    const orders = new Map([[order.id,order]]);
    let inventoryApplications = 0;
    const inventory = {apply:()=>{inventoryApplications += 1;}};
    const event = {id:'evt_3',event:'charge.success',data:{reference:payment.reference,amount:19000,currency:'USD',status:'success',channel:'card'}};
    expect(processWebhookEvent({event,paymentStore:payments,orderStore:orders,inventoryStore:inventory})).toMatchObject({ok:true,status:'Paid'});
    expect(processWebhookEvent({event,paymentStore:payments,orderStore:orders,inventoryStore:inventory})).toMatchObject({ok:true,duplicate:true});
    expect(inventoryApplications).toBe(1);
    expect(order.status).toBe('Paid');
  });

  it('marks failed transactions as failed without reducing inventory', () => {
    const payment = createPaymentRecord({orderId:'order_4',orderNumber:'KTG-2026-000004',amount:50,currency:'USD',email:'buyer@example.com'});
    const payments = new Map([[payment.reference,payment]]);
    const order = {id:'order_4',status:'Pending'};
    const orders = new Map([[order.id,order]]);
    let inventoryApplications = 0;
    const event = {id:'evt_4',event:'charge.failed',data:{reference:payment.reference,amount:5000,currency:'USD',status:'failed'}};
    const result = processWebhookEvent({event,paymentStore:payments,orderStore:orders,inventoryStore:{apply:()=>{inventoryApplications += 1;}}});
    expect(result).toMatchObject({ok:true,status:'Failed'});
    expect(inventoryApplications).toBe(0);
    expect(order.status).toBe('Failed');
  });
});
