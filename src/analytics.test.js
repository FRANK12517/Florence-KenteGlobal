import { describe, expect, it } from 'vitest';
import { buildAnalytics } from './analytics.js';

describe('administrator dashboard analytics', () => {
  it('aggregates operational and sales metrics without exposing payment credentials', () => {
    const orders=[
      {id:'1',status:'Delivered',date:new Date().toISOString(),chargedTotal:100,currency:'USD',customer:{email:'a@example.com',country:'Ghana'},items:[{name:'Cloth',quantity:2}]},
      {id:'2',status:'Processing',date:new Date().toISOString(),chargedTotal:80,currency:'GHS',customer:{email:'b@example.com',country:'Nigeria'},items:[{name:'Jacket',quantity:1}]},
      {id:'3',status:'Cancelled',date:new Date().toISOString(),chargedTotal:20,currency:'USD',customer:{email:'c@example.com',country:'Ghana'},items:[]}
    ];
    const result=buildAnalytics({orders,products:[{stock:1,threshold:2},{stock:10,threshold:2}],customers:[]});
    expect(result.totalOrders).toBe(3);
    expect(result.deliveredOrders).toBe(1);
    expect(result.processingOrders).toBe(1);
    expect(result.lowStock).toBe(1);
    expect(result.customerCount).toBe(3);
    expect(result.topProducts[0]).toEqual(['Cloth',2]);
    expect(result.countrySales.Ghana).toBe(100);
    expect(result.currencySales.GHS).toBe(80);
    expect(JSON.stringify(result)).not.toContain('password');
  });
});
