export const ADMIN_USERS=[{id:'admin-1',email:'admin.one@kenteglobal.example',name:'Administrator One',role:'Owner'},{id:'admin-2',email:'admin.two@kenteglobal.example',name:'Administrator Two',role:'Operations'}];
const KEY='kg-admin-session';
export const readAdminSession=()=>{try{const s=JSON.parse(sessionStorage.getItem(KEY));return s&&s.expiresAt>Date.now()?s:null}catch{return null}};
export const saveAdminSession=s=>sessionStorage.setItem(KEY,JSON.stringify(s));
export const clearAdminSession=()=>sessionStorage.removeItem(KEY);
export function authenticateDemo(email,password,otp){const user=ADMIN_USERS.find(x=>x.email===email);if(!user||password!=='KenteGlobal!2026'||otp!=='202604')return null;const s={...user,sessionId:`sess_${Date.now()}`,createdAt:Date.now(),expiresAt:Date.now()+30*60*1000,otpVerified:true};saveAdminSession(s);return s;}
