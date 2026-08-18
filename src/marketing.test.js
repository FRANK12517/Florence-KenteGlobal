import { describe, expect, it } from 'vitest';
import { culturalSearch, createGiftCard, recommend, redeemGiftCard, recordReferral, validateDiscount } from './marketing.js';

describe('marketing and cultural commerce primitives', () => {
  const products=[
    {id:'p1',name:'Leadership Cloth',status:'Published',stock:4,category:'Kente Cloth',region:'Ashanti',meaning:'leadership and unity',featured:true},
    {id:'p2',name:'Archived Cloth',status:'Archived',stock:4,meaning:'leadership'},
    {id:'p3',name:'Sold Out Unity',status:'Published',stock:0,meaning:'unity'}
  ];
  it('validates percentage discounts and enforces minimum order value', () => {
    const code={code:'TEN',active:true,type:'percentage',value:10,minOrderValue:50,maxDiscount:20,startsAt:'2026-01-01',endsAt:'2026-12-31',used:0};
    expect(validateDiscount(code,{subtotal:100}).amount).toBe(10);
    expect(validateDiscount(code,{subtotal:10}).valid).toBe(false);
  });
  it('creates and redeems gift cards with usage history', () => {
    const card=createGiftCard({value:100});
    const result=redeemGiftCard(card,40,'order-1');
    expect(result.ok).toBe(true); expect(result.card.balance).toBe(60); expect(result.card.usageHistory).toHaveLength(1);
  });
  it('connects cultural search and recommendations without recommending unavailable products', () => {
    expect(culturalSearch(products,'unity').map(p=>p.id)).toEqual(['p1','p3']);
    expect(recommend(products,{currentId:'p1'}).map(p=>p.id)).toEqual([]);
  });
  it('records referral qualification without inventing a reward outcome', () => {
    const referral={code:'KGREF',referrerId:'customer-1',uses:[]};
    const next=recordReferral(referral,'customer-2','order-1',{points:250});
    expect(next.uses[0]).toMatchObject({referredCustomerId:'customer-2',qualifyingPurchase:true});
  });
});
