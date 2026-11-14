export const FLIGHT15='starship-flight-15';
export function normalizeLaunch(x){
 if(!x||!x.id||!x.name||!Number.isFinite(Date.parse(x.net)))return null;
 if(x.launch_service_provider?.id!==121)return null;
 const special=/starship.*flight\s*15/i.test(x.name),r=x.rocket||{},stages=r.launcher_stage||[];
 const booster=stages.map(s=>s.launcher).filter(s=>s&&!s.is_placeholder).map(s=>s.serial_number).filter(Boolean).join(' / ');
 const pad=x.pad||{},lat=pad.latitude==null||pad.latitude===''?NaN:Number(pad.latitude),lon=pad.longitude==null||pad.longitude===''?NaN:Number(pad.longitude);
 return {id:special?FLIGHT15:x.id,name:special?'Starship · Flight 15':x.name.replace(' | ',' · '),net:x.net,status:x.status?.id??2,rocket:r.configuration?.full_name||x.name.split(' | ')[0],pad:pad.name||'',lat:Number.isFinite(lat)&&Math.abs(lat)<=90?lat:null,lon:Number.isFinite(lon)&&Math.abs(lon)<=180?lon:null,payload:special?'Ship 42':x.mission?.name||x.name.split(' | ').slice(1).join(' | ')||x.name,booster:special?'Booster 22':booster,vehicle:special?'ship42':null,boosterVehicle:null};
}
export function validSample(s){return !!s&&Number.isFinite(s.lat)&&Math.abs(s.lat)<=90&&Number.isFinite(s.lon)&&Math.abs(s.lon)<=180&&Number.isFinite(s.alt)&&s.alt>=0&&s.alt<100000000&&Number.isFinite(s.wall);}
export function mergeHistory(existing,incoming,vehicle,start,end=Date.now()/1000+60){const map=new Map();for(const s of [...existing,...incoming])if(s?.veh===vehicle&&validSample(s)&&s.wall>=start&&s.wall<=end){const key=Math.round((s.gps??s.wall)*10);map.set(key,s);}return [...map.values()].sort((a,b)=>a.wall-b.wall).slice(-15000);}
export function splitTrack(rows,maxGap=600){const groups=[];let part=[];for(const s of rows){const prev=part.at(-1);if(prev&&(s.wall-prev.wall>maxGap||s.wall<=prev.wall)){if(part.length>1)groups.push(part);part=[];}part.push(s);}if(part.length>1)groups.push(part);return groups;}
export function statusKey(id){return ({1:'planned',2:'tbc',3:'success',4:'failure',5:'hold',6:'inFlight',7:'partial',8:'tbc',9:'inFlight'})[id]||'tbc';}
// WGS84 Earth-fixed Cartesian coordinates, in metres. Includes changes in altitude.
export function earthFixedPosition(s){if(!validSample(s))return null;const lat=s.lat*Math.PI/180,lon=s.lon*Math.PI/180,a=6378137,e2=6.69437999014e-3,n=a/Math.sqrt(1-e2*Math.sin(lat)**2);return [(n+s.alt)*Math.cos(lat)*Math.cos(lon),(n+s.alt)*Math.cos(lat)*Math.sin(lon),(n*(1-e2)+s.alt)*Math.sin(lat)];}
export function calculatedSpeed(current,rows){if(!validSample(current))return null;const candidates=rows.filter(s=>s.veh===current.veh&&validSample(s)&&s.wall<current.wall).sort((a,b)=>b.wall-a.wall);for(const prev of candidates){const gps=Number.isFinite(current.gps)&&Number.isFinite(prev.gps),dt=gps?current.gps-prev.gps:current.wall-prev.wall;if(dt<5)continue;if(dt>120)continue;const a=earthFixedPosition(current),b=earthFixedPosition(prev),kmh=Math.hypot(...a.map((n,i)=>n-b[i]))/dt*3.6;if(!Number.isFinite(kmh)||kmh>50000)return null;return {kmh,seconds:dt,reference:'earth-fixed'};}return null;}
export function decodeHistoryChunk(f){if(f?.history_ok!==true||!f.chunk||!Array.isArray(f.gps)||typeof f.veh!=='string')return [];return f.gps.map((gps,i)=>Object.fromEntries([['veh',f.veh],...['gps','wall','alt','lat','lon','spd'].map(k=>[k,Array.isArray(f[k])?f[k][i]:null])])).filter(validSample);}
// Before staging, Ship and Booster share the same trajectory. Stop conservatively at T+130 s.
export function sharedBoosterAscent(rows,start){return rows.filter(s=>validSample(s)&&s.veh==='ship42'&&s.wall>=start&&s.wall<=start+130).map(s=>({...s,veh:'booster22',provenance:'shared-ascent'}));}
// Only explicitly connected sources may supply measured trajectories.
export const TRAJECTORY_SOURCES=Object.freeze({[FLIGHT15]:Object.freeze({vehicle:'ship42'})});
export function trackableMissions(missions){return (Array.isArray(missions)?missions:[]).filter(m=>m&&TRAJECTORY_SOURCES[m.id]?.vehicle===m.vehicle&&typeof m.vehicle==='string');}
export function trackedMissionSelection(missions,selected,fallback){const supported=trackableMissions(missions);return supported.find(m=>m.id===selected)||supported[0]||trackableMissions(fallback)[0]||null;}
// Keep connected missions and the next five scheduled launches as catalogue previews.
export function selectableMissions(missions,now=Date.now()){
 const unique=[...new Map((Array.isArray(missions)?missions:[]).filter(m=>m?.id).map(m=>[m.id,m])).values()];
 const upcoming=unique.filter(m=>[1,2,5,8].includes(m.status)&&Date.parse(m.net)>now).sort((a,b)=>Date.parse(a.net)-Date.parse(b.net)).slice(0,5);
 return [...new Map([...trackableMissions(unique),...upcoming].map(m=>[m.id,m])).values()];
}
