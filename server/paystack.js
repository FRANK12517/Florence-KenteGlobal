import crypto from 'node:crypto';
import { SUPPORTED_CURRENCIES } from '../src/currencies.js';

export const PAYMENT_STATES = Object.freeze(['Pending','Processing','Paid','Failed','Cancelled','Refunded','Partially Refunded']);
export const PAYSTACK_STATUSES = Object.freeze({ success:'Paid', failed:'Failed', abandoned:'Cancelled', reversed:'Refunded', pending:'Pending', ongoing:'Processing', processing:'Processing', queued:'Processing' });

export function assertSupportedCurrency(currency){
  if(!SUPPORTED_CURRENCIES[currency]) throw new Error(`Unsupported currency: ${currency}`);
  return currency;
}

export function toMinorUnits(amount, currency){
  assertSupportedCurrency(currency);
  return Math.round(Number(amount) * SUPPORTED_CURRENCIES[currency].minorUnit);
}

export function verifyPaystackSignature(rawBody, signature, secret){
  if(!rawBody || !signature || !secret) return false;
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  const actual = Buffer.from(String(signature));
  const digest = Buffer.from(expected);
  return actual.length === digest.length && crypto.timingSafeEqual(actual, digest);
}

export function createPaymentRecord({orderId,orderNumber,amount,currency,email}){
  assertSupportedCurrency(currency);
  const reference = `kg_${orderNumber}_${crypto.randomBytes(8).toString('hex')}`;
  return {id:crypto.randomUUID(),orderId,orderNumber,reference,amount:toMinorUnits(amount,currency),displayAmount:Number(amount),currency,email,status:'Pending',createdAt:new Date().toISOString(),processedEvents:[]};
}

export function verifyTransaction({payment,order,transaction}){
  if(!payment || !order || !transaction) return {ok:false,reason:'Missing payment, order, or transaction'};
  const expectedAmount = Number(payment.amount);
  const receivedAmount = Number(transaction.amount);
  if(transaction.reference !== payment.reference) return {ok:false,reason:'Payment reference mismatch'};
  if(receivedAmount !== expectedAmount) return {ok:false,reason:'Payment amount mismatch'};
  if(String(transaction.currency).toUpperCase() !== String(payment.currency).toUpperCase()) return {ok:false,reason:'Payment currency mismatch'};
  const mapped = PAYSTACK_STATUSES[transaction.status];
  if(!mapped) return {ok:false,reason:`Unsupported Paystack status: ${transaction.status}`};
  return {ok:true,status:mapped,paid:mapped==='Paid',paymentMethod:transaction.channel||transaction.authorization?.channel||'unknown',paidAt:transaction.paid_at||null};
}

export function processWebhookEvent({event, paymentStore, orderStore, inventoryStore}){
  if(!event?.data?.reference) return {ok:false,ignored:true,reason:'Missing event reference'};
  const reference = event.data.reference;
  const payment = paymentStore.get(reference);
  if(!payment) return {ok:false,ignored:true,reason:'Unknown payment reference'};
  if(payment.processedEvents.includes(event.id||event.data.id||event.event)) return {ok:true,duplicate:true,status:payment.status};
  const order = orderStore.get(payment.orderId);
  const result = verifyTransaction({payment,order,transaction:event.data});
  payment.processedEvents.push(event.id||event.data.id||event.event||crypto.randomUUID());
  if(!result.ok){payment.status='Failed';payment.failureReason=result.reason;return {ok:false,reason:result.reason,status:payment.status};}
  payment.status=result.status;payment.paymentMethod=result.paymentMethod;payment.paidAt=result.paidAt;
  if(result.paid && !payment.inventoryApplied){ inventoryStore.apply(payment.orderId); payment.inventoryApplied=true; order.status='Paid'; }
  if(!result.paid && order.status==='Pending') order.status=result.status;
  return {ok:true,duplicate:false,status:payment.status};
}

export async function initializePaystackTransaction({amount,currency,email,reference,callbackUrl,metadata,secret=process.env.PAYSTACK_SECRET_KEY}){
  assertSupportedCurrency(currency);
  if(!secret) throw new Error('PAYSTACK_SECRET_KEY is not configured on the server');
  const response = await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({amount:toMinorUnits(amount,currency),currency,email,reference,callback_url:callbackUrl,metadata})});
  const payload = await response.json();
  if(!response.ok || !payload.status) throw new Error(payload.message||'Paystack transaction initialization failed');
  return payload.data;
}
