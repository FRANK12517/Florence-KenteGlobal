import { describe, expect, it } from 'vitest';
import { DEFAULT_SHIPPING_RULES, calculateShipping, canTransition, createTrackingEvent, transitionOrder } from './orderDomain.js';

describe('KenteGlobal order lifecycle and shipping', () => {
  it('persists the complete purchase-to-delivery lifecycle', () => {
    let order = {id:'KTG-2026-000001',status:'Pending',timeline:[]};
    for (const status of ['Payment Pending','Paid','Processing','Packed','Dispatched','In Transit','Out for Delivery','Delivered']) {
      expect(canTransition(order.status,status)).toBe(true);
      order = transitionOrder(order,status);
    }
    expect(order.status).toBe('Delivered');
    expect(order.timeline.map(x=>x.status)).toEqual(['Payment Pending','Paid','Processing','Packed','Dispatched','In Transit','Out for Delivery','Delivered']);
  });

  it('rejects invalid lifecycle jumps', () => {
    expect(canTransition('Pending','Delivered')).toBe(false);
    expect(() => transitionOrder({status:'Pending',timeline:[]},'Delivered')).toThrow('Invalid order transition');
  });

  it('selects destination-aware shipping rules and supports tracking events', () => {
    const ghana = calculateShipping({country:'Ghana',region:'Ashanti',weight:1,orderValue:100,deliveryMethod:'Standard',rules:DEFAULT_SHIPPING_RULES});
    const overseas = calculateShipping({country:'Japan',region:'Tokyo',weight:1,orderValue:100,deliveryMethod:'Standard',rules:DEFAULT_SHIPPING_RULES});
    expect(ghana.name).toBe('Ghana Standard');
    expect(overseas.name).toBe('International Standard');
    expect(createTrackingEvent({status:'In Transit',location:'Accra',note:'Handed to courier'})).toMatchObject({status:'In Transit',location:'Accra'});
  });
});
