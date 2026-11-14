/** Check deploy versions without disturbing an offline page or creating reload loops. */
export function installPageUpdates(versionUrl, buildId, env=globalThis) {
  if (!/^[a-f0-9]{20}$/.test(buildId)) return {check:async()=>{},dispose:()=>{}};
  let pending=false, lastCheck=0, reloading=false;
  const key='page-update:'+new URL(versionUrl,env.location.href).pathname;
  async function check(force=false) {
    if(pending||reloading||env.document.hidden||env.navigator?.onLine===false||(!force&&Date.now()-lastCheck<20000))return;
    pending=true;lastCheck=Date.now();
    try {
      const url=new URL(versionUrl,env.location.href);url.searchParams.set('_check',String(Date.now()));
      const response=await env.fetch(url.href,{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(8000)});
      if(!response.ok)return;
      const data=await response.json();
      if(!/^[a-f0-9]{20}$/.test(data?.version)||data.version===buildId)return;
      try{if(env.sessionStorage.getItem(key)===data.version)return;env.sessionStorage.setItem(key,data.version);}catch{}
      const next=new URL(env.location.href);next.searchParams.set('_release',data.version);
      reloading=true;env.location.replace(next.href);
    }catch{}finally{pending=false;}
  }
  const visible=()=>{if(!env.document.hidden)void check(true);};
  const restored=e=>{if(e.persisted)void check(true);};
  const activated=()=>{void check(true);};
  env.document.addEventListener('visibilitychange',visible);
  env.addEventListener('pageshow',restored);env.addEventListener('online',activated);
  const interval=env.setInterval(()=>void check(),60000);
  const initial=env.setTimeout(()=>void check(true),1500);
  return {check,dispose(){env.clearInterval(interval);env.clearTimeout(initial);env.document.removeEventListener('visibilitychange',visible);env.removeEventListener('pageshow',restored);env.removeEventListener('online',activated);}};
}
