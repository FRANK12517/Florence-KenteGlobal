export const ORDER_STATES = Object.freeze(['Pending','Payment Pending','Paid','Processing','Packed','Dispatched','In Transit','Out for Delivery','Delivered','Cancelled','Returned','Refunded']);

const transitions = {
  Pending:['Payment Pending','Cancelled'],
  'Payment Pending':['Paid','Cancelled'],
  Paid:['Processing','Cancelled','Refunded'],
  Processing:['Packed','Cancelled'],
  Packed:['Dispatched'],
  Dispatched:['In Transit'],
  'In Transit':['Out for Delivery','Delivered'],
  'Out for Delivery':['Delivered'],
  Delivered:['Returned','Refunded'],
  Cancelled:[], Returned:['Refunded'], Refunded:[]
};

export const DEFAULT_SHIPPING_RULES = Object.freeze([
  {id:'ghana-standard',name:'Ghana Standard',country:'Ghana',region:'Any',deliveryMethod:'Standard',minWeight:0,maxWeight:5,minOrderValue:0,charge:18,currency:'USD',estimatedDays:'3–7 business days',active:true},
  {id:'international-standard',name:'International Standard',country:'Any',region:'Any',deliveryMethod:'Standard',minWeight:0,maxWeight:5,minOrderValue:0,charge:35,currency:'USD',estimatedDays:'7–21 business days',active:true}
]);

export function canTransition(from,to){ return from===to || Boolean(transitions[from]?.includes(to)); }
export function transitionOrder(order,to,at=new Date().toISOString()){
  if(!canTransition(order.status,to)) throw new Error(`Invalid order transition: ${order.status} → ${to}`);
  if(order.status===to) return order;
  const timeline=[...(order.timeline||[]),{status:to,at}];
  return {...order,status:to,deliveryStatus:to,timeline};
}
export function createTrackingEvent({status,location='',note='',at=new Date().toISOString()}){ return {id:`trk_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,status,location,note,at}; }
export function calculateShipping({country='Any',region='Any',weight=0,orderValue=0,deliveryMethod='Standard',productId, rules=DEFAULT_SHIPPING_RULES}){
  const matches=rules.filter(r=>r.active && (r.country==='Any'||r.country===country) && (r.region==='Any'||r.region===region) && (r.deliveryMethod===deliveryMethod) && weight>=r.minWeight && weight<=r.maxWeight && orderValue>=r.minOrderValue && (!r.productId||r.productId===productId));
  return matches.sort((a,b)=>(a.country==='Any')-(b.country==='Any'))[0] || {id:'fallback',name:'Manual shipping quote',charge:0,currency:'USD',estimatedDays:'To be confirmed',deliveryMethod};
}

export function createCourierAdapter({name,createLabel,track}){ return {name,createLabel,track}; }
