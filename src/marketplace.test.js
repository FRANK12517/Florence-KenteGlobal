import { describe, expect, it } from 'vitest';
import { CURRENT_OWNER, assertCurrentMarketplaceBoundary, createOrganization, normalizeProductOwnership, productAttribution } from './marketplace.js';

describe('future marketplace extensibility boundaries', () => {
  it('keeps legacy KenteGlobal-owned products valid without seller records', () => {
    const product=normalizeProductOwnership({id:'p1',name:'Legacy cloth',brand:'KenteGlobal'});
    expect(product.ownership).toMatchObject({ownerId:'kenteglobal',ownerType:'brand',organizationId:null});
    expect(productAttribution(product).organization).toEqual(CURRENT_OWNER);
  });
  it('supports future verified organization types without exposing marketplace behavior', () => {
    const artisan=createOrganization({name:'Future Artisan',kind:'artisan',country:'Ghana',region:'Ashanti',verified:true,status:'verified'});
    const product=normalizeProductOwnership({id:'p2',ownership:{ownerId:artisan.id,ownerType:'artisan',organizationId:artisan.id}});
    expect(productAttribution(product,[artisan]).organization).toEqual(artisan);
    expect(assertCurrentMarketplaceBoundary()).toBe(true);
  });
  it('rejects seller-facing functionality in the current release boundary', () => {
    expect(()=>assertCurrentMarketplaceBoundary({sellerRegistration:true})).toThrow(/disabled/i);
    expect(()=>assertCurrentMarketplaceBoundary({sellerDashboard:true})).toThrow(/disabled/i);
    expect(()=>assertCurrentMarketplaceBoundary({commission:true})).toThrow(/disabled/i);
    expect(()=>assertCurrentMarketplaceBoundary({payout:true})).toThrow(/disabled/i);
  });
});
