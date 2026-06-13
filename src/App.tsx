import { useState, useRef } from 'react';
import { Image, Lock, Unlock, Eye, EyeOff, Plus, Trash2, Download, FolderPlus, X, Check } from 'lucide-react';

interface Photo { id:string; name:string; data:string; albumId:string; createdAt:number; }
interface Album { id:string; name:string; createdAt:number; }

const SAVE_P='pv_photos_v1'; const SAVE_A='pv_albums_v1';
const loadP=():Photo[]=>{ try{return JSON.parse(localStorage.getItem(SAVE_P)||'[]')}catch{return []} };
const loadA=():Album[]=>{ try{return JSON.parse(localStorage.getItem(SAVE_A)||'[{"id":"default","name":"My Photos","createdAt":0}]')}catch{return [{id:"default",name:"My Photos",createdAt:0}]} };

export default function App() {
  const [locked,setLocked]=useState(true);
  const [input,setInput]=useState('');
  const [confirm,setConfirm]=useState('');
  const [showPwd,setShowPwd]=useState(false);
  const [isNew,setIsNew]=useState(!localStorage.getItem('pv_hash'));
  const [error,setError]=useState('');
  const [photos,setPhotos]=useState<Photo[]>([]);
  const [albums,setAlbums]=useState<Album[]>([]);
  const [selectedAlbum,setSelAlbum]=useState('default');
  const [lightbox,setLightbox]=useState<Photo|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);

  const unlock=async(e:React.FormEvent)=>{
    e.preventDefault(); setError('');
    const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input+'pv_salt_v1'));
    const h=Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    if(isNew){
      if(input.length<4){setError('Min 4 characters');return;}
      if(input!==confirm){setError("Passwords don't match");return;}
      localStorage.setItem('pv_hash',h);
      setPhotos(loadP()); setAlbums(loadA());
      setIsNew(false); setLocked(false);
    } else {
      if(h!==localStorage.getItem('pv_hash')){setError('Wrong password');setInput('');return;}
      setPhotos(loadP()); setAlbums(loadA()); setLocked(false);
    }
  };

  const savePhotos=(items:Photo[])=>{setPhotos(items);localStorage.setItem(SAVE_P,JSON.stringify(items));};
  const saveAlbums=(items:Album[])=>{setAlbums(items);localStorage.setItem(SAVE_A,JSON.stringify(items));};

  const addPhotos=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const files=e.target.files; if(!files)return;
    Array.from(files).forEach(file=>{
      const reader=new FileReader();
      reader.onload=ev=>{
        if(!ev.target?.result)return;
        savePhotos([{id:crypto.randomUUID(),name:file.name,data:ev.target.result as string,albumId:selectedAlbum,createdAt:Date.now()},...photos]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value='';
  };

  const filtered=photos.filter(p=>p.albumId===selectedAlbum);

  if(locked) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',background:'radial-gradient(ellipse at 50% 0%, #1a0820 0%, #080808 60%)'}}>
      <div style={{width:'100%',maxWidth:'380px'}}>
        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <div style={{width:'76px',height:'76px',borderRadius:'22px',background:'linear-gradient(135deg,#ec4899,#be185d)',boxShadow:'0 16px 48px #ec489940',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}><Image size={34} color="white"/></div>
          <h1 style={{fontFamily:'Inter',fontSize:'28px',fontWeight:'700',color:'white',marginBottom:'6px'}}>PhotoVault</h1>
          <p style={{color:'#831843',fontSize:'14px'}}>{isNew?'Create a PIN to lock your photos':'Enter PIN to view your private photos'}</p>
        </div>
        <form onSubmit={unlock} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <div style={{position:'relative'}}>
            <input type={showPwd?'text':'password'} value={input} onChange={e=>setInput(e.target.value)} placeholder={isNew?'Create PIN/password':'Enter PIN/password'} style={{width:'100%',background:'#180810',border:'1px solid #831843',borderRadius:'12px',padding:'13px 44px 13px 16px',color:'white',fontSize:'14px',outline:'none',fontFamily:'Inter',transition:'border-color 0.2s'}} autoFocus onFocus={e=>e.target.style.borderColor='#ec4899'} onBlur={e=>e.target.style.borderColor='#831843'}/>
            <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#831843'}}>{showPwd?<EyeOff size={16}/>:<Eye size={16}/>}</button>
          </div>
          {isNew&&<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm" style={{width:'100%',background:'#180810',border:'1px solid #831843',borderRadius:'12px',padding:'13px 16px',color:'white',fontSize:'14px',outline:'none',fontFamily:'Inter'}} onFocus={e=>e.target.style.borderColor='#ec4899'} onBlur={e=>e.target.style.borderColor='#831843'}/>}
          {error&&<p style={{color:'#ef4444',fontSize:'13px',textAlign:'center'}}>{error}</p>}
          <button type="submit" style={{background:'#ec4899',color:'white',border:'none',borderRadius:'12px',padding:'14px',fontSize:'15px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 8px 24px #ec489940'}}>{isNew?'Create Vault':'Unlock'}</button>
        </form>
        <div style={{display:'flex',justifyContent:'center',gap:'20px',marginTop:'32px'}}>
          {[['🔐','PIN protected'],['💾','Local only'],['🚫','No cloud']].map(([i,l])=>(
            <span key={l} style={{display:'flex',alignItems:'center',gap:'5px',color:'#831843',fontSize:'11px'}}>{i} {l}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#080808',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:'1px solid #1a0820',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#ec4899,#be185d)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px #ec489930'}}><Image size={16} color="white"/></div>
          <div><div style={{fontWeight:'700',fontSize:'16px',color:'white',lineHeight:1}}>PhotoVault</div>
          <div style={{fontSize:'11px',color:'#831843',marginTop:'2px'}}>{photos.length} private photo{photos.length!==1?'s':''}</div></div>
        </div>
        <div style={{display:'flex',gap:'4px'}}>
          <button onClick={()=>{const n=prompt('Album name:');if(n?.trim()){const a={id:crypto.randomUUID(),name:n.trim(),createdAt:Date.now()};saveAlbums([...albums,a]);setSelAlbum(a.id);}}} style={{padding:'7px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',color:'#831843'}} title="New album"><FolderPlus size={15}/></button>
          <button onClick={()=>fileRef.current?.click()} style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 14px',borderRadius:'9px',background:'#ec4899',border:'none',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 4px 12px #ec489930'}}>
            <Plus size={13}/> Add
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={addPhotos}/>
          <button onClick={()=>{setLocked(true);setPhotos([]);setAlbums([]);setInput('');}} style={{padding:'7px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',color:'#831843'}} title="Lock"><Lock size={15}/></button>
        </div>
      </header>
      {/* Albums */}
      <div style={{display:'flex',gap:'6px',overflowX:'auto',padding:'10px 20px',borderBottom:'1px solid #1a0820'}}>
        {albums.map(a=>(
          <button key={a.id} onClick={()=>setSelAlbum(a.id)} style={{flexShrink:0,padding:'5px 12px',borderRadius:'20px',border:`1px solid ${selectedAlbum===a.id?'#ec4899':'#1a0820'}`,background:selectedAlbum===a.id?'#ec489915':'transparent',color:selectedAlbum===a.id?'#f9a8d4':'#831843',fontSize:'12px',cursor:'pointer',fontFamily:'Inter',whiteSpace:'nowrap'}}>
            {a.name} ({photos.filter(p=>p.albumId===a.id).length})
          </button>
        ))}
      </div>
      {/* Grid */}
      <div style={{flex:1,overflow:'auto',padding:'12px 20px'}}>
        {filtered.length===0?(
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'52px',marginBottom:'16px'}}>🖼️</div>
            <h3 style={{fontSize:'20px',fontWeight:'700',color:'white',marginBottom:'8px'}}>No photos yet</h3>
            <p style={{color:'#831843',fontSize:'14px',marginBottom:'24px',lineHeight:'1.6',maxWidth:'240px',margin:'0 auto 24px'}}>Add photos to this vault. They'll be hidden from your regular gallery.</p>
            <button onClick={()=>fileRef.current?.click()} style={{padding:'12px 24px',borderRadius:'10px',background:'#ec4899',border:'none',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 4px 16px #ec489930'}}>Add photos</button>
          </div>
        ):(
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'3px'}}>
            {filtered.map(photo=>(
              <div key={photo.id} style={{aspectRatio:'1',position:'relative',overflow:'hidden',borderRadius:'4px',cursor:'pointer'}} onClick={()=>setLightbox(photo)}>
                <img src={photo.data} alt={photo.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.2s'}} onMouseEnter={e=>(e.target as HTMLImageElement).style.transform='scale(1.05)'} onMouseLeave={e=>(e.target as HTMLImageElement).style.transform='scale(1)'}/>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Lightbox */}
      {lightbox&&<div style={{position:'fixed',inset:0,background:'#000000f0',zIndex:50,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} onClick={()=>setLightbox(null)}>
        <div style={{position:'absolute',top:'16px',right:'16px',display:'flex',gap:'8px'}} onClick={e=>e.stopPropagation()}>
          <button onClick={()=>{const a=document.createElement('a');a.href=lightbox.data;a.download=lightbox.name;a.click();}} style={{padding:'8px',borderRadius:'8px',background:'#ffffff20',border:'none',cursor:'pointer',color:'white'}}><Download size={16}/></button>
          <button onClick={()=>{savePhotos(photos.filter(p=>p.id!==lightbox.id));setLightbox(null);}} style={{padding:'8px',borderRadius:'8px',background:'#ef444420',border:'none',cursor:'pointer',color:'#ef4444'}}><Trash2 size={16}/></button>
          <button onClick={()=>setLightbox(null)} style={{padding:'8px',borderRadius:'8px',background:'#ffffff20',border:'none',cursor:'pointer',color:'white'}}><X size={16}/></button>
        </div>
        <img src={lightbox.data} alt={lightbox.name} style={{maxWidth:'90vw',maxHeight:'80vh',objectFit:'contain',borderRadius:'8px'}} onClick={e=>e.stopPropagation()}/>
        <div style={{color:'#ffffff80',fontSize:'12px',marginTop:'12px'}}>{lightbox.name}</div>
      </div>}
    </div>
  );
}