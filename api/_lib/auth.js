const crypto=require('crypto');
function session(req){const c=Object.fromEntries(String(req.headers.cookie||'').split(';').map(v=>v.trim().split('=')).filter(v=>v.length===2));const raw=c.forged_dragon_session;if(!raw||!process.env.AUTH_SECRET)return null;const [p,s]=raw.split('.');const expected=crypto.createHmac('sha256',process.env.AUTH_SECRET).update(p||'').digest('base64url');if(!p||!s||s.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(expected)))return null;try{const data=JSON.parse(Buffer.from(p,'base64url').toString());return data.exp>Date.now()?data:null}catch{return null}}
const hashEmail=email=>crypto.createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex');
module.exports={session,hashEmail};
