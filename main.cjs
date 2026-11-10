const {app,BrowserWindow,ipcMain,dialog,shell}=require('electron');
const path=require('node:path'); const fs=require('node:fs/promises');
const engine=require('./organizer.cjs');
app.setPath('userData',path.join(app.getPath('appData'),'GhOstOP Studio'));
let win,root,plan,busy=false;
if(!app.requestSingleInstanceLock()){app.quit();}else{
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
const journalPath=()=>path.join(app.getPath('userData'),'last-operation.json');
async function persist(j) { const p=journalPath(); await fs.writeFile(p+'.tmp',JSON.stringify(j,null,2)); await fs.rename(p+'.tmp',p); }
function handle(name,fn) { ipcMain.handle(name,async(event,...args)=>{if(event.sender!==win.webContents || busy) throw Error('Another operation is running'); busy=true;try{return await fn(...args);}finally{busy=false;}}); }
app.whenReady().then(async()=>{
  win=new BrowserWindow({width:1250,height:850,minWidth:920,minHeight:650,backgroundColor:'#101215',title:'GhOstOP Studio',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.setMenuBarVisibility(false); win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());
  handle('choose',async()=>{const r=await dialog.showOpenDialog(win,{properties:['openDirectory']});if(r.canceled)return null;root=r.filePaths[0];plan=null;return root;});
  handle('demo',async()=>{const base=path.join(app.getPath('userData'),'demo-folders');await fs.mkdir(base,{recursive:true}); root=await fs.mkdtemp(path.join(base,'Downloads-'));const samples={'project-notes.md':'# GhOstOP Studio\nBuild a local desktop file organizer.','invoice-november.txt':'Invoice for video editing services. Total INR 4500.','weekend-plans.txt':'Personal plans: guitar practice and a motorcycle ride.','learn-javascript.txt':'Lesson: variables, functions, and arrays.','budget.csv':'Item,Amount\nMicrophone,1200\nLighting,900','channel-settings.json':'{"channel":"GhOstOP LAB"}','thumbnail.svg':'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#bcf566"/><text x="50" y="190" font-size="48">I BUILT THIS?!</text></svg>','random-file.dat':'A sample unknown file.'};for(const [name,data] of Object.entries(samples))await fs.writeFile(path.join(root,name),data); plan=null;return root;});
  handle('scan',async options=>{if(!root)throw Error('Choose a folder first');plan=await engine.scan(root,options);return {...plan,categories:engine.categories};});
  handle('apply',async choices=>{if(!plan)throw Error('Scan the folder first');const result=await engine.organize(plan,choices,persist);plan=null;return result;});
  handle('undo',async()=>{const j=JSON.parse(await fs.readFile(journalPath(),'utf8').catch(()=>{throw Error('No previous operation to undo');}));const result=await engine.undo(j,persist);plan=null;return result;});
  handle('open',async()=>{if(root) return shell.openPath(root);});
  await win.loadFile(path.join(__dirname,'ui/index.html'));
  win.show();
  win.focus();
});
app.on('window-all-closed',()=>app.quit());
}
