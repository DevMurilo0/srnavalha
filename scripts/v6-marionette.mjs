// Optional Firefox-native test transport. No packages or site runtime dependencies.
import net from 'node:net';
export class Marionette {
  async connect(port = 2836) {
    this.socket = net.connect(port,'127.0.0.1'); this.buffer=Buffer.alloc(0); this.id=0; this.pending=new Map();
    this.socket.on('data', data => {
      this.buffer=Buffer.concat([this.buffer,data]);
      while (true) {
        const colon=this.buffer.indexOf(':'); if(colon<0)return;
        const length=Number(this.buffer.subarray(0,colon).toString()); if(this.buffer.length<colon+1+length)return;
        const message=JSON.parse(this.buffer.subarray(colon+1,colon+1+length).toString()); this.buffer=this.buffer.subarray(colon+1+length);
        if(Array.isArray(message)&&message[0]===1&&this.pending.has(message[1])) {
          const p=this.pending.get(message[1]);clearTimeout(p.timer);this.pending.delete(message[1]);
          message[2]?p.reject(new Error(JSON.stringify(message[2]))):p.resolve(message[3]);
        }
      }
    });
    await new Promise(resolve=>this.socket.on('connect',resolve));
    await this.send('WebDriver:NewSession',{capabilities:{alwaysMatch:{pageLoadStrategy:'eager'}}});return this;
  }
  send(command,params={}) { return new Promise((resolve,reject)=>{
    const id=++this.id;const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Marionette timeout '+command));},25000);
    this.pending.set(id,{resolve,reject,timer});const json=JSON.stringify([0,id,command,params]);this.socket.write(Buffer.byteLength(json)+':'+json);
  }); }
  async execute(script) { return (await this.send('WebDriver:ExecuteScript',{script,args:[],newSandbox:true,sandbox:'default',line:1,filename:'v6-validation'})).value; }
  async preference(name,value) {
    await this.send('Marionette:SetContext',{value:'chrome'});
    const setter=typeof value==='boolean'?'setBoolPref':'setIntPref';
    await this.execute(`Services.prefs.${setter}(${JSON.stringify(name)},${JSON.stringify(value)});`);
    await this.send('Marionette:SetContext',{value:'content'});
  }
  async close(){await this.send('WebDriver:DeleteSession').catch(()=>{});this.socket.end();}
}
