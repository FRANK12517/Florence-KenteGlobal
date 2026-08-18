import { describe, expect, it } from 'vitest';
import { ONLINE_REQUIRED_MESSAGES, createNotificationEvent, markNotificationAttempt } from './notifications.js';

describe('customer notification architecture', () => {
  it('creates provider-neutral events with supported channels only', () => {
    const event=createNotificationEvent({event:'order.confirmation',customerId:'c1',orderId:'o1',channels:['email','sms','carrier-pigeon']});
    expect(event.channels).toEqual(['email','sms']);
    expect(event.status).toBe('queued');
  });
  it('tracks delivery attempts without pretending to send messages', () => {
    const event=createNotificationEvent({event:'payment.failed',customerId:'c1',channels:['email']});
    const attempted=markNotificationAttempt(event,{channel:'email',status:'failed',error:'Provider not configured'});
    expect(attempted.status).toBe('failed');
    expect(attempted.deliveryAttempts[0].error).toBe('Provider not configured');
  });
  it('communicates that payment and checkout require connectivity', () => {
    expect(ONLINE_REQUIRED_MESSAGES.payment).toMatch(/internet connection/i);
    expect(ONLINE_REQUIRED_MESSAGES.checkout).toMatch(/internet connection/i);
  });
});
