import crypto from 'node:crypto';

export const ADMIN_ACCOUNTS = Object.freeze([
  {id:'admin-1',email:'admin.one@kenteglobal.example',role:'owner'},
  {id:'admin-2',email:'admin.two@kenteglobal.example',role:'operator'}
]);

export function hashPassword(password,salt=crypto.randomBytes(16).toString('hex')){
  const hash=crypto.scryptSync(password,salt,64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}
export function verifyPassword(password,encoded){
  if(!password||!encoded?.startsWith('scrypt:')) return false;
  const [,salt,stored]=encoded.split(':');
  const actual=crypto.scryptSync(password,salt,64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(stored,'hex'));
}
export function createAdminSession({adminId,now=Date.now(),ttlMs=30*60*1000}={}){return {id:crypto.randomUUID(),adminId,createdAt:now,expiresAt:now+ttlMs,lastSeenAt:now};}
export function isSessionValid(session,now=Date.now()){return Boolean(session?.adminId&&session.expiresAt>now);}
export function touchSession(session,now=Date.now(),ttlMs=30*60*1000){if(!isSessionValid(session,now)) return null;return {...session,lastSeenAt:now,expiresAt:now+ttlMs};}
export function createLoginGuard({windowMs=15*60*1000,maxAttempts=5}={}){const attempts=new Map();return {allow(key,now=Date.now()){const current=attempts.get(key)||{count:0,startedAt:now};if(now-current.startedAt>windowMs){attempts.set(key,{count:1,startedAt:now});return true;}if(current.count>=maxAttempts)return false;current.count+=1;attempts.set(key,current);return true;},reset(key){attempts.delete(key);},remaining(key,now=Date.now()){const current=attempts.get(key);if(!current||now-current.startedAt>windowMs)return maxAttempts;return Math.max(0,maxAttempts-current.count);}};}
export function appendAuditLog(log,{actorId,action,targetType,targetId,metadata={},at=new Date().toISOString(),ip='server'}={}){return [...log,{id:crypto.randomUUID(),actorId,action,targetType,targetId,metadata,at,ip}];}
